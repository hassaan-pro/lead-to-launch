"use client";

import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE } from "@/components/journey/motion";
import { DecodeText } from "@/components/brand/DecodeText";
import { cn } from "@/lib/utils";

/**
 * The arrow every call to action carries. On hover of the parent (which needs the `group`
 * class) it swings from pointing right to pointing up-right. One micro-interaction, repeated
 * everywhere, is what makes a page feel designed by a single hand.
 */
export function ArrowFlip({ className }: { className?: string }) {
  return (
    <ArrowRight
      aria-hidden="true"
      className={cn("h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:-rotate-45", className)}
    />
  );
}

/**
 * Pulls its children a few pixels toward the cursor and lets them spring back on leave.
 * Mouse only: touch pointers never move it, and reduced-motion users get the plain element.
 */
export function Magnetic({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 14, mass: 0.25 });
  const y = useSpring(my, { stiffness: 180, damping: 14, mass: 0.25 });
  if (reduce) return <span className={cn("inline-block", className)}>{children}</span>;

  function onMove(e: ReactPointerEvent<HTMLSpanElement>) {
    if (e.pointerType !== "mouse") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }
  return (
    <motion.span ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} style={{ x, y }} className={cn("inline-block", className)}>
      {children}
    </motion.span>
  );
}

/**
 * Fade-rise reveal: opacity plus a short rise, once, when the block scrolls into view.
 * The same recipe on every section is the point. Reduced-motion users get the plain block.
 */
export function Reveal({ children, delay = 0, y = 26, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * The mono label above a section headline. It decodes itself out of noise when it scrolls
 * into view: the brand's signature move, carried by every section instead of only the demos.
 */
export function SectionKicker({ text, className }: { text: string; className?: string }) {
  return (
    <p className={cn("mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-lamp", className)}>
      <DecodeText text={text} duration={600} />
    </p>
  );
}

/**
 * Pointer parallax for the hero: handlers for the container, plus springed offsets for a
 * glow layer that drifts with the cursor and a panel that tilts a few pixels after it.
 * Mouse only; the springs rest at zero for everyone else.
 */
export function usePointerParallax() {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.5 });
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.5 });
  const glowX = useTransform(sx, (v) => v * 70);
  const glowY = useTransform(sy, (v) => v * 46);
  const panelX = useTransform(sx, (v) => v * 9);
  const panelY = useTransform(sy, (v) => v * 7);
  const panelR = useTransform(sx, (v) => v * 0.5);
  function onPointerMove(e: ReactPointerEvent<HTMLElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * 2);
    py.set(((e.clientY - r.top) / Math.max(1, r.height) - 0.5) * 2);
  }
  function onPointerLeave() {
    px.set(0);
    py.set(0);
  }
  return { onPointerMove, onPointerLeave, glowX, glowY, panelX, panelY, panelR };
}
