"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { SiteStudio } from "./SiteStudio";
import { Copy, ExternalLink, Loader2, Search, RefreshCw, ChevronDown } from "lucide-react";
import type { RankedLead, MarketResearchResult } from "@/lib/types";
import { getNichePlaybook } from "@/lib/niche-playbooks";
import { buildDesignDirectives } from "@/lib/design-directives";
import { briefToExportSection } from "@/lib/generation/prompts";
import type { CreativeBrief } from "@/lib/generation/brief";
import { detectLocale } from "@/lib/locale";
import { toast } from "sonner";

const PLATFORMS = [
  { id: "claude-ai", label: "Claude.ai or ChatGPT", url: "https://claude.ai" },
  { id: "lovable", label: "Lovable", url: "https://lovable.dev" },
  { id: "bolt", label: "Bolt.new", url: "https://bolt.new" },
  { id: "claude-code", label: "Claude Code", url: "https://claude.com/claude-code" },
  { id: "codex", label: "Codex", url: "https://chat.openai.com" },
];

export function Phase4Build({
  selected,
  onNext,
  onPrev,
}: {
  selected: RankedLead | null;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [platform, setPlatform] = useState("claude-ai");
  const [showPrompt, setShowPrompt] = useState(false);
  // The direction belongs to one lead. Storing the lead id with it means switching leads clears it without an effect.
  const [briefState, setBriefState] = useState<{ leadId: string; brief: CreativeBrief } | null>(null);
  const brief = briefState && selected && briefState.leadId === selected.id ? briefState.brief : null;
  function setBrief(b: CreativeBrief | null) {
    setBriefState(b && selected ? { leadId: selected.id, brief: b } : null);
  }
  const [research, setResearch] = useState<MarketResearchResult[] | null>(null);
  const [researching, setResearching] = useState(false);
  const [researchConfigured, setResearchConfigured] = useState(true);
  const [researchError, setResearchError] = useState<string | null>(null);

  async function runResearch(l: RankedLead) {
    setResearching(true);
    setResearchError(null);
    try {
      const res = await fetch("/api/market-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: l.category, city: l.city }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResearchError(data.error ?? "Research failed");
        setResearch([]);
      } else {
        setResearch(data.results ?? []);
        setResearchConfigured(data.configured !== false);
      }
    } catch (e) {
      setResearchError(e instanceof Error ? e.message : "Research failed");
      setResearch([]);
    } finally {
      setResearching(false);
    }
  }

  // Kick off live research once per lead (not on every platform toggle). A new lead also clears the old direction.
  useEffect(() => {
    if (!selected) return;
    setResearch(null);
    setResearchError(null);
    runResearch(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const prompt = useMemo(() => (selected ? buildPrompt(selected, platform, research ?? undefined, brief) : ""), [selected, platform, research, brief]);

  function copyPrompt() {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied. Paste into " + PLATFORMS.find((p) => p.id === platform)?.label);
  }

  function openPlatform() {
    const url = PLATFORMS.find((p) => p.id === platform)?.url;
    if (url) window.open(url, "_blank");
  }

  const subtitle = "We decide the creative direction for this business first, then build the page and show it live. Nothing to unzip or deploy.";

  if (!selected) {
    return (
      <PhaseShell title="Phase 4 — Generate website" subtitle={subtitle} onPrev={onPrev} onNext={onNext} nextDisabled nextLabel="Draft outreach">
        <IncompleteState
          title="No lead selected yet"
          description="Run scrape and audit, then pick the highest-scoring prospect in Phase 3. We'll design and build a website for them."
          prevPhaseLabel="Rank"
          onPrev={onPrev}
        />
      </PhaseShell>
    );
  }

  return (
    <PhaseShell title="Phase 4 — Generate website" subtitle={subtitle} onPrev={onPrev} onNext={onNext} nextLabel="Draft outreach">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Selected lead</div>
        <div className="font-display text-2xl mt-1">{selected.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{selected.address}</div>
      </div>

      <SiteStudio key={selected.id} lead={selected} research={research} brief={brief} onBrief={setBrief} />

      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
          <button type="button" onClick={() => setShowPrompt((v) => !v)} className="flex items-center gap-2 text-left">
            <CardTitle>Prompt for other tools</CardTitle>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showPrompt ? "rotate-180" : ""}`} />
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              {researching ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Researching {selected.category} market…</>
              ) : research && research.length > 0 ? (
                <><Search className="h-3 w-3" /> {research.length} research sources</>
              ) : researchError ? (
                <span className="text-amber-600">Live research unavailable</span>
              ) : !researchConfigured ? (
                <span>Add TAVILY_API_KEY for live research</span>
              ) : null}
            </div>
            <Button size="icon-xs" variant="ghost" onClick={() => runResearch(selected)} disabled={researching} title="Refresh live research">
              <RefreshCw className={`h-3.5 w-3.5 ${researching ? "animate-spin" : ""}`} />
            </Button>
            <Select value={platform} onValueChange={(v) => v && setPlatform(v)}>
              <SelectTrigger className="w-[190px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={openPlatform}><ExternalLink className="h-4 w-4 mr-2" /> Open</Button>
            <Button onClick={copyPrompt}><Copy className="h-4 w-4 mr-2" /> Copy prompt</Button>
          </div>
        </CardHeader>
        {showPrompt ? (
          <CardContent>
            {!brief ? (
              <div className="text-xs text-amber-600 mb-2">No creative direction yet, so this prompt falls back to the generic structure. Create the direction above first for a distinctive result.</div>
            ) : null}
            <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 rounded-md p-4 max-h-[520px] overflow-y-auto border border-border">{prompt}</pre>
          </CardContent>
        ) : null}
      </Card>
    </PhaseShell>
  );
}

function buildPrompt(l: RankedLead, platform: string, research?: MarketResearchResult[], brief?: CreativeBrief | null): string {
  const name = l.name;
  const niche = l.category;
  const phone = l.phone ?? "[REPLACE: phone number]";
  const whatsapp = l.whatsapp ?? phone;
  const addr = l.address;
  const rating = l.rating;
  const reviews = l.reviewsCount ?? 0;
  const gap = l.audit.biggestGap;
  const city = l.city.split(",")[0];
  const pb = getNichePlaybook(niche);
  const locale = detectLocale(l);

  const sections = [
    `Hero: Business name + promise (${pb.heroAngle}) + "${pb.primaryCTA}" CTA + rating badge`,
    `Trust strip: "${[rating ? `${rating}★ on Google` : null, reviews ? `${reviews.toLocaleString("en-US")}+ reviews` : null, l.yearsInBusiness ? `${l.yearsInBusiness}+ years in ${city}` : null].filter(Boolean).join(" · ") || "[REPLACE: real proof points]"}" (only these facts, nothing invented)`,
    `Services/offerings grid: 6 cards — pick the 6 most-searched services for a ${niche} in this market. If the business has no public list, start from: ${pb.serviceExamples.join(", ")}`,
    `About + owner/team bio: 2-col, photo placeholder + credentials + years`,
    ...pb.signatureSections,
    `Reviews: the rating and review count as proof. Real quotes only if provided; otherwise a [REPLACE: add 3 real Google reviews] slot. Never invent testimonials.`,
    `FAQ accordion: answer what a first-time ${niche} customer actually asks — specifically: ${pb.faqTopics.join("; ")}`,
    `Location: Google Maps embed of ${addr} + business hours table + directions CTA`,
    `Footer: WhatsApp + Phone + Address + Hours + social icons (Instagram, Google)`,
  ];

  return `You are building a high-converting local-business website for a ${niche} in ${l.city}.

# BUSINESS
Name: ${name}
Category: ${niche}
Address: ${addr}
Phone: ${phone}
WhatsApp: ${whatsapp}
Google rating: ${rating ? `${rating}★` : "n/a"} (${reviews.toLocaleString("en-US")} reviews)
Biggest current gap: ${gap}

# INSPIRATION — what the best ${niche} sites do right now
${pb.inspiration.map((i) => `- ${i}`).join("\n")}
${
  research && research.length > 0
    ? `\n# LIVE MARKET RESEARCH — pulled just now for "${niche}" in ${city}\n${research.map((r) => `- ${r.title}: ${r.snippet} (${r.url})`).join("\n")}\n\nUse this as real-world context for what's actually ranking/operating in this exact market right now — on top of the general ${niche} best practices above, not instead of them.\n`
    : ""
}
${brief ? briefToExportSection(brief) : buildDesignDirectives(l, pb, l.audit, locale.mobileTrafficNote)}
- Floating WhatsApp button (bottom-right) on every page. Click → wa.me/${whatsapp.replace(/\D/g, "")}
- Click-to-call phone in header. tel:${phone.replace(/\s/g, "")}
- Trust signals to weave in: ${pb.trustSignals.join(", ")}.
- ${pb.photographyNote}

${brief ? "" : `# SECTIONS (in order)\n${sections.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n`}# SEO & TECHNICAL
- HTML lang="${locale.htmlLang}"
- Meta: "${name} | ${niche} in ${l.city} | ${pb.primaryCTA}"
- LocalBusiness schema markup (pick the closest @type for a ${niche}) in JSON-LD: name, address, geo, telephone, openingHours, aggregateRating
- All images <img loading="lazy" alt="...">
- Lighthouse mobile 90+: minify, no blocking JS, preload hero image
- HTTPS, semantic HTML, accessible color contrast

# COPY TONE
${locale.copyToneGuidance}

# CTA HIERARCHY
Primary: ${pb.primaryCTA}. Secondary: ${pb.secondaryCTA}. Tertiary: Google Maps directions.

${
  platform === "lovable" || platform === "bolt"
    ? `OUTPUT: Single-page React + Tailwind site. No backend. Build atmosphere from type, gradients and inline SVG as the creative direction describes. Where a real photo belongs, leave an art-directed frame labelled [REPLACE: photo of ...]. Do not use generic stock photos.`
    : platform === "claude-code"
      ? "OUTPUT: Next.js 15 app with app router, Tailwind, shadcn. Single landing page route. Include Suspense boundaries."
      : `OUTPUT: ONE self-contained index.html file. Inline all CSS and JavaScript. The only external resource allowed is a Google Fonts link. Return it as a single artifact (Claude) or canvas (ChatGPT) so it renders as a live preview. Do NOT output a project, a zip, a folder structure or multiple files.`
}

Generate now. Then list 3 sentences I can use to show the owner why this beats their current ${l.audit.hasWebsite ? "outdated site" : "Google listing only"}.`;
}
