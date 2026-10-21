"use client";

import { motion } from "framer-motion";
import { ScrollDecode } from "@/components/journey/ScrollDecode";
import { SectionKicker } from "@/components/motion/ui";
import { type P, usePct, useRange, useSeg } from "@/components/journey/motion";
import { Stage } from "./Stage";

const SERIF = "Georgia, 'Times New Roman', serif";

const RULES = [
  { t: "No invented facts.", d: "Testimonials, years in business, awards and prices are never made up. Anything missing becomes a visible [REPLACE] tag, so you fill it in before you send." },
  { t: "Unknown is a valid answer.", d: "If a site only renders with JavaScript, those checks are marked couldn't check, not failed. You never accuse a business of something nobody saw." },
  { t: "A Facebook page is not a website.", d: "Facebook, Instagram and link-in-bio pages are classified as social pages, and the pitch is written that way." },
];

// Each slip arrives, then plays out. [arrive start, arrive end, play start, play end]
const BEATS = [
  [0.05, 0.13, 0.15, 0.3],
  [0.33, 0.41, 0.43, 0.58],
  [0.61, 0.69, 0.71, 0.86],
] as const;

function Paper({ p, beat, label, title, children, pos }: { p: P; beat: (typeof BEATS)[number]; label: string; title: string; children: React.ReactNode; pos: string }) {
  const arrive = useSeg(p, beat[0], beat[1]);
  const y = useRange(arrive, [0, 1], [34, 0]);
  return (
    <motion.div style={{ opacity: arrive, y }} className={`absolute inset-x-0 overflow-hidden rounded-lg bg-[#EFE9DD] px-4 py-3 text-[#1E1A14] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)] short:px-3 short:py-2 md:px-6 md:py-4 ${pos}`}>
      <div className="mb-1 font-display text-[16px] leading-tight md:hidden">{title}</div>
      <div className="font-mono text-[10.5px] text-[#6B6459] short:hidden md:block md:text-[11px]">{label}</div>
      <div className="mt-2 md:mt-2.5">{children}</div>
    </motion.div>
  );
}

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block rounded bg-[#1E1A14] px-2 py-1 font-mono text-[12px] text-lamp">{children}</span>
);

function SlipInvented({ p }: { p: P }) {
  const b = BEATS[0];
  const strike = usePct(p, [b[2], b[2] + 0.05], [0, 100]);
  const dim = useRange(p, [b[2], b[2] + 0.05], [1, 0.4]);
  const chip = useSeg(p, b[2] + 0.04, b[2] + 0.08);
  const chipY = useRange(chip, [0, 1], [8, 0]);
  const real = useSeg(p, b[2] + 0.085, b[2] + 0.115);
  return (
    <div className="space-y-2 text-[15px] short:text-[14px] md:space-y-2.5 md:text-[17px]" style={{ fontFamily: SERIF }}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="relative inline-block">
          <motion.span style={{ opacity: dim }} className="inline-block">Serving Austin&apos;s brides since 1998.</motion.span>
          <motion.span aria-hidden="true" style={{ width: strike }} className="absolute left-0 top-1/2 h-[2px] bg-[#C2402A]" />
        </span>
        <motion.span style={{ opacity: chip, y: chipY }}><Chip>[REPLACE: years in business]</Chip></motion.span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4">
        <span>Loved by 2,310 clients, rated 4.7 on Google.</span>
        <motion.span style={{ opacity: real }} className="font-mono text-[12px] text-[#2F7A57]">✓ from Google</motion.span>
      </div>
    </div>
  );
}

function SlipUnknown({ p }: { p: P }) {
  const b = BEATS[1];
  const flip = useSeg(p, b[2] + 0.02, b[2] + 0.07);
  const before = useRange(flip, [0, 1], [1, 0]);
  const after = useRange(flip, [0.3, 1], [0, 1]);
  const decode = useSeg(p, b[2] + 0.04, b[2] + 0.1);
  return (
    <div className="relative h-[3.6rem]">
      <motion.div style={{ opacity: before }} className="absolute inset-0 text-[17px]">
        <span className="mr-3 font-mono text-[#C2402A]">✕</span>No prices shown
      </motion.div>
      <motion.div style={{ opacity: after }} className="absolute inset-0">
        <div className="text-[17px]"><span className="mr-3 font-mono text-[#6B6459]">?</span>Couldn&apos;t check</div>
        <div className="mt-1 pl-7 font-mono text-[12px] text-[#6B6459]">
          <ScrollDecode text="Pricing may load with JavaScript, so a basic fetch cannot see it" progress={decode} />
        </div>
      </motion.div>
    </div>
  );
}

