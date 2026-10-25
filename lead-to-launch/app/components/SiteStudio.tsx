"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, RefreshCw, Monitor, Smartphone, Maximize2, X, Download, Copy, Upload, Wand2, Globe, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { RankedLead, MarketResearchResult } from "@/lib/types";
import { extractJson, parseBrief, type CreativeBrief } from "@/lib/generation/brief";
import { DESIGN_KNOWLEDGE } from "@/lib/generation/knowledge";
import { cleanHtml, looksLikeFullPage, sanitizeDemoHtml } from "@/lib/generation/html";
import { buildBriefPrompt, buildSitePrompt } from "@/lib/generation/prompts";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { placeKeyOf } from "@/lib/saved-leads";
import type { Id } from "@/convex/_generated/dataModel";

const RECENT_KEY = "l2l-recent-directions";
type Recent = { concept: string; composition: string };

function readRecent(): Recent[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? v.slice(0, 8) : [];
  } catch {
    return [];
  }
}
function pushRecent(r: Recent) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([r, ...readRecent()].slice(0, 8)));
  } catch {
    /* storage unavailable, the variation memory just resets */
  }
}

function leadPayload(l: RankedLead) {
  return {
    id: l.id, name: l.name, category: l.category, address: l.address, city: l.city, phone: l.phone, whatsapp: l.whatsapp,
    rating: l.rating, reviewsCount: l.reviewsCount, yearsInBusiness: l.yearsInBusiness, lat: l.lat, lng: l.lng, audit: l.audit,
  };
}

/** Chat apps have no system prompt slot here, so the design rules travel at the top of the pasted prompt. */
const withRules = (task: string) => `# YOUR ROLE AND RULES\n${DESIGN_KNOWLEDGE}\n\n# TASK\n${task}`;

type Engine = { provider: "anthropic" | "gemini" | null; model: string | null; allowed: boolean; reason?: string };

/**
 * Paste boxes must never grow the page. The shared Textarea sizes itself
 * to its content, so a long pasted prompt or page stretched the whole
 * studio on a phone. This box stays at one fixed height and scrolls inside
 * itself instead, with a capped drag handle for users who want more room.
 */
function PasteTextarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={`flex h-40 max-h-60 w-full resize-y overflow-y-auto rounded-lg border border-input bg-transparent px-2.5 py-2 text-xs font-mono outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
    />
  );
}

export function SiteStudio({
  lead,
  research,
  brief,
  onBrief,
}: {
  lead: RankedLead;
  research: MarketResearchResult[] | null;
  brief: CreativeBrief | null;
  onBrief: (b: CreativeBrief | null) => void;
}) {
  const [briefLoading, setBriefLoading] = useState(false);
  const [building, setBuilding] = useState(false);
  const [chars, setChars] = useState(0);
  const [html, setHtml] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [full, setFull] = useState(false);
  const [steer, setSteer] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [manualOverride, setManualOverride] = useState(false);
  const [pasteBrief, setPasteBrief] = useState("");
  const [pasteHtml, setPasteHtml] = useState("");
  const [publishing, setPublishing] = useState(false);
  // The lead's live demo, if one has been published. The query keeps the
  // link (and its open count) on screen across rebuilds and refreshes.
  const demo = useQuery(api.demos.byLeadKey, { leadKey: placeKeyOf(lead) });
  const generateUploadUrl = useMutation(api.demos.generateUploadUrl);
  const publishDemoMutation = useMutation(api.demos.publish);
  const demoUrl = demo ? `${typeof window !== "undefined" ? window.location.origin : ""}/demo/${demo.slug}` : null;

  // Which engine is connected decides whether we generate here or hand off to free manual mode.
  useEffect(() => {
    let alive = true;
    fetch("/api/generate/status")
      .then((r) => r.json())
      .then((d) => alive && setEngine(d as Engine))
      .catch(() => alive && setEngine({ provider: null, model: null, allowed: false }));
    return () => {
      alive = false;
    };
  }, []);
  const auto = !!engine?.provider && engine.allowed && !manualOverride;
  const checking = engine === null;

  useEffect(() => () => abortRef.current?.abort(), []);

  async function makeBrief(different: boolean) {
    setBriefLoading(true);
    setError(null);
    try {
      const recent = readRecent();
      if (different && brief) recent.unshift({ concept: brief.concept, composition: brief.composition.name });
      const res = await fetch("/api/generate/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: leadPayload(lead),
          research: (research ?? []).slice(0, 6),
          recent,
          steer: steer.trim() || undefined,
          seed: Math.floor(Math.random() * 2 ** 31),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create a creative direction");
      onBrief(data.brief as CreativeBrief);
      setHtml("");
      pushRecent({ concept: data.brief.concept, composition: data.brief.composition.name });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create a creative direction");
    } finally {
      setBriefLoading(false);
    }
  }

  async function buildSite() {
    if (!brief) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setBuilding(true);
    setError(null);
    setChars(0);
    try {
      const res = await fetch("/api/generate/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: leadPayload(lead), brief }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Build failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      let lastPaint = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        const now = Date.now();
        if (now - lastPaint > 400) {
          setChars(acc.length);
          lastPaint = now;
        }
      }
      const streamError = acc.match(/<!-- L2L_ERROR: ([^>]*) -->/);
      if (streamError) throw new Error(`The build stopped early: ${streamError[1].trim()}`);
      const out = cleanHtml(acc);
      if (!looksLikeFullPage(out)) {
        throw new Error("The model could not finish this page, so nothing has been saved as a finished site. Rebuild, or steer toward a simpler page.");
      }
      setHtml(out);
      setChars(out.length);
      toast.success("Site built. Preview is live.");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Build failed");
    } finally {
      setBuilding(false);
    }
  }

  function copyText(text: string, msg: string) {
    navigator.clipboard.writeText(text);
    toast.success(msg);
  }

  function copyBriefPrompt() {
    const prompt = buildBriefPrompt({ lead: leadPayload(lead), research: research ?? undefined, recent: readRecent(), steer: steer.trim() || undefined, seed: Math.floor(Math.random() * 2 ** 31) });
    copyText(withRules(prompt), "Direction prompt copied. Paste it into any chat.");
  }

  function useBriefFromPaste() {
    try {
      const b = parseBrief(extractJson(pasteBrief));
      onBrief(b);
      pushRecent({ concept: b.concept, composition: b.composition.name });
      setPasteBrief("");
      setHtml("");
      setError(null);
      toast.success("Direction loaded.");
    } catch (e) {
      setError(`That reply did not parse as a creative direction (${e instanceof Error ? e.message : "unknown"}). Paste the whole JSON reply.`);
    }
  }

  function copyBuildPrompt() {
    if (!brief) return;
    copyText(withRules(buildSitePrompt(leadPayload(lead), brief)), "Build prompt copied. Paste it into any chat.");
  }

  function previewFromText(raw: string) {
    const out = cleanHtml(raw);
    if (!looksLikeFullPage(out)) {
      setError("That is not a complete HTML page. If the chat cut off mid-page, tell it to continue or to make the page shorter, then use the whole page.");
      return;
    }
    setError(null);
    setHtml(out);
    toast.success("Preview loaded.");
  }

  function previewFromPaste() {
    previewFromText(pasteHtml);
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onUploadPage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      previewFromText(await file.text());
    } catch {
      setError("That file could not be read. Pick the .html file the chat gave you.");
    }
  }

  function download() {
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${lead.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "site"}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  async function publishDemo() {
    if (!html || publishing) return;
    setPublishing(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "text/html" },
        // Defence in depth: the demo route sanitises again on the server,
        // which is the real boundary, but the stored file should already
        // be the safe version, not the raw preview HTML.
        body: new Blob([sanitizeDemoHtml(html)], { type: "text/html" }),
      });
      if (!res.ok) throw new Error("The upload failed");
      const { storageId } = (await res.json()) as { storageId: string };
      await publishDemoMutation({
        storageId: storageId as Id<"_storage">,
        businessName: lead.name,
        leadKey: placeKeyOf(lead),
      });
      toast.success("Demo is live. The link sits above the preview, and Outreach now uses it.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Publishing failed");
    } finally {
      setPublishing(false);
    }
  }

  function copyDemoLink() {
    if (!demoUrl) return;
    navigator.clipboard.writeText(demoUrl);
    toast.success("Demo link copied");
  }

  function copyHtml() {
    navigator.clipboard.writeText(html);
    toast.success("HTML copied");
  }

  // The generated page is untrusted output. Sandbox without allow-same-origin so it cannot touch this app's cookies or storage.
  const frame = (h: string, cls: string) => (
    <iframe
      title="Generated site preview"
      srcDoc={h}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      className={cls}
    />
  );

  const previewBox = (h: string, tall: string) => (
    <div className={`mx-auto transition-all ${device === "mobile" ? "w-[390px] max-w-full rounded-[28px] border-[6px] border-foreground/80 overflow-hidden" : "w-full rounded-lg border border-border overflow-hidden"} ${tall}`}>
      {frame(h, "w-full h-full bg-white")}
    </div>
  );

  const deviceToggle = (
    <div className="flex items-center rounded-md border border-border overflow-hidden">
      <button type="button" onClick={() => setDevice("desktop")} className={`px-2.5 py-1.5 ${device === "desktop" ? "bg-foreground text-background" : "text-muted-foreground"}`} title="Desktop"><Monitor className="h-3.5 w-3.5" /></button>
      <button type="button" onClick={() => setDevice("mobile")} className={`px-2.5 py-1.5 ${device === "mobile" ? "bg-foreground text-background" : "text-muted-foreground"}`} title="Phone"><Smartphone className="h-3.5 w-3.5" /></button>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Creative direction</CardTitle>
          {brief ? (
            <Button size="sm" variant="outline" onClick={() => (auto ? makeBrief(true) : onBrief(null))} disabled={briefLoading || building}>
              {briefLoading ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-2" />} New direction
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {!brief ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Before any code, we decide who this business is: its personality, the page architecture, the palette, the type, and the sections that earn their place. Every business gets its own decision.
              </p>
              <Input value={steer} onChange={(e) => setSteer(e.target.value)} placeholder="Optional steer: darker, more playful, very minimal…" maxLength={300} />
              {checking ? (
                <div className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking AI engine…</div>
              ) : auto ? (
                <>
                  <Button onClick={() => makeBrief(false)} disabled={briefLoading} className="w-full">
                    {briefLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Thinking about {lead.name}…</> : <><Wand2 className="h-4 w-4 mr-2" /> Create creative direction</>}
                  </Button>
                  <button type="button" onClick={() => setManualOverride(true)} className="text-[11px] underline text-muted-foreground">
                    Engine busy? Do it manually with a chat AI instead
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <Button onClick={() => makeBrief(false)} disabled={briefLoading} className="w-full">
                    {briefLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Thinking about {lead.name}…</> : <><Wand2 className="h-4 w-4 mr-2" /> Create creative direction</>}
                  </Button>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    This generates the direction here in the tool. If the engine is not available for your account, the reason shows below and the manual steps stay open.
                  </p>
                  <div className="space-y-2 rounded-md border border-dashed border-border p-3">
                    <div className="text-xs font-medium">Or do it manually with a chat AI</div>
                    <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-0.5">
                      <li>Copy the prompt</li>
                      <li>Paste it into Claude.ai, ChatGPT or Gemini</li>
                      <li>Paste the JSON reply below</li>
                    </ol>
                    {engine?.provider && !engine.allowed && engine.reason ? <div className="text-[11px] text-amber-600">{engine.reason}</div> : null}
                    <Button variant="outline" onClick={copyBriefPrompt} className="w-full"><Copy className="h-3.5 w-3.5 mr-2" /> Copy direction prompt</Button>
                    <PasteTextarea value={pasteBrief} onChange={(e) => setPasteBrief(e.target.value)} placeholder="Paste the JSON reply here" />
                    <Button onClick={useBriefFromPaste} disabled={!pasteBrief.trim()} className="w-full">Use this direction</Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-display text-xl leading-snug">{brief.concept}</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {brief.personality.map((p) => <Badge key={p} variant="secondary" className="font-normal">{p}</Badge>)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Architecture</div>
                <div className="font-medium">{brief.composition.name}</div>
                <div className="text-muted-foreground text-xs leading-relaxed mt-0.5">{brief.composition.why}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Palette: {brief.palette.name}</div>
                <div className="flex gap-1.5">
                  {[brief.palette.bg, brief.palette.surface, brief.palette.text, brief.palette.muted, brief.palette.accent, brief.palette.accent2].filter(Boolean).map((c) => (
                    <div key={c} className="h-7 w-7 rounded-full border border-border" style={{ background: c }} title={c} />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Type</div>
                <div className="text-xs">{brief.typography.display} <span className="text-muted-foreground">for display, </span>{brief.typography.body} <span className="text-muted-foreground">for text</span></div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Sections, in order</div>
                <ol className="space-y-1 text-xs list-decimal list-inside">
                  {brief.sections.map((s) => (
                    <li key={s.id}><span className="font-medium">{s.id}</span> <span className="text-muted-foreground">{s.purpose}</span></li>
                  ))}
                </ol>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Signature</div>
                <div className="text-xs leading-relaxed">{brief.signature}</div>
              </div>
              <div className="rounded-md bg-muted/40 p-3 text-xs leading-relaxed">
                <span className="font-medium">Not a template: </span>{brief.notTemplate}
              </div>
              <div className="flex gap-2">
                <Input value={steer} onChange={(e) => setSteer(e.target.value)} placeholder="Steer the next direction…" maxLength={300} className="h-9" />
              </div>
              {auto ? (
                <button type="button" onClick={() => setManualOverride(true)} className="text-[11px] underline text-muted-foreground">
                  Build it manually with a chat AI instead
                </button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => makeBrief(true)} disabled={briefLoading}>
                  {briefLoading ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Thinking…</> : <><Wand2 className="h-3.5 w-3.5 mr-2" /> Generate a new direction here</>}
                </Button>
              )}
            </div>
          )}
          {error ? <div className="text-xs text-[color:var(--destructive)] leading-relaxed">{error}</div> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle>Live preview</CardTitle>
          <div className="flex items-center gap-2">
            {html ? (
              <>
                {deviceToggle}
                <Button size="icon-xs" variant="ghost" onClick={() => setFull(true)} title="Full screen"><Maximize2 className="h-3.5 w-3.5" /></Button>
                <Button size="icon-xs" variant="ghost" onClick={copyHtml} title="Copy HTML"><Copy className="h-3.5 w-3.5" /></Button>
                <Button size="icon-xs" variant="ghost" onClick={download} title="Download .html"><Download className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="secondary" onClick={publishDemo} disabled={publishing}>
                  {publishing ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Globe className="h-3.5 w-3.5 mr-2" />}
                  {demo ? "Republish" : "Publish live link"}
                </Button>
              </>
            ) : null}
            <Button size="sm" onClick={buildSite} disabled={!brief || building || briefLoading}>
              {building ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Building</> : <><Sparkles className="h-3.5 w-3.5 mr-2" /> {html ? "Rebuild" : "Build site"}</>}
            </Button>
            {!auto ? (
              <Button size="sm" variant="outline" onClick={copyBuildPrompt} disabled={!brief}>
                <Copy className="h-3.5 w-3.5 mr-2" /> Copy build prompt
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {demo && demoUrl ? (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
              <span className="flex items-center gap-1.5 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live demo link
              </span>
              <a href={demoUrl} target="_blank" rel="noreferrer" className="break-all font-mono text-xs text-primary underline-offset-2 hover:underline">
                {demoUrl}
              </a>
              <Button size="icon-xs" variant="ghost" onClick={copyDemoLink} title="Copy demo link"><Copy className="h-3.5 w-3.5" /></Button>
              <a href={demoUrl} target="_blank" rel="noreferrer" title="Open the live demo">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
              <span className="ml-auto text-xs text-muted-foreground">
                {demo.views > 0 ? `Opened ${demo.views} ${demo.views === 1 ? "time" : "times"}` : "Not opened yet"}
              </span>
            </div>
          ) : null}
          {!auto && !checking ? (
            <div className="mb-3 space-y-2">
              <div className="text-xs font-medium">Paste a finished page</div>
              <PasteTextarea value={pasteHtml} onChange={(e) => setPasteHtml(e.target.value)} placeholder="Paste the full HTML from the chat here. Works with or without a creative direction." />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={previewFromPaste} disabled={!pasteHtml.trim()}>Preview this page</Button>
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-2" /> Upload an .html file
                </Button>
                <input ref={fileInputRef} type="file" accept=".html,.htm,text/html" onChange={onUploadPage} className="hidden" aria-label="Upload an HTML file" />
              </div>
            </div>
          ) : null}
          {html ? (
            previewBox(html, "h-[620px]")
          ) : (
            <div className="h-[620px] rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-center px-8 gap-2 text-muted-foreground">
              {building ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <div className="text-sm">Designing and coding the page</div>
                  <div className="text-xs tabular-nums">{chars.toLocaleString("en-US")} characters written. This usually takes one to three minutes.</div>
                </>
              ) : (
                <div className="text-sm">{!brief ? (auto ? "Create the creative direction first, then build." : "Paste a finished page above, or set the creative direction first.") : auto ? "Direction ready. Build the site to see it here." : "Copy the build prompt, paste it into a chat, then paste the HTML reply above."}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {full && html ? (
        <div className="fixed inset-0 z-[60] bg-background flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <div className="text-sm font-medium truncate">{lead.name}</div>
            <div className="flex items-center gap-2">
              {deviceToggle}
              <Button size="icon-xs" variant="ghost" onClick={() => setFull(false)} title="Close"><X className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 p-3 bg-muted/30">{previewBox(html, "h-full")}</div>
        </div>
      ) : null}
    </div>
  );
}
