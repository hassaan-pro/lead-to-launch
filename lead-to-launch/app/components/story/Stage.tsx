"use client";

import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { type P, usePct } from "@/components/journey/motion";

/**
 * A pinned scene. The section is `vh` viewports tall and its content is stuck to the screen while the
 * scroll runs; `p` is how far through the runway we are, 0 to 1. A hairline at the bottom shows it.
 */
export function Stage({ id, label, vh, children }: { id: string; label: string; vh: number; children: (p: P) => React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const width = usePct(p, [0, 1], [0, 100]);
  return (
    <section ref={ref} id={id} aria-label={label} className="relative" style={{ height: `${vh}vh` }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        {children(p)}
        <motion.div aria-hidden="true" style={{ width }} className="absolute bottom-0 left-0 h-px bg-lamp/60" />
      </div>
    </section>
  );
}

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