function SlipSocial({ p }: { p: P }) {
  const b = BEATS[2];
  const tag = useSeg(p, b[2], b[2] + 0.05);
  const swap = useSeg(p, b[2] + 0.06, b[2] + 0.11);
  const oldLine = useRange(swap, [0, 1], [1, 0]);
  const newLine = useRange(swap, [0.3, 1], [0, 1]);
  const strike = usePct(swap, [0, 1], [0, 100]);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[13px]">
        <span>facebook.com/noor.atelier</span>
        <motion.span style={{ opacity: tag }}><Chip>social page, not a website</Chip></motion.span>
      </div>
      <div className="relative mt-3 h-[3.2rem] text-[16px] leading-snug" style={{ fontFamily: SERIF }}>
        <motion.span style={{ opacity: oldLine }} className="absolute left-0 top-0 inline-block">
          <span className="relative">Your website looks outdated.<motion.span aria-hidden="true" style={{ width: strike }} className="absolute left-0 top-1/2 h-[2px] bg-[#C2402A]" /></span>
        </motion.span>
        <motion.span style={{ opacity: newLine }} className="absolute left-0 top-0">You only have a Facebook page. Here is a site that takes bookings.</motion.span>
      </div>
    </div>
  );
}

function RuleRow({ p, index }: { p: P; index: number }) {
  const start = BEATS[index][0];
  const end = index < 2 ? BEATS[index + 1][0] : 1;
  const on = useRange(p, [start - 0.02, start + 0.02, end - 0.02, end + 0.02], [0.3, 1, 1, index < 2 ? 0.3 : 1]);
  return (
    <motion.li style={{ opacity: on }} className="border-t border-border/80 py-4">
      <div className="font-display text-xl leading-tight">{RULES[index].t}</div>
      <p className="mt-1.5 max-w-sm text-[14px] leading-relaxed text-muted-foreground">{RULES[index].d}</p>
    </motion.li>
  );
}

function TruthScene({ p }: { p: P }) {
  return (
    <>
      <div className="absolute left-[6%] right-[6%] top-[8%] short:top-[10.5%] md:right-auto md:top-[12%] md:w-[36%] md:max-w-lg">
        <SectionKicker text="the rules" className="mb-3" />
        <h2 className="title-heavy font-display text-[clamp(1.9rem,3.8vw,3.4rem)] leading-[1.04] short:text-[1.65rem]">Built so you never send something false.</h2>
        <ol className="mt-8 hidden md:block">
          {RULES.map((_, i) => (
            <RuleRow key={i} p={p} index={i} />
          ))}
        </ol>
      </div>

      <div aria-hidden="true" className="absolute inset-x-[5%] top-[21%] h-[66%] short:top-[21%] short:h-[68%] md:inset-x-auto md:right-[5%] md:top-[12%] md:h-[72%] md:w-[48%] md:min-w-[400px]">
        <Paper p={p} beat={BEATS[0]} title={RULES[0].t} label="draft copy for the sample site" pos="top-0 h-[31%] short:h-[35%] md:h-[30%]"><SlipInvented p={p} /></Paper>
        <Paper p={p} beat={BEATS[1]} title={RULES[1].t} label="audit result, prices" pos="top-[34.5%] h-[31%] short:top-[37%] short:h-[26%] md:h-[30%]"><SlipUnknown p={p} /></Paper>
        <Paper p={p} beat={BEATS[2]} title={RULES[2].t} label="audit result, website" pos="top-[69%] h-[31%] short:top-[65%] short:h-[33%] md:h-[30%]"><SlipSocial p={p} /></Paper>
      </div>
    </>
  );
}

export function Truth() {
  return (
    <Stage id="rules-story" label="The three rules that keep the pitch honest" vh={360}>
      {(p) => <TruthScene p={p} />}
    </Stage>
  );
}
