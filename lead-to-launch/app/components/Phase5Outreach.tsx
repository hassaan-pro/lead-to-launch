"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { MessageCircle, Mail, Camera, Copy, ExternalLink, Sparkles } from "lucide-react";
import type { RankedLead, OutreachChannel, OutreachLanguage } from "@/lib/types";
import { OUTREACH_LANGUAGES, detectOutreachLanguage, languageDir } from "@/lib/outreach-languages";
import { EMAIL_SUBJECTS, buildOutreach } from "@/lib/outreach-templates";
import { toast } from "sonner";

export function Phase5Outreach({
  selected,
  onPrev,
}: {
  selected: RankedLead | null;
  onPrev: () => void;
}) {
  const [channel, setChannel] = useState<OutreachChannel>("whatsapp");
  const [lang, setLang] = useState<OutreachLanguage>("english");
  const [message, setMessage] = useState("");
  const [followUp, setFollowUp] = useState("");

  // Default the language to the lead's own market. The picker can
  // override it; detection only sets the starting language.
  useEffect(() => {
    if (!selected) return;
    setLang(detectOutreachLanguage(selected));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  useEffect(() => {
    if (!selected) return;
    const m = buildOutreach(selected, channel, lang);
    setMessage(m.first);
    setFollowUp(m.followUp);
  }, [selected, channel, lang]);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  function openChannel() {
    if (!selected) return;
    if (channel === "whatsapp" && selected.whatsapp) {
      const num = selected.whatsapp.replace(/\D/g, "");
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, "_blank");
    } else if (channel === "email" && selected.email) {
      const subject = EMAIL_SUBJECTS[lang];
      window.open(`mailto:${selected.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, "_blank");
    } else if (channel === "instagram") {
      // Instagram DMs cannot be automated. Copy the draft and open
      // Instagram so the user pastes it into the DM themselves.
      copy(message);
      window.open(`https://instagram.com/`, "_blank");
    } else {
      toast.error("No contact for this channel");
    }
  }

  if (!selected) {
    return (
      <PhaseShell
        title="Write the outreach"
        subtitle="Matches the message language to where this lead is based. Built-in day-3 follow-up."
        onPrev={onPrev}
      >
        <IncompleteState
          title="No lead selected yet"
          description="Outreach drafts are tailored to a specific lead — picking up name, biggest gap, review count, and reachable channels. Run earlier phases and select a prospect to see WhatsApp, email, and Instagram drafts here."
          prevPhaseLabel="Rank"
          onPrev={onPrev}
        />
      </PhaseShell>
    );
  }

  const channels: { id: OutreachChannel; label: string; icon: typeof MessageCircle; enabled: boolean }[] = [
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, enabled: !!selected.whatsapp },
    { id: "email", label: "Email", icon: Mail, enabled: !!selected.email },
    { id: "instagram", label: "Instagram", icon: Camera, enabled: true },
  ];

  return (
    <PhaseShell title="Write the outreach" subtitle="Matches the message language to where this lead is based. Built-in day-3 follow-up." onPrev={onPrev}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] text-muted-foreground">Sending to</div>
          <div className="font-display text-2xl mt-1">{selected.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{selected.phone}{selected.email ? ` · ${selected.email}` : ""}</div>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="lang" className="text-sm">Language</Label>
          <Select value={lang} onValueChange={(v) => setLang(v as OutreachLanguage)}>
            <SelectTrigger id="lang" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OUTREACH_LANGUAGES.map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {channels.map(({ id, label, icon: Icon, enabled }) => (
          <Button
            key={id}
            variant={channel === id ? "default" : "outline"}
            size="sm"
            disabled={!enabled}
            onClick={() => setChannel(id)}
          >
            <Icon className="h-4 w-4 mr-2" /> {label}
          </Button>
        ))}
      </div>

      {channel === "instagram" && (
        <p className="text-xs text-muted-foreground mb-4">Instagram DMs cannot be automated. The button copies the message and opens Instagram so you can paste it.</p>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>First message</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => copy(message)}><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</Button>
              <Button size="sm" onClick={openChannel}>{channel === "instagram" ? <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy + open Instagram</> : <><ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Send</>}</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              dir={languageDir(lang)}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="font-mono text-sm min-h-[300px]"
            />
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Hook: personal · Pain: their biggest gap · Demo: live link · CTA: low-friction yes/no
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Day-3 follow-up (auto-draft)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              dir={languageDir(lang)}
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              className="font-mono text-sm min-h-[300px]"
            />
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => copy(followUp)}><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy follow-up</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 bg-accent/40 border-accent">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-base">✓</div>
            <div>
              <div className="font-medium tracking-tight">Pipeline complete</div>
              <div className="text-sm text-muted-foreground">Lead → audit → ranked → site → outreach. Repeat for next prospect in Phase 3.</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PhaseShell>
  );
}

