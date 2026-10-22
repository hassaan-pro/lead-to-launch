"use client";

import { motion } from "framer-motion";
import { type P, useRange, useWindow } from "./motion";

export const CHAPTERS = [
  { id: "find", name: "Find", title: "Find them.", caption: "Scrape a niche and a city from Google Maps, then rank every business by how much a better site would matter.", range: [0.08, 0.3] as const, jump: 0.2 },
  { id: "prove", name: "Prove", title: "Prove it.", caption: "Open each site and write down what it actually saw. Every gap comes with evidence.", range: [0.32, 0.55] as const, jump: 0.46 },
  { id: "design", name: "Design", title: "Design it.", caption: "Decide a creative direction for this business first, then build the sample site and show it live.", range: [0.57, 0.75] as const, jump: 0.66 },
  { id: "send", name: "Send", title: "Send it.", caption: "Write the pitch around the gap it found, for WhatsApp or email, with a follow-up ready.", range: [0.76, 0.91] as const, jump: 0.85 },
];

function Chapter({ p, c }: { p: P; c: (typeof CHAPTERS)[number] }) {
  const [a, b] = c.range;
  const o = useWindow(p, a, a + 0.03, b - 0.03, b);
  const y = useRange(o, [0, 1], [12, 0]);
  return (
    <motion.div style={{ opacity: o, y }} className="absolute bottom-0 left-0 max-w-[430px]">
      <div className="title-heavy font-display text-3xl leading-none">{c.title}</div>
      <p className="mt-2.5 font-mono text-[12.5px] leading-relaxed text-muted-foreground">{c.caption}</p>
    </motion.div>
  );
}

export function ChapterTitles({ p }: { p: P }) {
  return (
    <div className="pointer-events-none absolute bottom-[4.5%] left-[3%] right-[3%] h-[16%]" aria-hidden="true">
      {CHAPTERS.map((c) => <Chapter key={c.id} p={p} c={c} />)}
    </div>
  );
}
