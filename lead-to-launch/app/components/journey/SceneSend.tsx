"use client";

import { motion, useTransform } from "framer-motion";
import { ScrollDecode } from "./ScrollDecode";
import { NewSitePhone } from "./sites";
import { type P, useRange, useSeg } from "./motion";
import { useNarrow } from "./narrow";

const MESSAGE =
  "Assalam o alaikum, I was looking at Noor Atelier online. 2,310 reviews, but the homepage has no way to book. I rebuilt it as a sample so you can see the difference. Two minutes to look?";

export function SceneSend({ p }: { p: P }) {
  const narrow = useNarrow();
  const enter = useSeg(p, 0.75, 0.81);
  const leave = useSeg(p, 0.9, 0.94);
  const scale = useRange(enter, [0, 1], [0.6, 1]);
  const opacity = useTransform([enter, leave], ([a, b]) => Math.max(0, ((a as number) - 0.45) / 0.55) * (1 - (b as number)));
  const typing = useSeg(p, 0.81, 0.87);
  const bubble = useSeg(p, 0.8, 0.82);
  const sent = useSeg(p, 0.87, 0.88);
  const follow = useSeg(p, 0.88, 0.9);
  const to = useSeg(p, 0.78, 0.8);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0" aria-hidden="true">
      <motion.div
        style={{ scale, containerType: "inline-size" }}
        className={`absolute left-1/2 -translate-x-1/2 ${narrow ? "top-[3%] h-[44%] w-[40%] min-w-[140px] short:h-[39%]" : "top-[8%] h-[76%] w-[22%] min-w-[190px]"} overflow-hidden rounded-[26px] border-[5px] border-[#2A3340] shadow-[0_0_0_1px_rgba(240,179,74,0.4),0_0_60px_4px_rgba(240,179,74,0.18)]`}
      >
        <NewSitePhone />
      </motion.div>

      <motion.div style={{ opacity: to }} className={narrow ? "hidden" : "absolute left-[4%] top-[28%] w-[22%] font-mono text-[12px] leading-snug text-muted-foreground"}>
        to Noor Atelier, on WhatsApp
      </motion.div>

      <div className={narrow ? "absolute left-[5%] top-[50%] w-[90%] short:top-[45%]" : "absolute left-[66%] top-[24%] w-[28%] min-w-[220px]"}>
        <motion.div
          style={{ opacity: bubble }}
          className="rounded-2xl rounded-tl-md border border-border bg-[#14211C] px-4 py-3 text-[13px] leading-relaxed text-[#D7E6DF]"
        >
          <ScrollDecode text={MESSAGE} progress={typing} className="font-sans" />
          <motion.div style={{ opacity: sent }} className="mt-2 text-right font-mono text-[10px] text-[#7FA597]">sent</motion.div>
        </motion.div>
        <motion.div style={{ opacity: follow }} className="mt-3 rounded-xl border border-dashed border-border px-3 py-2 font-mono text-[11px] text-muted-foreground">
          follow-up drafted too
        </motion.div>
      </div>
    </motion.div>
  );
}
