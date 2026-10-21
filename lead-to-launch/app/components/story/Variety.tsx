"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Viewfinder } from "@/components/brand/Viewfinder";
import { type P, usePct, useRange, useSeg, useWindow } from "@/components/journey/motion";
import { SectionKicker } from "@/components/motion/ui";
import { Stage } from "./Stage";

// Where each direction sits on the runway, used by the dot jumps below.
const PHASE_TARGET = [0.15, 0.51, 0.86];

function jumpToPhase(dirIndex: number) {
  const el = document.getElementById("directions-story");
  if (!el) return;
  const top = window.scrollY + el.getBoundingClientRect().top;
  window.scrollTo({ top: top + PHASE_TARGET[dirIndex] * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
}

// The twelve page architectures the generator chooses from.
const LIBRARY = [
  "Editorial spread", "Type poster", "Service index", "Booking first", "Horizontal journey", "Menu as hero",
  "Split stage", "Soft bento", "Poster brutalism", "Story timeline", "Ritual steps", "Gallery wall",
];

const DIRECTIONS = [
  {
    arch: "Ritual steps", at: 10, why: "The visit itself is the pitch.",
    palette: ["#F3E9E2", "#FBF6F2", "#2A1F1C", "#7A6A62", "#B5533C"], paletteName: "Rose clay and ink",
    type: "Fraunces for headlines, Manrope for text", signature: "A pinned step counter that advances as you scroll.",
  },
  {
    arch: "Split stage", at: 6, why: "A premium service with one clear action.",
    palette: ["#0E1114", "#1A1E23", "#EDE3CF", "#8E8672", "#C9A55B"], paletteName: "Night ink and brass",
    type: "Cormorant Garamond with Plus Jakarta Sans", signature: "A fixed rail keeps the booking action in view.",
  },
  {
    arch: "Soft bento", at: 7, why: "Reassurance in a single glance.",
    palette: ["#E9EEF2", "#FFFFFF", "#102A3A", "#5B7385", "#2F6F8F"], paletteName: "Clinical blue",
    type: "Plus Jakarta Sans throughout", signature: "Every tile answers one question a visitor has.",
  },
] as const;

const SERIF = "Georgia, 'Times New Roman', serif";

function PageRitual() {
  return (
    <div className="absolute inset-0 bg-[#F3E9E2] p-[3cqw] text-[#2A1F1C]" style={{ fontFamily: SERIF }}>
      <div className="flex items-center justify-between">
        <span className="text-[2.3cqw] font-semibold tracking-tight">Noor Atelier</span>
        <span className="flex items-center gap-[2.4cqw] font-sans text-[1.6cqw]">
          <span>Rituals</span><span>Prices</span><span>Visit</span>
          <span className="rounded-full bg-[#B5533C] px-[1.8cqw] py-[0.8cqw] text-white">Book a trial</span>
        </span>
      </div>
      <div className="mt-[4.2cqw] grid grid-cols-[1.15fr_1fr] gap-[4cqw]">
        <div>
          <div className="text-[5.6cqw] leading-[1.02] tracking-tight">Four steps to your wedding morning.</div>
          <div className="mt-[1.8cqw] font-sans text-[1.7cqw] opacity-70">4.7 stars from 2,310 clients. One chair, no rush.</div>
          <div className="mt-[2.4cqw] inline-block rounded-full bg-[#B5533C] px-[2.6cqw] py-[1.3cqw] font-sans text-[1.7cqw] text-white">Book a trial</div>
        </div>
        <ol className="divide-y divide-[#2A1F1C]/15 font-sans text-[1.8cqw]">
          {["Arrive and settle", "A quiet consultation", "The work, unhurried", "Leave glowing"].map((t, i) => (
            <li key={t} className="flex gap-[1.6cqw] py-[1.6cqw]"><span className="opacity-40">{i + 1}</span>{t}</li>
          ))}
        </ol>
      </div>
      <div className="absolute bottom-[2.6cqw] left-[3cqw] font-mono text-[1.3cqw] text-[#B5533C]">[REPLACE: opening hours]</div>
    </div>
  );
}

function PageStage() {
  return (
    <div className="absolute inset-0 grid grid-cols-[38%_1fr] bg-[#0E1114] text-[#EDE3CF]">
      <div className="flex flex-col justify-between p-[3cqw]">
        <div>
          <div className="font-display text-[4.8cqw] leading-none">Noor Atelier</div>
          <div className="mt-[1cqw] font-sans text-[1.6cqw] opacity-60">South Congress, Austin</div>
        </div>
        <div>
          <div className="font-sans text-[1.7cqw] opacity-80">4.7 stars, 2,310 reviews</div>
          <div className="mt-[1.6cqw] rounded-full bg-[#C9A55B] px-[2.2cqw] py-[1.3cqw] text-center font-sans text-[1.7cqw] font-medium text-[#14100A]">Check availability</div>
          <div className="mt-[1.6cqw] font-mono text-[1.3cqw] text-[#C9A55B]">[REPLACE: opening hours]</div>
        </div>
      </div>
      <div className="space-y-[1.4cqw] p-[2cqw]">
        {[["The chair", "#2B2A26", 17], ["Bridal", "#38342C", 12], ["Colour", "#241F19", 12]].map(([label, bg, h]) => (
          <div key={label as string} className="relative rounded-[0.8cqw]" style={{ background: bg as string, height: `${h}cqw` }}>
            <span className="absolute bottom-[1cqw] left-[1.2cqw] font-sans text-[1.4cqw] text-[#EDE3CF]/70">{label}</span>
            <span className="absolute right-[1.2cqw] top-[1cqw] font-mono text-[1.1cqw] text-[#C9A55B]/80">[REPLACE: photo]</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageBento() {
  const tile = "rounded-[1.2cqw] bg-white p-[1.8cqw]";
  return (
    <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-[1.2cqw] bg-[#E9EEF2] p-[2.4cqw] font-sans text-[#102A3A]">
      <div className={cn(tile, "col-span-2 row-span-2")}>
        <div className="text-[3.9cqw] font-semibold leading-[1.06] tracking-tight">A salon you can trust with the day.</div>
        <div className="mt-[1.6cqw] text-[1.6cqw] text-[#5B7385]">Noor Atelier, South Congress, Austin</div>
      </div>
      <div className="rounded-[1.2cqw] bg-[#2F6F8F] p-[1.8cqw] text-[1.9cqw] font-medium text-white">Book today</div>
      <div className={cn(tile, "text-[1.6cqw]")}><div className="text-[4.2cqw] font-semibold leading-none">4.7</div><div className="mt-[0.6cqw] text-[#5B7385]">2,310 reviews</div></div>
      <div className={cn(tile, "text-[1.6cqw]")}>Bridal trials</div>
      <div className={cn(tile, "border border-dashed border-[#2F6F8F]/50 font-mono text-[1.3cqw] text-[#2F6F8F]")}>[REPLACE: opening hours]</div>
      <div className={cn(tile, "col-span-2 text-[1.6cqw]")}>Hair, skin, bridal, colour</div>
      <div className={cn(tile, "col-span-2 text-[1.6cqw] text-[#5B7385]")}>First visit questions answered</div>
    </div>
  );
}

function BriefBlock({ d, opacity }: { d: (typeof DIRECTIONS)[number]; opacity: ReturnType<typeof useWindow> }) {
  return (
    <motion.div style={{ opacity }} className="absolute inset-0 space-y-3.5 text-sm">
      <div>
        <div className="font-display text-xl leading-tight">{d.arch}</div>
        <div className="mt-0.5 text-muted-foreground">{d.why}</div>
      </div>
      <div className="flex items-center gap-2">
        {d.palette.map((c) => (
          <span key={c} className="h-5 w-5 rounded-full border border-white/10" style={{ background: c }} />
        ))}
        <span className="text-muted-foreground">{d.paletteName}</span>
      </div>
      <div className="font-mono text-xs text-muted-foreground short:hidden md:block">{d.type}</div>
      <div className="text-[13px] leading-snug text-foreground/85 short:hidden md:block">{d.signature}</div>
    </motion.div>
  );
}

function VarietyScene({ p }: { p: P }) {
  const [phase, setPhase] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    const n = v < 0.37 ? 0 : v < 0.69 ? 1 : 2;
    setPhase((prev) => (prev === n ? prev : n));
  });

  const wipeB = useSeg(p, 0.32, 0.42);
  const wipeC = useSeg(p, 0.64, 0.74);
  const clipB = useTransform(wipeB, (v) => `inset(0 ${(1 - v) * 100}% 0 0)`);
  const clipC = useTransform(wipeC, (v) => `inset(0 ${(1 - v) * 100}% 0 0)`);
  const edgeB = usePct(p, [0.32, 0.42], [0, 100]);
  const edgeC = usePct(p, [0.64, 0.74], [0, 100]);
  const edgeBOn = useWindow(p, 0.315, 0.335, 0.405, 0.425);
  const edgeCOn = useWindow(p, 0.635, 0.655, 0.725, 0.745);
  const a = useWindow(p, 0, 0.02, 0.3, 0.36);
  const b = useWindow(p, 0.34, 0.4, 0.62, 0.68);
  const c = useWindow(p, 0.66, 0.72, 0.99, 1);
  const lift = useRange(p, [0, 0.03], [18, 0]);
  const appear = useRange(p, [0, 0.025], [0, 1]);
  const foot = useRange(p, [0.84, 0.92], [0, 1]);

  return (
    <>
      <div className="absolute left-[6%] right-[6%] top-[8%] short:top-[10.5%] md:right-auto md:top-[14%] md:w-[31%] md:max-w-md">
        <SectionKicker text="the sites" className="mb-3" />
        <h2 className="title-heavy font-display text-[clamp(1.9rem,3.8vw,3.4rem)] leading-[1.04] short:text-[1.6rem]">Never the same site twice.</h2>
        <p className="mt-3 text-[14px] leading-snug text-muted-foreground short:hidden md:mt-5 md:text-[17px] md:leading-relaxed">
          Before any code, each business gets a creative direction. Here is one business in three of them. &ldquo;New direction&rdquo; rolls another.
        </p>

        <div aria-hidden="true" className="relative mt-8 hidden h-[190px] border-t border-border/80 pt-5 md:block">
          <div className="absolute right-0 top-2 font-mono text-xs tabular-nums text-muted-foreground">direction {phase + 1} of 3</div>
          <div className="relative h-full">
            <BriefBlock d={DIRECTIONS[0]} opacity={a} />
            <BriefBlock d={DIRECTIONS[1]} opacity={b} />
            <BriefBlock d={DIRECTIONS[2]} opacity={c} />
          </div>
        </div>
      </div>

      <motion.div style={{ opacity: appear, y: lift }} className="absolute inset-x-[4%] top-[27%] short:top-[22%] md:inset-x-auto md:right-[5%] md:top-1/2 md:w-[56%] md:-translate-y-[54%]">
        <Viewfinder>
          <div aria-hidden="true" className="glass overflow-hidden rounded-xl">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <span className="flex gap-1.5"><i className="h-2 w-2 rounded-full bg-border" /><i className="h-2 w-2 rounded-full bg-border" /><i className="h-2 w-2 rounded-full bg-border" /></span>
              <span className="rounded bg-background/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">noor-atelier.example</span>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden" style={{ containerType: "inline-size" }}>
              <PageRitual />
              <motion.div className="absolute inset-0" style={{ clipPath: clipB }}><PageStage /></motion.div>
              <motion.div className="absolute inset-0" style={{ clipPath: clipC }}><PageBento /></motion.div>
              <motion.span style={{ left: edgeB, opacity: edgeBOn }} className="absolute inset-y-0 w-px bg-lamp shadow-[0_0_14px_2px_rgba(240,179,74,0.6)]" />
              <motion.span style={{ left: edgeC, opacity: edgeCOn }} className="absolute inset-y-0 w-px bg-lamp shadow-[0_0_14px_2px_rgba(240,179,74,0.6)]" />
            </div>
          </div>
        </Viewfinder>

        <div className="mt-6 flex flex-col items-start gap-3 md:mt-7 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex items-center gap-2">
            {LIBRARY.map((name, i) => {
              const chosen = DIRECTIONS.findIndex((d) => d.at === i);
              const state = chosen === phase ? "active" : chosen !== -1 && chosen < phase ? "seen" : "idle";
              const dot = (
                <span
                  className={cn(
                    "h-2 w-2 rounded-full transition-[background-color,box-shadow,transform] duration-300",
                    state === "active" ? "scale-150 bg-lamp shadow-[0_0_10px_2px_rgba(240,179,74,0.55)]" : state === "seen" ? "bg-lamp/40" : "bg-muted-foreground/30",
                  )}
                />
              );
              // The three architectures this demo actually shows are buttons: clicking one
              // scrolls the runway to that direction. The other nine are library, not slides.
              return chosen === -1 ? (
                <span key={name} title={name} className="grid h-6 w-6 place-items-center">{dot}</span>
              ) : (
                <button
                  key={name}
                  type="button"
                  title={name}
                  aria-label={`Show direction ${chosen + 1}: ${DIRECTIONS[chosen].arch}`}
                  onClick={() => jumpToPhase(chosen)}
                  className="grid h-6 w-6 place-items-center rounded-full transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {dot}
                </button>
              );
            })}
          </div>
          <div aria-hidden="true" className="font-mono text-xs text-muted-foreground">
            <span className="text-foreground">{DIRECTIONS[phase].arch}</span> of 12 page architectures
          </div>
        </div>
        <motion.p style={{ opacity: foot }} className="mt-3 hidden text-sm text-muted-foreground md:block">
          Missing facts, like the opening hours here, stay visible as [REPLACE] tags.
        </motion.p>
      </motion.div>

      <div aria-hidden="true" className="absolute inset-x-[6%] top-[70%] h-[150px] border-t border-border/80 pt-4 short:top-[72%] short:h-[100px] md:hidden">
        <div className="absolute right-0 top-2 font-mono text-[11px] tabular-nums text-muted-foreground">direction {phase + 1} of 3</div>
        <div className="relative h-full">
          <BriefBlock d={DIRECTIONS[0]} opacity={a} />
          <BriefBlock d={DIRECTIONS[1]} opacity={b} />
          <BriefBlock d={DIRECTIONS[2]} opacity={c} />
        </div>
      </div>

      <ul className="sr-only">
        {DIRECTIONS.map((d) => (
          <li key={d.arch}>{d.arch}: {d.why} Palette {d.paletteName}. {d.type}. {d.signature}</li>
        ))}
      </ul>
    </>
  );
}

export function Variety() {
  return (
    <Stage id="directions-story" label="One business in three different creative directions" vh={340}>
      {(p) => <VarietyScene p={p} />}
    </Stage>
  );
}
