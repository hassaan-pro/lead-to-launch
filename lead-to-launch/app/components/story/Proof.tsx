"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Bracket } from "@/components/journey/Bracket";
import { ScrollDecode } from "@/components/journey/ScrollDecode";
import { type P, interp, useRange, useSeg, useWindow } from "@/components/journey/motion";
import { useNarrow } from "@/components/journey/narrow";
import { Stage, easeInOut } from "./Stage";

type State = "fail" | "pass" | "unknown";
type Row = { id: string; state: State; neutral: string; label: string; ev: string };

// The order the audit runs its checks in, so the verdicts arrive mixed.
const ROWS: Row[] = [
  { id: "https", state: "pass", neutral: "Secure connection", label: "Secure", ev: "Served over HTTPS" },
  { id: "viewport", state: "fail", neutral: "Mobile viewport", label: "Not built for phones", ev: "No viewport tag, so phones show a shrunken desktop page" },
  { id: "booking", state: "fail", neutral: "Booking path", label: "No online booking path", ev: "No booking button, link or form found on the homepage" },
  { id: "whatsapp", state: "fail", neutral: "WhatsApp link", label: "No WhatsApp tap-to-chat", ev: "No wa.me link anywhere on the page" },
  { id: "prices", state: "unknown", neutral: "Prices", label: "Prices", ev: "Pricing may load with JavaScript, so a basic fetch cannot see it" },
  { id: "images", state: "fail", neutral: "Photos", label: "Almost no photos", ev: "2 images on the homepage" },
  { id: "fresh", state: "fail", neutral: "Freshness", label: "Looks abandoned", ev: "Footer still says © 2017" },
  { id: "schema", state: "fail", neutral: "Search markup", label: "No local business markup", ev: "Google gets no hours, address or services" },
];

// Wide screens: where each row lands, in row units. Headers sit at 0, 7 and 9.
const SLOT: Record<string, number> = { booking: 1, viewport: 2, whatsapp: 3, images: 4, fresh: 5, schema: 6, https: 8, prices: 10 };

const TONE = {
  fail: { glyph: "✕", text: "text-destructive", tint: "bg-destructive/[0.07]" },
  pass: { glyph: "✓", text: "text-ok", tint: "bg-ok/[0.07]" },
  unknown: { glyph: "?", text: "text-muted-foreground", tint: "bg-foreground/[0.05]" },
} as const;

type Timing = { start: number; step: number; units: number; countAt: number; arrive: [number, number] };
// Wide: inspect in the queue, fly to the group, then show the evidence. Phone: inspect and show the evidence in place.
const WIDE: Timing = { start: 0.1, step: 0.09, units: 11, countAt: 0.075, arrive: [0.07, 0.1] };
const PHONE: Timing = { start: 0.06, step: 0.1, units: 8, countAt: 0.035, arrive: [0.03, 0.07] };

function ProofRow({ row, index, p, compact }: { row: Row; index: number; p: P; compact: boolean }) {
  const T = compact ? PHONE : WIDE;
  const U = 100 / T.units;
  const t0 = T.start + index * T.step;
  const verdictSeg = useSeg(p, t0, t0 + 0.035);
  const arrive = useSeg(p, t0 + T.arrive[0], t0 + T.arrive[1]);
  const moveA = t0 + 0.035;
  const moveB = t0 + 0.075;

  const top = useTransform(p, (v) => (compact ? `${index * U}%` : `${interp(v, [moveA, moveB], [index * U, SLOT[row.id] * U], easeInOut)}%`));
  const left = useTransform(p, (v) => (compact ? "0%" : `${interp(v, [moveA, moveB], [0, 35], easeInOut)}%`));
  const width = useTransform(p, (v) => (compact ? "100%" : `${interp(v, [moveA, moveB], [29, 65], easeInOut)}%`));

  const verdictOn = useRange(verdictSeg, [0, 0.3], [0, 1]);
  const pendingOut = useRange(verdictSeg, [0, 0.3], [1, 0]);
  const neutralOn = useRange(arrive, [0, 0.4], [1, 0]);
  const labelOn = useRange(arrive, [0.2, 0.7], [0, 1]);
  const evidenceOn = useRange(arrive, [0, 0.2], [0, 1]);
  const bracket = useWindow(p, t0 - 0.008, t0, t0 + 0.035, t0 + 0.06);
  const tone = TONE[row.state];

  return (
    <motion.div style={{ top, left, width, height: `${U}%` }} className="absolute">
      <div className="relative flex h-full items-center gap-3.5 border-b border-border/70 px-3 md:gap-4 md:px-4">
        <motion.span style={{ opacity: verdictOn }} className={cn("pointer-events-none absolute inset-0", tone.tint)} />
        <span className="relative w-4 shrink-0 text-center font-mono text-sm leading-5">
          <motion.span style={{ opacity: pendingOut }} className="absolute inset-0 text-muted-foreground/60">○</motion.span>
          <motion.span style={{ opacity: verdictOn }} className={cn("absolute inset-0", tone.text)}>{tone.glyph}</motion.span>
        </span>
        <div className="relative min-w-0 flex-1">
          <div className="relative h-5 text-[14px] leading-5 md:text-[15px]">
            <motion.span style={{ opacity: neutralOn }} className="absolute left-0 top-0 whitespace-nowrap text-muted-foreground">{row.neutral}</motion.span>
            <motion.span style={{ opacity: labelOn }} className="absolute left-0 top-0 whitespace-nowrap">{row.label}</motion.span>
          </div>
          <motion.div style={{ opacity: evidenceOn }} className="mt-0.5 font-mono text-[10.5px] leading-[14px] text-muted-foreground md:text-[11px] md:leading-4">
            <ScrollDecode text={row.ev} progress={arrive} />
          </motion.div>
        </div>
        <motion.div style={{ opacity: bracket }} className="pointer-events-none absolute -inset-x-1 inset-y-0.5">
          <Bracket />
        </motion.div>
      </div>
    </motion.div>
  );
}

