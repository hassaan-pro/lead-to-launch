"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowFlip, Magnetic, Reveal, SectionKicker } from "@/components/motion/ui";

const EASE = [0.23, 1, 0.32, 1] as const;
const LIT = 7;

/** A street of shopfronts. One switches on as it scrolls into view. */
function Street() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden="true" className="mt-20 grid grid-cols-12 gap-1.5 sm:gap-2.5">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="h-14 rounded-[3px] border border-border bg-[#0E141B] sm:h-20"
          initial={false}
          whileInView={i === LIT ? { backgroundColor: "#F0B34A", boxShadow: "0 0 30px 4px rgba(240,179,74,0.3)" } : undefined}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: reduce ? 0 : 0.7, ease: EASE, delay: 0.3 }}
        />
      ))}
    </div>
  );
}

export function Closing() {
  return (
    <section id="start" className="overflow-hidden px-5 pb-16 pt-24 sm:px-8 sm:pb-20 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionKicker text="the street" />
          <h2 className="title-heavy font-display max-w-3xl text-4xl leading-[1.04] sm:text-6xl">Pick a niche and a city. Start turning the lights on.</h2>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Magnetic>
              <Link
                href="/app"
                className="group flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Start free
                <ArrowFlip />
              </Link>
            </Magnetic>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">Site generation runs on a free Gemini key, or in the chat app you already use.</p>
          </div>
        </Reveal>
        <Street />
      </div>
    </section>
  );
}
