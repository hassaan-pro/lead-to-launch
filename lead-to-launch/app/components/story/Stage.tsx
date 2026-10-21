"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { type P, usePct } from "@/components/journey/motion";

/**
 * A pinned scene. The section is `vh` viewports tall and its content is stuck to the screen while the
 * scroll runs; `p` is how far through the runway we are, 0 to 1. A hairline at the bottom shows it.
 */
export function Stage({ id, label, vh, children }: { id: string; label: string; vh: number; children: (p: P) => React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: raw } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // A light spring over the raw progress. Scenes keep their 1:1 mapping to the runway but gain
  // weight, gliding into place instead of tracking the scrollbar mechanically. Overdamped on
  // purpose, so nothing overshoots at a scene boundary.
  const p = useSpring(raw, { stiffness: 90, damping: 24, mass: 0.6, restDelta: 0.001 });
  const width = usePct(p, [0, 1], [0, 100]);
  return (
    <section ref={ref} id={id} aria-label={label} className="relative pt-[84px]" style={{ height: `${vh}vh` }}>
      {/* The stage starts 84px down the screen and is 84px shorter than the viewport: the fixed
          nav pill (about 72px with its top padding) floats in that reserved band, so scene
          content composed in percentages of the stage can never slide underneath it. */}
      <div className="sticky top-[84px] h-[calc(100svh-84px)] overflow-hidden">
        {children(p)}
        <motion.div aria-hidden="true" style={{ width }} className="absolute bottom-0 left-0 h-px bg-lamp/60" />
      </div>
    </section>
  );
}

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
