"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// The overview strip from the reference dashboard, translated to the run:
// a row of quiet cards with the numbers that matter, counting up smoothly
// when they change. Every value here is real state from the current run,
// never a placeholder dressed up as data.
function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 22 });
  const display = useTransform(spring, (v) => `${Math.round(v)}`);
  useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  return <motion.span>{display}</motion.span>;
}

const card =
  "rounded-[1.4rem] border border-border/70 bg-card p-5 shadow-[0_18px_40px_-30px_rgba(20,16,8,0.35)]";
const label = "font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground";
const big = "mt-2 font-display text-3xl leading-none text-foreground";

export function RunOverview({
  leadsCount,
  auditsCount,
  completedCount,
  selectedName,
  selectedScore,
}: {
  leadsCount: number;
  auditsCount: number;
  completedCount: number;
  selectedName: string | null;
  selectedScore: number | null;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {[
        { key: "leads", node: (
          <>
            <p className={label}>Leads found</p>
            <p className={big}><AnimatedNumber value={leadsCount} /></p>
            <p className="mt-2 text-xs text-muted-foreground">businesses on this street</p>
          </>
        )},
        { key: "audits", node: (
          <>
            <p className={label}>Audits done</p>
            <p className={big}><AnimatedNumber value={auditsCount} /></p>
            <p className="mt-2 text-xs text-muted-foreground">sites checked, gaps evidenced</p>
          </>
        )},
        { key: "phases", node: (
          <>
            <p className={label}>Run progress</p>
            <p className={big}>
              <AnimatedNumber value={completedCount} />
              <span className="text-lg text-muted-foreground"> of 5 phases</span>
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border/70">
              <motion.div
                className="h-full rounded-full bg-lamp"
                initial={false}
                animate={{ width: `${(completedCount / 5) * 100}%` }}
                transition={{ type: "spring", stiffness: 90, damping: 22 }}
              />
            </div>
          </>
        )},
        { key: "selected", node: (
          <>
            <p className={label}>Building for</p>
            <p className="mt-2 truncate font-display text-2xl leading-tight text-foreground">
              {selectedName ?? "No one yet"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {selectedScore != null ? `conversion score ${selectedScore}` : "pick a prospect in Rank"}
            </p>
          </>
        )},
      ].map((c) => (
        <motion.div
          key={c.key}
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } },
          }}
          className={card}
        >
          {c.node}
        </motion.div>
      ))}
    </motion.div>
  );
}
