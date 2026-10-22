"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useNarrow, useHydrated } from "./narrow";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { Viewfinder } from "@/components/brand/Viewfinder";
import { cn } from "@/lib/utils";
import { EASE, type P, usePct, useRange, useSeg } from "./motion";
import { ArrowFlip, Magnetic, Reveal, usePointerParallax } from "@/components/motion/ui";
import { HeroStreet } from "@/components/landing/HeroStreet";
import { SceneMap } from "./SceneMap";
import { SiteScene } from "./SiteScene";
import { SceneSend } from "./SceneSend";
import { CHAPTERS, ChapterTitles } from "./Chapters";

function Rail({ p, sectionRef, jumpMap }: { p: P; sectionRef: React.RefObject<HTMLElement | null>; jumpMap: (v: number) => number }) {
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
    window.scrollTo({ top: top + jumpMap(to) * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
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
    <motion.div style={{ opacity: o, pointerEvents: events }} className="absolute inset-0 z-20 flex items-center justify-center bg-background/95 px-6 backdrop-blur-sm">
      <motion.div style={{ y }} className="max-w-2xl text-center">
        <h2 className="title-heavy font-display text-4xl leading-[1.04] sm:text-6xl">That was one business. Try your own.</h2>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Magnetic>
            <Link
              href="/app"
              className="group flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Start free
              <ArrowFlip />
            </Link>
          </Magnetic>
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
  const { scrollYProgress: rawP } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Same overdamped spring as the story stages: the whole opening scrubs with weight.
  const p = useSpring(rawP, { stiffness: 90, damping: 24, mass: 0.6, restDelta: 0.001 });
  const par = usePointerParallax();

  // The first stretch of the runway is the hero: headline and street only,
  // no process. The process (frame, chapters, scenes) runs on a remapped
  // progress that starts where the hero ends, so every range the scenes
  // were tuned with keeps its meaning in the space that remains.
  const HERO_END = 0.15;
  const pp = useTransform(p, [HERO_END, 1], [0, 1]);
  const toRaw = (v: number) => HERO_END + (1 - HERO_END) * v;
  const frameIn = useRange(p, [0.1, 0.15], [0, 1]);

  // The frame starts as the hero demo on the right, then grows to fill the screen.
  const grow = [0, 0.08];
  const left = usePct(pp, grow, narrow ? [6, 3] : [53, 3.5]);
  const top = usePct(pp, grow, narrow ? [63, 8] : [14, 7]);
  const width = usePct(pp, grow, narrow ? [88, 94] : [44, 93]);
  const height = usePct(pp, grow, narrow ? [21, 76] : [59, 80]);
  const copyOpacity = useRange(p, [0.09, 0.14], [1, 0]);
  const copyY = useRange(p, [0, 0.14], [0, -28]);
  const copyEvents = useTransform(p, (v) => (v < 0.11 ? "auto" : "none"));
  const frameOut = useRange(pp, [0.92, 0.96], [1, 0.12]);
  const frameOpacity = useTransform([frameIn, frameOut], ([a, b]) => (a as number) * (b as number));
  const frameEvents = useTransform(frameIn, (v) => (v > 0.5 ? "auto" : "none") as "auto" | "none");
  const skipO = useRange(pp, [0.02, 0.05, 0.9, 0.94], [0, 1, 1, 0]);
  const skipEvents = useTransform(skipO, (v) => (v > 0.5 ? "auto" : "none") as "auto" | "none");

  return (
    <section ref={ref} id="journey" aria-label="How Outrive works, one business at a time" className="relative h-[600vh] pt-[84px] md:h-[700vh]">
      <div onPointerMove={par.onPointerMove} onPointerLeave={par.onPointerLeave} className={`sticky top-[84px] h-[calc(100svh-84px)] overflow-hidden transition-opacity duration-200 ${hydrated ? "opacity-100" : "opacity-0"}`}>
        <motion.div aria-hidden="true" style={{ x: par.glowX, y: par.glowY, marginLeft: -550 }} className="pointer-events-none absolute left-1/2 top-[-18%] h-[620px] w-[1100px] rounded-full bg-[radial-gradient(closest-side,rgba(240,179,74,0.07),transparent)]" />

        <motion.div style={{ opacity: copyOpacity, y: copyY }} className="pointer-events-none absolute inset-0 flex flex-col px-[6%] pb-[3%] pt-[6%] md:grid md:grid-cols-[minmax(0,47%)_minmax(0,1fr)] md:items-center md:gap-12 md:pt-[3%]">
          {/* The street scene: on the left beside the copy on wide screens,
              along the bottom under it on phones. In flow inside a grid, so
              the copy and the scene can never overlap at any height. It
              stays at every phone height: the short-screen copy sizes keep
              copy plus scene shorter than the stage, so hiding it (the old
              short:hidden) only left phones with an empty hero. */}
          <div className="order-2 mt-auto md:order-1 md:mt-0">
            <HeroStreet />
          </div>
          <motion.div style={{ pointerEvents: copyEvents }} className="order-1 md:order-2">
          <Reveal delay={0.05}>
            <h1 className="font-display text-[clamp(2rem,5vw,4.7rem)] leading-[1.04] short:text-[1.7rem]">
              <span className="title-heavy block text-foreground">Win your niche,</span>
              <span className="title-light mt-3 block text-foreground/70">street by street.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-4 max-w-md text-[15px] leading-snug text-muted-foreground short:mt-3 short:text-[14px] md:mt-7 md:text-lg md:leading-relaxed">
              Barbers, bakers, dentists, gyms: pick your trade. Outrive finds, audits, builds and pitches, street by street, until the niche knows your name.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-9">
              <Magnetic>
                <Link
                  href="/app"
                  className="group flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Start free
                  <ArrowFlip />
                </Link>
              </Magnetic>
              <span className="px-3 font-mono text-sm text-muted-foreground">or scroll</span>
            </div>
          </Reveal>
          <Reveal delay={0.45}>
            <p className="mt-10 hidden text-sm text-muted-foreground/80 md:block">No invented numbers. No borrowed logos. The work is the proof.</p>
          </Reveal>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
          style={{ x: par.panelX, y: par.panelY, rotate: par.panelR }}
          className="pointer-events-none absolute inset-0"
        >
          <motion.div style={{ left, top, width, height, opacity: frameOpacity, pointerEvents: frameEvents }} className="absolute">
            <Viewfinder className="h-full w-full">
              <div className="glass relative h-full w-full overflow-hidden rounded-xl">
                <SceneMap p={pp} />
                <SiteScene p={pp} />
                <SceneSend p={pp} />
                <ChapterTitles p={pp} />
              </div>
            </Viewfinder>
          </motion.div>
        </motion.div>

        <Rail p={pp} sectionRef={ref} jumpMap={toRaw} />
        <EndCard p={pp} sectionRef={ref} />

        <motion.button
          type="button"
          style={{ opacity: skipO, pointerEvents: skipEvents }}
          onClick={() => ["proof-story", "proof"].map((id) => document.getElementById(id)).find((el) => el && el.offsetParent !== null)?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-2 left-1/2 z-30 hidden -translate-x-1/2 rounded-md px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:block md:bottom-5 md:left-auto md:right-6 md:translate-x-0"
        >
          skip demo
        </motion.button>
      </div>

      <ol className="sr-only">
        {CHAPTERS.map((c) => (
          <li key={c.id}>{c.title} {c.caption}</li>
        ))}
      </ol>
    </section>
  );
}
