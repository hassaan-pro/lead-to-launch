"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useNarrow, useHydrated } from "./narrow";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { Viewfinder } from "@/components/brand/Viewfinder";
import { cn } from "@/lib/utils";
import { type P, usePct, useRange, useSeg } from "./motion";
import { SceneMap } from "./SceneMap";
import { SiteScene } from "./SiteScene";
import { SceneSend } from "./SceneSend";
import { CHAPTERS, ChapterTitles } from "./Chapters";

function Rail({ p, sectionRef }: { p: P; sectionRef: React.RefObject<HTMLElement | null> }) {
  const [active, setActive] = useState(-1);
  const show = useRange(p, [0.05, 0.09, 0.92, 0.95], [0, 1, 1, 0]);
  useMotionValueEvent(p, "change", (v) => {
    const i = CHAPTERS.findIndex((c) => v >= c.range[0] - 0.02 && v < c.range[1] + 0.02);
    setActive((prev) => (prev === i ? prev : i));
  });

  function jump(to: number) {
    const el = sectionRef.current;
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top;
    window.scrollTo({ top: top + to * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
  }

  return (
    <motion.nav aria-label="Chapters" style={{ opacity: show }} className="absolute bottom-11 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-background/70 px-2 py-1.5 md:bottom-5 backdrop-blur">
      {CHAPTERS.map((c, i) => (
        <button
          key={c.id}
          type="button"
          onClick={() => jump(c.jump)}
          className={cn(
            "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active === i ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full transition-colors", active === i ? "bg-lamp" : "bg-muted-foreground/40")} />
          {c.name}
        </button>
      ))}
    </motion.nav>
  );
}

function EndCard({ p, sectionRef }: { p: P; sectionRef: React.RefObject<HTMLElement | null> }) {
  const o = useSeg(p, 0.92, 0.96);
  const y = useRange(o, [0, 1], [16, 0]);
  const events = useTransform(o, (v) => (v > 0.6 ? "auto" : "none"));
  return (
    <motion.div style={{ opacity: o, pointerEvents: events }} className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 px-6 backdrop-blur-sm">
      <motion.div style={{ y }} className="max-w-2xl text-center">
        <h2 className="title-heavy font-display text-4xl leading-[1.04] sm:text-6xl">That was one business. Try your own.</h2>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/app"
            className="rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Open Lead to Launch
          </Link>
          <button
            type="button"
            onClick={() => {
              const el = sectionRef.current;
              if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top, behavior: "smooth" });
            }}
            className="rounded-full px-4 py-3 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            replay
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Journey() {
  const narrow = useNarrow();
  // Remount when the layout class changes (a phone being rotated) so every motion value is rebuilt for it.
  return <JourneyStage key={narrow ? "narrow" : "wide"} narrow={narrow} />;
}

function JourneyStage({ narrow }: { narrow: boolean }) {
  const hydrated = useHydrated();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // The frame starts as the hero demo on the right, then grows to fill the screen.
  const grow = [0, 0.08];
  const left = usePct(p, grow, narrow ? [6, 3] : [53, 3.5]);
  const top = usePct(p, grow, narrow ? [64, 8] : [17, 7]);
  const width = usePct(p, grow, narrow ? [88, 94] : [44, 93]);
  const height = usePct(p, grow, narrow ? [26, 76] : [66, 80]);
  const copyOpacity = useRange(p, [0, 0.025], [1, 0]);
  const copyY = useRange(p, [0, 0.06], [0, -28]);
  const copyEvents = useTransform(p, (v) => (v < 0.015 ? "auto" : "none"));
  const frameOut = useRange(p, [0.92, 0.96], [1, 0.12]);

  return (
    <section ref={ref} id="journey" aria-label="How Lead to Launch works, one business at a time" className="relative h-[520vh] md:h-[620vh]">
      <div className={`sticky top-0 h-svh overflow-hidden transition-opacity duration-200 ${hydrated ? "opacity-100" : "opacity-0"}`}>
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-18%] h-[620px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(240,179,74,0.07),transparent)]" />

        <motion.div style={{ opacity: copyOpacity, y: copyY, pointerEvents: copyEvents }} className="absolute left-[6%] top-[11%] w-[88%] md:top-1/2 md:w-[42%] md:max-w-xl md:-translate-y-1/2">
          <h1 className="font-display text-[clamp(1.9rem,4.6vw,4.1rem)] leading-[1.04] short:text-[1.7rem]">
            <span className="title-heavy block text-foreground">Find the businesses that need a website.</span>
            <span className="title-light mt-3 block text-foreground/70">Show up with it already built.</span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-snug text-muted-foreground short:mt-3 short:text-[14px] md:mt-7 md:text-lg md:leading-relaxed">
            Lead to Launch pulls local businesses from Google Maps, checks their real websites, designs a sample site for the best prospects, and writes the pitch.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-9">
            <Link
              href="/app"
              className="rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Open Lead to Launch
            </Link>
            <span className="px-3 font-mono text-sm text-muted-foreground">or scroll</span>
          </div>
          <p className="mt-10 hidden text-sm text-muted-foreground/80 md:block">Made in Lahore, first tested on salons there.</p>
        </motion.div>

        <motion.div style={{ left, top, width, height, opacity: frameOut }} className="absolute">
          <Viewfinder className="h-full w-full">
            <div className="glass relative h-full w-full overflow-hidden rounded-xl">
              <SceneMap p={p} />
              <SiteScene p={p} />
              <SceneSend p={p} />
              <ChapterTitles p={p} />
            </div>
          </Viewfinder>
        </motion.div>

        <Rail p={p} sectionRef={ref} />
        <EndCard p={p} sectionRef={ref} />

        <button
          type="button"
          onClick={() => ["proof-story", "proof"].map((id) => document.getElementById(id)).find((el) => el && el.offsetParent !== null)?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-2 left-1/2 z-30 -translate-x-1/2 md:bottom-5 md:left-auto md:right-6 md:translate-x-0 rounded-md px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          skip demo
        </button>
      </div>

      <ol className="sr-only">
        {CHAPTERS.map((c) => (
          <li key={c.id}>{c.title} {c.caption}</li>
        ))}
      </ol>
    </section>
  );
}
