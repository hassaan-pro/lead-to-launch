"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import { type P, useRange, useSeg } from "@/components/journey/motion";
import { ArrowFlip, Magnetic } from "@/components/motion/ui";
import { Stage } from "./Stage";
import { ShopGroup, StreetScene, STREET_SHOPS as SHOPS } from "@/components/brand/StreetScene";

const FIRST = 0.06;
const STEP = 0.04;
const lamp = (i: number) => [FIRST + i * STEP, FIRST + i * STEP + 0.05] as const;

function Shop({ p, i }: { p: P; i: number }) {
  const [a, b] = lamp(i);
  const lit = useSeg(p, a, b);
  return <ShopGroup i={i} lit={lit} trail />;
}

function LightsScene({ p }: { p: P }) {
  const [lit, setLit] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    const n = SHOPS.reduce((acc, _, i) => acc + (v >= lamp(i)[1] - 0.01 ? 1 : 0), 0);
    setLit((prev) => (prev === n ? prev : n));
  });
  // The headline used to arrive halfway through the runway, leaving the top of the screen
  // empty for the first half of the scene. It now lands while the shops are still lighting.
  const head = useSeg(p, 0.3, 0.42);
  const headY = useRange(head, [0, 1], [26, 0]);
  const cta = useSeg(p, 0.46, 0.56);
  const ctaY = useRange(cta, [0, 1], [18, 0]);
  const ctaEvents = useRange(cta, [0, 0.5, 0.51, 1], [0, 0, 1, 1]);

  return (
    <div className="absolute inset-0 flex flex-col px-[6%] pb-[5svh] pt-[9svh] md:pt-[8svh]">
      <div className="max-w-4xl shrink-0">
        <motion.h2 style={{ opacity: head, y: headY }} className="title-heavy font-display text-[clamp(2rem,5vw,4.6rem)] leading-[1.04]">
          Pick a niche and a city. Start turning the lights on.
        </motion.h2>
        <motion.div style={{ opacity: cta, y: ctaY, pointerEvents: ctaEvents as unknown as "auto" }} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Magnetic>
            <Link
              href="/app"
              className="group flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Start free
              <ArrowFlip />
            </Link>
          </Magnetic>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">Site generation runs on a free Gemini key, or in the chat app you already use.</p>
        </motion.div>
      </div>

      {/* In flow under the headline, pushed to the bottom by mt-auto: the street
          takes whatever height is left, so the two can never overlap. */}
      <div aria-hidden="true" className="mt-auto min-h-0">
        <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted-foreground">
          <span>one street, twelve businesses</span>
          <span className={cn("tabular-nums transition-colors", lit === SHOPS.length ? "text-lamp" : "")}>{lit} of {SHOPS.length} lit</span>
        </div>
        <div className="overflow-hidden rounded-[1.4rem] shadow-[0_30px_60px_-30px_rgba(20,16,8,0.45)] ring-1 ring-black/10">
          <StreetScene className="block h-[30svh] w-full md:h-[36svh]">
            {SHOPS.map((s, i) => (
              <Shop key={s} p={p} i={i} />
            ))}
          </StreetScene>
        </div>
        <div className="mt-3 h-4 text-center font-mono text-xs text-lamp md:hidden">{lit > 0 ? SHOPS[lit - 1] : ""}</div>
      </div>
    </div>
  );
}

export function Lights() {
  return (
    <Stage id="start-story" label="Start turning the lights on" vh={300}>
      {(p) => <LightsScene p={p} />}
    </Stage>
  );
}
