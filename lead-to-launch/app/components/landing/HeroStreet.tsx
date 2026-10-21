"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// The same street as the finale (components/story/Lights), drawn the same way.
// There the scroll lights it; here it lights on arrival, one shop at a time,
// under the headline: the promise first, the payoff again at the end.
const SHOPS = ["Salon", "Dental", "Cafe", "Gym", "Bakery", "Optician", "Florist", "Tailor", "Barber", "Clinic", "Tutor", "Spa"];
const HEIGHT = [62, 80, 56, 88, 70, 60, 92, 66, 76, 58, 84, 68];
const FIRST_DELAY = 0.55;
const STEP = 0.14;

function HeroShop({ i, lit }: { i: number; lit: boolean }) {
  return (
    <div className="group relative flex h-full flex-col justify-end">
      <div className="relative transition-transform duration-300 ease-out group-hover:-translate-y-1" style={{ height: `${HEIGHT[i]}%` }}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-6 hidden text-center font-mono text-[11px] text-lamp opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block"
        >
          {SHOPS[i]}
        </span>
        <div className="relative h-full overflow-hidden rounded-t-[3px] border border-border bg-[#0E141B]">
          <div className="h-2 w-full bg-[repeating-linear-gradient(90deg,#1B2530_0_8px,#131B24_8px_16px)]" />
          <div className="absolute inset-x-[14%] bottom-[16%] top-[22%] rounded-[2px] border border-border/70 bg-[#0A1016]" />
          <div className="absolute bottom-0 left-[38%] h-[12%] w-[24%] border-x border-t border-border/70 bg-[#0A1016]" />
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-[14%] bottom-[16%] top-[22%] rounded-[2px] bg-[linear-gradient(180deg,#F6C968,#C98A28)] shadow-[0_0_34px_6px_rgba(240,179,74,0.32)] transition-opacity duration-500",
              lit ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      </div>
    </div>
  );
}

export function HeroStreet({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [lit, setLit] = useState(0);

  useEffect(() => {
    if (reduce) {
      setLit(SHOPS.length);
      return;
    }
    const timers = SHOPS.map((_, i) => window.setTimeout(() => setLit(i + 1), (FIRST_DELAY + i * STEP) * 1000));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduce]);

  return (
    <div aria-hidden="true" className={cn("flex flex-col", className)}>
      <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span>one street, twelve businesses</span>
        <span className={cn("tabular-nums transition-colors", lit === SHOPS.length ? "text-lamp" : "")}>
          {lit} of {SHOPS.length} lit
        </span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-12 items-end gap-1 border-b border-border/80 sm:gap-3">
        {SHOPS.map((s, i) => (
          <HeroShop key={s} i={i} lit={lit > i} />
        ))}
      </div>
    </div>
  );
}
