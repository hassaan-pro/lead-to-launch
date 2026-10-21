"use client";

import { motion, useTransform } from "framer-motion";
import { Bracket } from "./Bracket";
import { ScrollDecode } from "./ScrollDecode";
import { NewSite, OldSite } from "./sites";
import { type P, useRange, useSeg, useWindow } from "./motion";
import { useNarrow } from "./narrow";

type Region = { l: number; t: number; w: number; h: number };

const CALLOUTS: Array<{ a: number; region: Region; label: string }> = [
  { a: 0.35, region: { l: 2, t: 8, w: 96, h: 10 }, label: "No booking button or link found" },
  { a: 0.4, region: { l: 2, t: 22, w: 58, h: 32 }, label: "Not built for phones: no viewport tag" },
  { a: 0.45, region: { l: 64, t: 22, w: 34, h: 34 }, label: "2 images on the homepage" },
  { a: 0.5, region: { l: 2, t: 90, w: 96, h: 9 }, label: "Footer still says © 2017" },
];

function Callout({ p, a, region, label, index, narrow }: { p: P; a: number; region: Region; label: string; index: number; narrow: boolean }) {
  const t = useSeg(p, a, a + 0.04);
  const out = useRange(p, [0.53, 0.56], [1, 0]);
  const opacity = useTransform([t, out], ([x, y]) => (x as number) * (y as number));
  const scale = useRange(t, [0, 1], [1.1, 1]);
  return (
    <motion.div style={{ opacity }} className="pointer-events-none absolute inset-0">
      <motion.div
        style={{ left: `${region.l}%`, top: `${region.t}%`, width: `${region.w}%`, height: `${region.h}%`, scale }}
        className="absolute"
      >
        <Bracket />
        <span className="absolute inset-0 bg-lamp/[0.11]" />
      </motion.div>
      <div
        className={narrow ? "absolute flex gap-2 font-mono text-[11.5px] leading-snug" : "absolute flex w-[230px] gap-2 font-mono text-[12px] leading-snug"}
        style={narrow ? { left: 0, right: 0, top: `calc(100% + ${16 + index * 30}px)` } : { left: "103%", top: `${Math.min(region.t, 78)}%` }}
      >
        <span className="text-destructive">✕</span>
        <ScrollDecode text={label} progress={t} className="text-foreground" />
      </div>
    </motion.div>
  );
}

function DirectionNote({ p, a, k, children }: { p: P; a: number; k: string; children: React.ReactNode }) {
  const t = useSeg(p, a, a + 0.03);
  const y = useRange(t, [0, 1], [10, 0]);
  return (
    <motion.div style={{ opacity: t, y }} className="mb-4">
      <div className="text-[11px] text-muted-foreground">{k}</div>
      <div className="mt-1 text-[13px] leading-snug">{children}</div>
    </motion.div>
  );
}

export function SiteScene({ p }: { p: P }) {
  const narrow = useNarrow();
  const enter = useSeg(p, 0.28, 0.35);
  const leave = useSeg(p, 0.74, 0.8);
  const scaleIn = useRange(enter, [0, 1], [0.06, 1]);
  const scaleOut = useRange(leave, [0, 1], [1, 0.55]);
  const scale = useTransform([scaleIn, scaleOut], ([a, b]) => (a as number) * (b as number));
  // The window is fully gone by the time the phone starts to appear, so the two headlines never overlap.
  const opacity = useTransform([enter, leave], ([a, b]) => Math.min(1, (a as number) * 1.6) * (1 - Math.min(1, (b as number) * 2.2)));

  // The new site wipes over the old one, and the window lights up.
  const swap = useSeg(p, 0.54, 0.6);
  const clip = useTransform(swap, (v) => `inset(0 ${(1 - v) * 100}% 0 0)`);
  const glow = useTransform(swap, (v) => `0 0 0 1px rgba(240,179,74,${0.5 * v}), 0 0 70px 6px rgba(240,179,74,${0.22 * v})`);

  const gaps = useRange(p, [0.35, 0.39, 0.44, 0.49, 0.53], [0, 1, 2, 3, 4]);
  const gapsRound = useTransform(gaps, (v) => String(Math.round(v)));
  const counterOpacity = useWindow(p, 0.34, 0.37, 0.52, 0.56);
  const noteOut = useRange(p, [0.72, 0.75], [1, 0]);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <motion.div style={{ opacity, scale }} className={narrow ? "absolute left-[5%] top-[6%] h-[39%] w-[90%]" : "absolute left-[23%] top-[10%] h-[70%] w-[54%]"}>
        <motion.div style={{ boxShadow: glow, containerType: "inline-size" }} className="absolute inset-0 overflow-hidden rounded-lg border border-border bg-[#0E1319]">
          <div className="flex h-[7%] items-center gap-1.5 bg-[#10161E] px-3">
            {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#2B3744]" />)}
            <span className="ml-3 rounded bg-[#0A0E13] px-3 py-[2px] font-mono text-[10px] text-muted-foreground">noor-atelier.example</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 top-[7%]">
            <OldSite />
            <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
              <NewSite />
            </motion.div>
          </div>
        </motion.div>
        {CALLOUTS.map((c, i) => <Callout key={c.label} p={p} {...c} index={i} narrow={narrow} />)}
      </motion.div>

      <motion.div style={{ opacity: counterOpacity }} className="absolute right-5 top-4 font-mono text-[11px] text-muted-foreground">
        gaps found <motion.span className="text-foreground">{gapsRound}</motion.span>
      </motion.div>

      <motion.div style={{ opacity: noteOut }} className={narrow ? "absolute left-[5%] top-[52%] grid w-[90%] grid-cols-2 gap-x-5" : "absolute left-[2.5%] top-[22%] w-[19%]"}>
        <DirectionNote p={p} a={0.6} k="Architecture">Ritual steps: arrive, consult, treat, leave</DirectionNote>
        <DirectionNote p={p} a={0.63} k="Palette">
          <span className="flex items-center gap-1.5">
            {["#F3E9E2", "#FBF6F2", "#2A1F1C", "#7A6A62", "#B5533C"].map((c) => <span key={c} className="h-4 w-4 rounded-full border border-white/10" style={{ background: c }} />)}
          </span>
        </DirectionNote>
        <DirectionNote p={p} a={0.66} k="Type">Fraunces for headlines, Manrope for text</DirectionNote>
        <DirectionNote p={p} a={0.69} k="Sections">the-chair, bridal-trials, price-index, find-us</DirectionNote>
      </motion.div>
    </div>
  );
}
