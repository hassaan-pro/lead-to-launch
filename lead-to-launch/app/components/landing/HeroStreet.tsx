"use client";

import { useEffect, useState } from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ShopGroup, StreetScene, STREET_SHOPS } from "@/components/brand/StreetScene";

// The street as a framed scene next to the headline: the same drawn street
// as the finale (components/story/Lights), lit here on arrival, one shop
// at a time. The promise first, the payoff again at the end.
const FIRST_DELAY = 0.55;
const STEP = 0.14;

function HeroShopGroup({ i, lit }: { i: number; lit: boolean }) {
  const glow = useMotionValue(0);
  useEffect(() => {
    const controls = animate(glow, lit ? 1 : 0, { duration: 0.55, ease: "easeOut" });
    return controls.stop;
  }, [lit, glow]);
  return <ShopGroup i={i} lit={glow} tall />;
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
    <div aria-hidden="true" className={className}>
      <div className="overflow-hidden rounded-[1.4rem] shadow-[0_30px_60px_-30px_rgba(20,16,8,0.45)] ring-1 ring-black/10">
        <StreetScene tall className="block h-auto w-full">
          {STREET_SHOPS.map((s, i) => (
            <HeroShopGroup key={s} i={i} lit={lit > i} />
          ))}
        </StreetScene>
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span>one street, twelve businesses</span>
        <span className={cn("tabular-nums transition-colors", lit === STREET_SHOPS.length ? "text-lamp" : "")}>
          {lit} of {STREET_SHOPS.length} lit
        </span>
      </div>
    </div>
  );
}
