"use client";

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Viewfinder } from "@/components/brand/Viewfinder";
import { DecodeText } from "@/components/brand/DecodeText";

const EASE = [0.23, 1, 0.32, 1] as const;

// Where the other businesses sit on the map, in percent of the field.
const DOTS: Array<[number, number]> = [
  [10, 24], [22, 66], [30, 28], [48, 20], [56, 68], [64, 36], [74, 58], [82, 24], [88, 46], [16, 46], [52, 50], [70, 14], [44, 80],
];

const AUDIT = [
  { ok: false, text: "No booking button or link found" },
  { ok: false, text: "Not built for phones" },
  { ok: false, text: "Footer still says © 2017" },
  { ok: true, text: "Served over HTTPS" },
];

export function HeroDemo() {
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const holder = useRef<HTMLDivElement>(null);
  // The sequence starts when the demo is actually on screen, so a phone user scrolling to it still sees it play.
  const seen = useInView(holder, { once: true, amount: 0.35 });
  const live = seen || !!reduce;
  // With reduced motion the finished scene appears at once.
  const t = (seconds: number) => (reduce ? 0 : seconds);

  return (
    <div className="relative">
      <Viewfinder>
      <div
        ref={holder}
        role="img"
        aria-label="Animated example. A salon with no booking button is found on a map, audited with evidence, given a sample website, and sent a message."
        className="glass relative h-[540px] w-full overflow-hidden rounded-xl"
      >
        {live ? (
        <div key={run} aria-hidden="true" className="absolute inset-0">
          {/* Streets */}
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <g stroke="#1B2630" strokeWidth="0.35" fill="none">
              <path d="M0 34 L100 28" /><path d="M0 62 L100 70" /><path d="M26 0 L34 100" /><path d="M68 0 L62 100" /><path d="M0 84 L100 80" />
            </g>
          </svg>

          <div className="absolute left-5 right-5 top-4 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span>salons in austin</span>
            <span>13 found</span>
          </div>

          {/* The other businesses */}
          {DOTS.map(([x, y], i) => (
            <motion.span
              key={i}
              className="absolute h-2 w-2 rounded-full bg-[#2B3744]"
              style={{ left: `${x}%`, top: `${y}%` }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduce ? 0 : 0.4, ease: EASE, delay: t(0.2 + i * 0.05) }}
            />
          ))}

          {/* The business we are about to audit: its light comes on */}
          <div className="absolute" style={{ left: "27%", top: "34%" }}>
            <motion.span
              className="absolute -left-1.5 -top-1.5 block h-3 w-3 rounded-full"
              initial={{ backgroundColor: "#2B3744", boxShadow: "0 0 0 0 rgba(240,179,74,0)" }}
              animate={{ backgroundColor: "#F0B34A", boxShadow: "0 0 0 1px rgba(240,179,74,0.55), 0 0 26px 5px rgba(240,179,74,0.32)" }}
              transition={{ duration: reduce ? 0 : 0.6, ease: EASE, delay: t(1.2) }}
            />
            <motion.span
              aria-hidden="true"
              className="absolute -left-[19px] -top-[19px] block h-[38px] w-[38px]"
              initial={{ opacity: 0, scale: 2.2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduce ? 0 : 0.55, ease: EASE, delay: t(1.0) }}
            >
              <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-lamp" />
              <span className="absolute right-0 top-0 h-2.5 w-2.5 border-r border-t border-lamp" />
              <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-lamp" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-lamp" />
            </motion.span>
            <motion.div
              className="absolute left-6 top-[-26px] w-[206px] rounded-xl border border-border bg-card/95 px-3.5 py-2.5"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.45, ease: EASE, delay: t(1.5) }}
            >
              <div className="font-display text-[15px] leading-tight">Noor Atelier</div>
              <div className="mt-1 whitespace-nowrap font-mono text-[11px] text-muted-foreground">4.7 stars, 2,310 reviews</div>
              <div className="mt-1.5 text-[11px] text-lamp">example business</div>
            </motion.div>
          </div>

          {/* A message that lands */}
          <motion.div
            className="absolute right-5 top-12 w-[56%] max-w-[240px] rounded-2xl rounded-tr-md border border-border bg-[#14211C] px-3.5 py-2.5 text-[12px] leading-snug text-[#D7E6DF]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, ease: EASE, delay: t(5.2) }}
          >
            Hi, I rebuilt your homepage as a sample. Two minutes to look?
            <div className="mt-1 text-right font-mono text-[10px] text-[#7FA597]">sent</div>
          </motion.div>

          {/* The evidence */}
          <motion.div
            className="absolute bottom-5 left-5 w-[56%] max-w-[270px] rounded-xl border border-border bg-card/95 p-3.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: EASE, delay: t(2.2) }}
          >
            <ul className="space-y-2">
              {AUDIT.map((a, i) => (
                <motion.li
                  key={a.text}
                  className="flex gap-2.5 font-mono text-[11px] leading-snug"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reduce ? 0 : 0.35, ease: EASE, delay: t(2.3 + i * 0.45) }}
                >
                  <span className={a.ok ? "text-ok" : "text-destructive"}>{a.ok ? "✓" : "✕"}</span>
                  <DecodeText text={a.text} delay={t(2.3 + i * 0.45) * 1000} duration={520} className={a.ok ? "text-muted-foreground" : "text-foreground"} />
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* The sample site, built for them */}
          <motion.div
            className="absolute bottom-5 right-5 h-[236px] w-[124px] overflow-hidden rounded-[20px] border-[3px] border-[#2A3340] bg-[#211713] sm:h-[290px] sm:w-[150px]"
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.7, ease: EASE, delay: t(4.2) }}
          >
            <div className="flex h-full flex-col p-3.5 text-[#F3E4DA]">
              <div className="text-[8px] opacity-60">Noor Atelier</div>
              <div className="mt-5 font-display text-[22px] leading-[0.95] tracking-tight sm:mt-7 sm:text-[27px]">Your wedding morning, unhurried.</div>
              <div className="mt-3 text-[8px] leading-snug opacity-65">Four steps, one chair, no surprises.</div>
              <div className="mt-auto space-y-2">
                <div className="rounded-full bg-[#D98C7A] py-1.5 text-center text-[8px] font-medium text-[#2A1713]">Book on WhatsApp</div>
                <div className="flex gap-1">
                  {["#211713", "#D98C7A", "#F3E4DA", "#7A4B3E", "#3A2620"].map((c) => (
                    <span key={c} className="h-2 flex-1 rounded-sm border border-white/10" style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        ) : null}
      </div>
      </Viewfinder>

      <button
        type="button"
        onClick={() => setRun((n) => n + 1)}
        className="absolute -bottom-9 right-1 rounded-md px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        replay
      </button>
    </div>
  );
}
