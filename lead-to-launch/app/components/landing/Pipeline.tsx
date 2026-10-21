"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AuditReceipt, EXAMPLE_ROWS } from "./AuditReceipt";
import { Reveal, SectionKicker } from "@/components/motion/ui";

const EASE = [0.23, 1, 0.32, 1] as const;

const STEPS = [
  { name: "Scrape", line: "Pick a niche and a city. It pulls businesses from Google Maps with their ratings, reviews, phone numbers and map positions." },
  { name: "Audit", line: "It opens each website and checks booking, WhatsApp, mobile setup, search markup, freshness and speed. A Facebook page is called a Facebook page." },
  { name: "Rank", line: "Every lead gets a score for how much a better web presence would matter: gaps found, review volume, rating, and whether you can reach them." },
  { name: "Build", line: "It decides a creative direction for that business first, then builds a sample site and shows it live. Nothing to unzip or deploy." },
  { name: "Outreach", line: "It writes the first message and the follow-up, in English or the local language, for WhatsApp or email, built on the gap it found." },
];

const SCRAPED = [
  { n: "Marlowe Salon", r: "4.9", c: "1,864", w: "dated website" },
  { n: "Studio Nine", r: "4.5", c: "812", w: "Facebook page" },
  { n: "Gul Beauty Lounge", r: "4.3", c: "640", w: "own website" },
  { n: "The Hair Room", r: "4.8", c: "1,126", w: "own website" },
  { n: "Zara Bridal Studio", r: "4.6", c: "395", w: "Instagram page" },
];

const RANKED = [
  { n: "Marlowe Salon", s: 84, why: "Dated site, no booking path, 1,864 reviews, reachable on WhatsApp" },
  { n: "Zara Bridal Studio", s: 77, why: "Instagram only, 395 reviews, phone listed" },
  { n: "Studio Nine", s: 71, why: "Facebook only, 812 reviews" },
  { n: "The Hair Room", s: 52, why: "Site loads, no booking path, 1,126 reviews" },
  { n: "Gul Beauty Lounge", s: 18, why: "Site passes most checks" },
];

function Specimen({ i }: { i: number }) {
  if (i === 0)
    return (
      <div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {[["Niche", "Salon"], ["Location", "Austin, Texas"], ["Count", "25"]].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-background/60 px-3 py-2">
              <div className="text-[11px] text-muted-foreground">{k}</div>
              <div className="mt-0.5 truncate">{v}</div>
            </div>
          ))}
        </div>
        <ul className="mt-4 divide-y divide-border/80">
          {SCRAPED.map((l) => (
            <li key={l.n} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
              <span className="truncate">{l.n}</span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{l.r} stars, {l.c}, {l.w}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  if (i === 1) return <AuditReceipt rows={EXAMPLE_ROWS.slice(0, 5)} />;
  if (i === 2)
    return (
      <ul className="space-y-4">
        {RANKED.map((l) => (
          <li key={l.n}>
            <div className="flex items-baseline justify-between text-sm">
              <span>{l.n}</span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{l.s}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-lamp" style={{ width: `${l.s}%`, opacity: 0.35 + l.s / 160 }} />
            </div>
            <div className="mt-1.5 text-xs text-muted-foreground">{l.why}</div>
          </li>
        ))}
      </ul>
    );
  if (i === 3)
    return (
      <div className="text-sm">
        <div className="font-display text-xl leading-snug">A salon that feels like a quiet atelier, where the visit itself is the pitch.</div>
        <dl className="mt-5 space-y-3.5">
          <div className="flex gap-4"><dt className="w-24 shrink-0 text-muted-foreground">Architecture</dt><dd>Ritual steps: arrive, consult, treat, leave</dd></div>
          <div className="flex gap-4">
            <dt className="w-24 shrink-0 text-muted-foreground">Palette</dt>
            <dd className="flex items-center gap-2">
              {["#F3E9E2", "#FBF6F2", "#2A1F1C", "#7A6A62", "#B5533C"].map((c) => (
                <span key={c} className="h-5 w-5 rounded-full border border-white/10" style={{ background: c }} />
              ))}
              <span className="text-muted-foreground">Rose clay and ink</span>
            </dd>
          </div>
          <div className="flex gap-4"><dt className="w-24 shrink-0 text-muted-foreground">Type</dt><dd>Fraunces for headlines, Manrope for text</dd></div>
          <div className="flex gap-4"><dt className="w-24 shrink-0 text-muted-foreground">Sections</dt><dd>the-chair, bridal-trials, price-index, find-us</dd></div>
        </dl>
      </div>
    );
  return (
    <div className="space-y-3">
      <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-[#14211C] px-4 py-3 text-sm leading-relaxed text-[#D7E6DF]">
        Hi, I was looking at Marlowe Salon online. 1,864 reviews, but the homepage has no way to book. I rebuilt it as a sample so you can see the difference. Two minutes to look?
      </div>
      <p className="text-xs text-muted-foreground">Written for WhatsApp. It also drafts the email and the follow-up, matched to the lead's language.</p>
    </div>
  );
}

export function Pipeline() {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();

  return (
    <section id="how" className="scroll-mt-24 border-y border-border/60 bg-card/30 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionKicker text="the pipeline" />
          <h2 className="title-heavy font-display text-4xl leading-[1.05] sm:text-5xl">Five steps, one pipeline.</h2>
        </Reveal>
        <Reveal delay={0.1}>
        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div role="tablist" aria-label="Pipeline steps" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible">
            {STEPS.map((s, n) => (
              <button
                key={s.name}
                role="tab"
                id={`tab-${n}`}
                aria-selected={i === n}
                aria-controls="pipeline-panel"
                onClick={() => setI(n)}
                className={cn(
                  "shrink-0 rounded-xl border px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full",
                  i === n ? "border-border bg-card" : "border-transparent text-muted-foreground hover:border-border/60 hover:text-foreground",
                )}
              >
                <div className="flex items-baseline gap-3">
                  <span className={cn("font-mono text-xs tabular-nums", i === n ? "text-lamp" : "text-muted-foreground/70")}>{n + 1}</span>
                  <span className="font-display text-lg">{s.name}</span>
                </div>
                {i === n ? <p className="mt-2 hidden text-sm leading-relaxed text-muted-foreground lg:block">{s.line}</p> : null}
              </button>
            ))}
          </div>

          <div id="pipeline-panel" role="tabpanel" aria-labelledby={`tab-${i}`} className="min-h-[360px] rounded-2xl border border-border bg-card p-6 sm:p-8">
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground lg:hidden">{STEPS[i].line}</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={i}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: reduce ? 0 : 0.22, ease: EASE }}
              >
                <Specimen i={i} />
              </motion.div>
            </AnimatePresence>
            <p className="mt-6 text-xs text-muted-foreground/80">Example output with invented businesses.</p>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
