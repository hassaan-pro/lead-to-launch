"use client";

import { motion } from "framer-motion";
import { Bracket } from "./Bracket";
import { EASE, type P, usePct, useRange, useSeg } from "./motion";

// Where the other businesses sit on the map, in percent of the frame.
const DOTS: Array<[number, number]> = [
  [10, 24], [22, 66], [30, 28], [48, 20], [56, 68], [64, 36], [74, 58], [82, 24], [88, 46], [16, 46], [52, 50], [70, 14], [44, 80],
];
const RANKED = new Set(["48,20", "64,36"]);
const TARGET: [number, number] = [27, 34];
const TAGS: Array<{ at: [number, number]; score: number }> = [
  { at: TARGET, score: 84 },
  { at: [48, 20], score: 77 },
  { at: [64, 36], score: 71 },
];

function RankTag({ p, at, score, i }: { p: P; at: [number, number]; score: number; i: number }) {
  const o = useSeg(p, 0.1 + i * 0.015, 0.135 + i * 0.015);
  const y = useRange(o, [0, 1], [6, 0]);
  return (
    <motion.span
      style={{ opacity: o, y, left: `${at[0]}%`, top: `${at[1]}%` }}
      className="absolute -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[11px] tabular-nums text-foreground"
    >
      {score}
    </motion.span>
  );
}

export function SceneMap({ p }: { p: P }) {
  // Zoom into the lit business, moving it to the centre of the frame so it can become the next window.
  const zoomRange = [0.22, 0.31];
  const scale = useRange(p, zoomRange, [1, 9], (t) => t * t);
  const x = usePct(p, zoomRange, [0, 23]);
  const y = usePct(p, zoomRange, [0, 16]);
  const fade = useRange(p, [0.27, 0.31], [1, 0]);
  const labelFade = useRange(p, [0.19, 0.22], [1, 0]);
  const headerFade = useRange(p, [0.2, 0.24], [1, 0]);
  const dim = useRange(p, [0.16, 0.2], [1, 0.3]);
  const hint = useRange(p, [0, 0.03], [1, 0]);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <motion.div className="absolute inset-0" style={{ scale, x, y, opacity: fade, originX: TARGET[0] / 100, originY: TARGET[1] / 100 }}>
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <g stroke="#1B2630" strokeWidth="0.3" fill="none">
            <path d="M0 34 L100 28" /><path d="M0 62 L100 70" /><path d="M26 0 L34 100" /><path d="M68 0 L62 100" /><path d="M0 84 L100 80" />
          </g>
        </svg>

        <motion.div className="absolute inset-0" style={{ opacity: dim }}>
          {DOTS.filter(([dx, dy]) => !RANKED.has(`${dx},${dy}`)).map(([dx, dy], i) => (
            <motion.span
              key={`${dx},${dy}`}
              className="absolute h-2 w-2 rounded-full bg-[#2B3744]"
              style={{ left: `${dx}%`, top: `${dy}%` }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.2 + i * 0.05 }}
            />
          ))}
        </motion.div>
        {[...RANKED].map((k, i) => {
          const [dx, dy] = k.split(",").map(Number);
          return (
            <motion.span
              key={k}
              className="absolute h-2 w-2 rounded-full bg-[#3A4857]"
              style={{ left: `${dx}%`, top: `${dy}%` }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.5 + i * 0.05 }}
            />
          );
        })}

        {TAGS.map((t, i) => (
          <RankTag key={i} p={p} at={t.at} score={t.score} i={i} />
        ))}

        {/* The business whose light comes on */}
        <div className="absolute" style={{ left: `${TARGET[0]}%`, top: `${TARGET[1]}%` }}>
          <motion.span
            className="absolute -left-1.5 -top-1.5 block h-3 w-3 rounded-full"
            initial={{ backgroundColor: "#2B3744", boxShadow: "0 0 0 0 rgba(240,179,74,0)" }}
            animate={{ backgroundColor: "#F0B34A", boxShadow: "0 0 0 1px rgba(240,179,74,0.55), 0 0 26px 5px rgba(240,179,74,0.32)" }}
            transition={{ duration: 0.6, ease: EASE, delay: 1.1 }}
          />
          <motion.span
            className="absolute -left-[19px] -top-[19px] block h-[38px] w-[38px]"
            initial={{ opacity: 0, scale: 2.2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.95 }}
          >
            <Bracket />
          </motion.span>
          <motion.div style={{ opacity: labelFade }} className="absolute left-6 top-[-26px]">
            <motion.div
              className="w-[206px] rounded-xl border border-border bg-card/95 px-3.5 py-2.5"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE, delay: 1.4 }}
            >
              <div className="font-display text-[15px] leading-tight">Marlowe Salon</div>
              <div className="mt-1 whitespace-nowrap font-mono text-[11px] text-muted-foreground">4.9 stars, 1,864 reviews</div>
              <div className="mt-1.5 text-[11px] text-lamp">example business</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div style={{ opacity: headerFade }} className="absolute left-5 right-5 top-4 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>salons in austin</span>
        <span>13 found</span>
      </motion.div>
      <motion.div style={{ opacity: hint }} className="absolute bottom-4 left-0 right-0 text-center font-mono text-[11px] text-muted-foreground">
        scroll
      </motion.div>
    </div>
  );
}
