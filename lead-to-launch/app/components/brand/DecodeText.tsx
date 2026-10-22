"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useNarrow } from "@/components/journey/narrow";

const GLYPHS = "_#?/\\<>[]{}=+*%$";

function scramble(text: string, progress: number): string {
  const reveal = Math.floor(progress * text.length);
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += ch === " " || i < reveal ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }
  return out;
}

/**
 * Text that resolves from noise into the real characters, left to right, once it scrolls into view.
 * The real text is in the HTML from the start and is what assistive tech reads. Use with a monospace
 * font so the line never changes width while it decodes. On phones the real text shows at once:
 * at small sizes a half decoded line reads as broken text, not as an effect.
 */
export function DecodeText({ text, delay = 0, duration = 650, className }: { text: string; delay?: number; duration?: number; className?: string }) {
  const reduce = useReducedMotion();
  const narrow = useNarrow();
  const ref = useRef<HTMLSpanElement>(null);
  const [frame, setFrame] = useState<string | null>(null);

  useEffect(() => {
    if (reduce || narrow) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const t0 = performance.now() + delay;
      const tick = (now: number) => {
        const p = Math.min(1, Math.max(0, (now - t0) / duration));
        if (p >= 1) return setFrame(null);
        setFrame(scramble(text, p));
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        run();
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text, delay, duration, reduce, narrow]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{frame ?? text}</span>
    </span>
  );
}