function GroupHeader({ unit, label, count, appear, p, className }: { unit: number; label: string; count: number; appear: number; p: P; className: string }) {
  const U = 100 / WIDE.units;
  const opacity = useRange(p, [appear - 0.035, appear], [0, 1]);
  return (
    <motion.div style={{ opacity, top: `${unit * U}%`, left: "35%", width: "65%", height: `${U}%` }} className="absolute flex items-end justify-between border-b border-border px-4 pb-2">
      <span className={cn("font-display text-lg", className)}>{label}</span>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">{count}</span>
    </motion.div>
  );
}

export function Proof() {
  return (
    <Stage id="proof-story" label="How every gap is checked and sorted" vh={400}>
      {(p) => <ProofScene p={p} />}
    </Stage>
  );
}

function ProofScene({ p }: { p: P }) {
  const compact = useNarrow();
  const T = compact ? PHONE : WIDE;
  const [counts, setCounts] = useState({ fail: 0, pass: 0, unknown: 0 });
  useMotionValueEvent(p, "change", (v) => {
    const c = { fail: 0, pass: 0, unknown: 0 };
    ROWS.forEach((r, i) => {
      if (v >= T.start + i * T.step + T.countAt) c[r.state]++;
    });
    setCounts((prev) => (prev.fail === c.fail && prev.pass === c.pass && prev.unknown === c.unknown ? prev : c));
  });

  // A group header appears just before its first row lands.
  const arrive = (state: State) => Math.min(...ROWS.map((r, i) => (r.state === state ? WIDE.start + i * WIDE.step + 0.07 : 9)));
  const foot = useRange(p, [0.86, 0.92], [0, 1]);
  const headOn = useRange(p, [0, 0.04], [0, 1]);

  return (
    <>
      <motion.div style={{ opacity: headOn }} className="absolute left-[6%] right-[6%] top-[10%] md:right-auto md:top-[27%] md:w-[28%] md:max-w-md">
        <h2 className="title-heavy font-display text-[clamp(1.9rem,3.8vw,3.4rem)] leading-[1.04]">Every gap comes with proof.</h2>
        <p className="mt-3 text-[14.5px] leading-snug text-muted-foreground short:hidden md:mt-6 md:text-lg md:leading-relaxed">
          Telling a business its website is outdated gets ignored. Telling it there is no booking button on the homepage gets checked, and believed.
        </p>
        <motion.p style={{ opacity: foot }} className="mt-5 hidden text-[15px] leading-relaxed text-foreground/80 md:block">
          And when a check cannot be made, it says so. A site that only loads with JavaScript is marked couldn&apos;t check, never failed.
        </motion.p>
      </motion.div>

      {compact ? (
        <div aria-hidden="true" className="absolute inset-x-[5%] top-[28%] short:top-[19%]">
          <div className="mb-2 flex items-center justify-between border-b border-border px-3 pb-2 font-mono text-[11px] tabular-nums">
            <span className="text-destructive">gaps {counts.fail}</span>
            <span className="text-ok">passed {counts.pass}</span>
            <span className="text-muted-foreground">couldn&apos;t check {counts.unknown}</span>
          </div>
          <div className="relative h-[50svh] short:h-[64svh]">
            {ROWS.map((r, i) => (
              <ProofRow key={r.id} row={r} index={i} p={p} compact />
            ))}
          </div>
        </div>
      ) : (
        <div aria-hidden="true" className="absolute right-[5%] top-[13%] h-[70%] w-[57%] min-w-[460px]">
          <div className="absolute -top-6 left-3 font-mono text-[11px] text-muted-foreground">checks, in the order they run</div>
          {ROWS.map((r, i) => (
            <ProofRow key={r.id} row={r} index={i} p={p} compact={false} />
          ))}
          <GroupHeader unit={0} label="Gaps" count={counts.fail} appear={arrive("fail")} p={p} className="text-destructive" />
          <GroupHeader unit={7} label="Passed" count={counts.pass} appear={arrive("pass")} p={p} className="text-ok" />
          <GroupHeader unit={9} label="Couldn't check" count={counts.unknown} appear={arrive("unknown")} p={p} className="text-muted-foreground" />
        </div>
      )}

      <ul className="sr-only">
        {ROWS.map((r) => (
          <li key={r.id}>
            {r.state === "fail" ? "Gap" : r.state === "pass" ? "Passed" : "Could not check"}: {r.label}. {r.ev}
          </li>
        ))}
      </ul>
    </>
  );
}
