"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Stepper } from "@/components/Stepper";
import { DashboardNav } from "@/components/DashboardNav";
import { RunOverview } from "@/components/RunOverview";
import { Phase1Scrape } from "@/components/Phase1Scrape";
import { Phase2Audit } from "@/components/Phase2Audit";
import { Phase3Rank } from "@/components/Phase3Rank";
import { Phase4Build } from "@/components/Phase4Build";
import { Phase5Outreach } from "@/components/Phase5Outreach";
import { SavedLeads } from "@/components/SavedLeads";
import { Button } from "@/components/ui/button";
import { scoreLead } from "@/lib/scoring";
import { auditFromSaved, leadFromSaved } from "@/lib/saved-leads";
import type { Doc } from "../../../convex/_generated/dataModel";
import type { Lead, AuditResult } from "@/lib/types";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

// The dashboard shell, rebuilt in the shape of the reference dashboard:
// a sidebar on desktop (logo, phase nav with an animated active pill,
// saved leads, account controls at the bottom), a greeting and an overview
// strip at the top of the content, and each phase as a card screen that
// glides in. Phones keep a compact top bar and the Stepper. The landing
// page is a different tree and is not touched by any of this.
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Page() {
  const { user } = useUser();
  const [view, setView] = useState<"pipeline" | "saved">("pipeline");
  const [phase, setPhase] = useState(1);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [audits, setAudits] = useState<Record<string, AuditResult>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const completed = useMemo(() => {
    const s = new Set<number>();
    if (leads.length > 0) s.add(1);
    if (Object.keys(audits).length > 0) s.add(2);
    if (selectedId) {
      s.add(3);
      s.add(4);
    }
    return s;
  }, [leads, audits, selectedId]);

  const selectedRanked = useMemo(() => {
    if (!selectedId) return null;
    const lead = leads.find((l) => l.id === selectedId);
    const audit = audits[selectedId];
    if (!lead || !audit) return null;
    return scoreLead(lead, audit);
  }, [selectedId, leads, audits]);

  // Reopen a saved lead as the run's selected prospect: its snapshot becomes
  // the lead and audit the phases work on, merged into whatever run is in
  // progress, and the pipeline lands on Build, where the work resumes.
  function openSavedLead(doc: Doc<"savedLeads">) {
    const lead = leadFromSaved(doc);
    const audit = auditFromSaved(doc);
    setLeads((prev) => [lead, ...prev.filter((l) => l.id !== lead.id)]);
    setAudits((prev) => ({ ...prev, [lead.id]: audit }));
    setSelectedId(lead.id);
    setPhase(4);
    setView("pipeline");
  }

  const firstName = user?.firstName ?? null;

  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-foreground focus:text-background focus:px-3 focus:py-2 focus:rounded-md focus:text-sm"
      >
        Skip to content
      </a>

      <DashboardNav
        view={view}
        phase={phase}
        completed={completed}
        onPhase={(n) => setPhase(n)}
        onView={(v) => setView(v)}
      />

      <div className="min-w-0 flex-1">
        {/* Phone top bar: below md the sidebar steps aside for this. */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
            <Link href="/" aria-label="Outrive home"><Logo /></Link>
            <div className="flex items-center gap-2">
              <Button variant={view === "pipeline" ? "default" : "outline"} size="sm" onClick={() => setView("pipeline")}>Pipeline</Button>
              <Button variant={view === "saved" ? "default" : "outline"} size="sm" onClick={() => setView("saved")}>Saved leads</Button>
              <ThemeToggle />
              <UserButton />
            </div>
          </div>
          {view === "pipeline" && <Stepper current={phase} completed={completed} onJump={(n) => setPhase(n)} />}
        </header>

        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
                {greeting()}{firstName ? `, ${firstName}` : ""}
              </h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {view === "saved" ? "every prospect worth keeping, in one place" : "one run, one street, five phases"}
              </p>
            </div>
            <p className="hidden font-mono text-xs text-muted-foreground sm:block">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>

          {view === "pipeline" && (
            <div className="mb-10">
              <RunOverview
                leadsCount={leads.length}
                auditsCount={Object.keys(audits).length}
                completedCount={completed.size}
                selectedName={selectedRanked?.name ?? null}
                selectedScore={selectedRanked?.score ?? null}
              />
            </div>
          )}

          {view === "saved" ? (
            <SavedLeads onOpen={openSavedLead} />
          ) : (
          <AnimatePresence mode="wait">
            {phase === 1 && (
              <Phase1Scrape
                key="p1"
                leads={leads}
                setLeads={setLeads}
                onNext={() => setPhase(2)}
              />
            )}
            {phase === 2 && (
              <Phase2Audit
                key="p2"
                leads={leads}
                audits={audits}
                setAudits={setAudits}
                onNext={() => setPhase(3)}
                onPrev={() => setPhase(1)}
              />
            )}
            {phase === 3 && (
              <Phase3Rank
                key="p3"
                leads={leads}
                audits={audits}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                onNext={() => setPhase(4)}
                onPrev={() => setPhase(2)}
              />
            )}
            {phase === 4 && (
              <Phase4Build
                key="p4"
                selected={selectedRanked}
                onNext={() => setPhase(5)}
                onPrev={() => setPhase(3)}
              />
            )}
            {phase === 5 && (
              <Phase5Outreach
                key="p5"
                selected={selectedRanked}
                onPrev={() => setPhase(4)}
              />
            )}
          </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
