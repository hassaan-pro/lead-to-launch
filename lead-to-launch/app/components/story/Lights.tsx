"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import { type P, useRange, useSeg } from "@/components/journey/motion";
import { ArrowFlip, Magnetic } from "@/components/motion/ui";
import { Stage } from "./Stage";

const SHOPS = ["Salon", "Dental", "Cafe", "Gym", "Bakery", "Optician", "Florist", "Tailor", "Barber", "Clinic", "Tutor", "Spa"];
// Different heights so the street has a skyline.
const HEIGHT = [62, 80, 56, 88, 70, 60, 92, 66, 76, 58, 84, 68];
const FIRST = 0.06;
const STEP = 0.04;
const lamp = (i: number) => [FIRST + i * STEP, FIRST + i * STEP + 0.05] as const;

function Shop({ p, i }: { p: P; i: number }) {
  const [a, b] = lamp(i);
  const lit = useSeg(p, a, b);
  const sign = useRange(lit, [0.4, 1], [0, 1]);
  return (
    <div className="group relative flex flex-col justify-end" style={{ height: "100%" }}>
      <motion.div style={{ opacity: sign }} className="mb-2 hidden text-center font-mono text-[11px] text-lamp md:block">{SHOPS[i]}</motion.div>
      <div className="relative transition-transform duration-300 ease-out group-hover:-translate-y-1" style={{ height: `${HEIGHT[i]}%` }}>
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-6 hidden text-center font-mono text-[11px] text-lamp opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block">{SHOPS[i]}</span>
        <div className="relative h-full overflow-hidden rounded-t-[3px] border border-border bg-[#0E141B]">
          <div className="h-2 w-full bg-[repeating-linear-gradient(90deg,#1B2530_0_8px,#131B24_8px_16px)]" />
          <div className="absolute inset-x-[14%] bottom-[16%] top-[22%] rounded-[2px] border border-border/70 bg-[#0A1016]" />
          <div className="absolute bottom-0 left-[38%] h-[12%] w-[24%] border-x border-t border-border/70 bg-[#0A1016]" />
          <motion.div
            aria-hidden="true"
            style={{ opacity: lit }}
            className="pointer-events-none absolute inset-x-[14%] bottom-[16%] top-[22%] rounded-[2px] bg-[linear-gradient(180deg,#F6C968,#C98A28)] shadow-[0_0_34px_6px_rgba(240,179,74,0.32)]"
          />
          {/* Hover lights the shop early: fast on, slow off, so sweeping the cursor down the
              street leaves a trail of lit windows behind it. */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-[14%] bottom-[16%] top-[22%] rounded-[2px] bg-[linear-gradient(180deg,#F6C968,#C98A28)] opacity-0 shadow-[0_0_34px_6px_rgba(240,179,74,0.32)] transition-opacity duration-700 group-hover:opacity-90 group-hover:duration-150" />
        </div>
      </div>
    </div>
  );
}

function LightsScene({ p }: { p: P }) {
  const [lit, setLit] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    const n = SHOPS.reduce((acc, _, i) => acc + (v >= lamp(i)[1] - 0.01 ? 1 : 0), 0);
    setLit((prev) => (prev === n ? prev : n));
  });
  const head = useSeg(p, 0.5, 0.62);
  const headY = useRange(head, [0, 1], [26, 0]);
  const cta = useSeg(p, 0.64, 0.74);
  const ctaY = useRange(cta, [0, 1], [18, 0]);
  const ctaEvents = useRange(cta, [0, 0.5, 0.51, 1], [0, 0, 1, 1]);

  return (
    <>
      <div className="absolute inset-x-[6%] top-[11%] max-w-4xl md:top-[13%]">
        <motion.h2 style={{ opacity: head, y: headY }} className="title-heavy font-display text-[clamp(2rem,5vw,4.6rem)] leading-[1.04]">
          Pick a niche and a city. Start turning the lights on.
        </motion.h2>
        <motion.div style={{ opacity: cta, y: ctaY, pointerEvents: ctaEvents as unknown as "auto" }} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Magnetic>
            <Link
              href="/app"
              className="group flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Open Outrive
              <ArrowFlip />
            </Link>
          </Magnetic>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">Site generation runs on a free Gemini key, or in the chat app you already use.</p>
        </motion.div>
      </div>

      <div aria-hidden="true" className="absolute inset-x-[4%] bottom-[9%] top-[54%] md:inset-x-[5%] md:bottom-[7%] md:top-[46%]">
        <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted-foreground">
          <span>one street, twelve businesses</span>
          <span className={cn("tabular-nums transition-colors", lit === SHOPS.length ? "text-lamp" : "")}>{lit} of {SHOPS.length} lit</span>
        </div>
        <div className="grid h-[calc(100%-3.5rem)] grid-cols-12 items-end gap-1 border-b border-border/80 sm:gap-3 md:h-[calc(100%-1.75rem)] md:gap-3">
          {SHOPS.map((s, i) => (
            <Shop key={s} p={p} i={i} />
          ))}
        </div>
        <div className="mt-3 h-4 text-center font-mono text-xs text-lamp md:hidden">{lit > 0 ? SHOPS[lit - 1] : ""}</div>
      </div>
    </>
  );
}

export function Lights() {
  return (
    <Stage id="start-story" label="Start turning the lights on" vh={300}>
      {(p) => <LightsScene p={p} />}
    </Stage>
  );
}
