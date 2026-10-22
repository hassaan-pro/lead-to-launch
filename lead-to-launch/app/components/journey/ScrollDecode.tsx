"use client";

import { useState } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { useNarrow } from "./narrow";

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
 * Like DecodeText, but driven by scroll. `progress` runs 0 to 1 while the line resolves, so scrolling
 * back un-decodes it. The real text is always in the DOM for assistive tech. Use with a mono font.
 * On phones the real text shows at once: a half decoded line reads as broken text at small sizes,
 * and in a proportional font the line reflows every frame while it decodes.
 */
export function ScrollDecode({ text, progress, className }: { text: string; progress: MotionValue<number>; className?: string }) {
  const narrow = useNarrow();
  const [frame, setFrame] = useState<string | null>(null);
  useMotionValueEvent(progress, "change", (v) => {
    setFrame(v <= 0 || v >= 1 ? null : scramble(text, v));
  });
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{narrow ? text : (frame ?? text)}</span>
    </span>
  );
}
