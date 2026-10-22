"use client";

import { useEffect, useState } from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Shopfront, StreetLamps, STREET_HEIGHTS, STREET_SHOPS } from "@/components/brand/Shopfront";

// The same street as the finale (components/story/Lights), drawn by the
// same Shopfront. There the scroll lights it; here it lights on arrival,
// one shop at a time, under the headline: the promise first, the payoff
// again at the end.
const FIRST_DELAY = 0.55;
const STEP = 0.14;

function HeroShop({ i, lit }: { i: number; lit: boolean }) {
  const glow = useMotionValue(0);
  useEffect(() => {
    const controls = animate(glow, lit ? 1 : 0, { duration: 0.55, ease: "easeOut" });
    return controls.stop;
  }, [lit, glow]);
  return (
    <div className="group relative flex h-full flex-col justify-end">
      <div className="relative w-full transition-transform duration-300 ease-out group-hover:-translate-y-1" style={{ height: `${STREET_HEIGHTS[i]}%` }}>
        <Shopfront i={i} lit={glow} />
      </div>
    </div>
  );
}

export function HeroStreet({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [lit, setLit] = useState(0);

  useEffect(() => {
    if (reduce) {
      setLit(STREET_SHOPS.length);
      return;
    }
    const timers = STREET_SHOPS.map((_, i) => window.setTimeout(() => setLit(i + 1), (FIRST_DELAY + i * STEP) * 1000));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduce]);

  return (
    <div aria-hidden="true" className={cn("flex flex-col", className)}>
      <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span>one street, twelve businesses</span>
        <span className={cn("tabular-nums transition-colors", lit === STREET_SHOPS.length ? "text-lamp" : "")}>
          {lit} of {STREET_SHOPS.length} lit
        </span>
      </div>
      <div className="relative grid min-h-0 flex-1 grid-cols-12 items-end gap-1 border-b border-border/80 sm:gap-3">
        {STREET_SHOPS.map((s, i) => (
          <HeroShop key={s} i={i} lit={lit > i} />
        ))}
        <StreetLamps />
      </div>
    </div>
  );
}
