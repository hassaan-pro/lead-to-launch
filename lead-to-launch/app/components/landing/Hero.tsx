import Link from "next/link";
import { HeroStreet } from "./HeroStreet";
import { ArrowFlip, Magnetic, Reveal } from "@/components/motion/ui";

export function Hero() {
  return (
    <section id="hero" className="relative flex min-h-[100svh] items-center overflow-hidden px-5 pb-24 pt-32 sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-18%] h-[620px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(240,179,74,0.07),transparent)]" />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,47%)_minmax(0,1fr)]">
        <div className="max-w-3xl lg:order-2">
          <Reveal delay={0.05}>
            <h1 className="font-display text-[2.6rem] leading-[1.03] sm:text-6xl lg:text-[4.6rem]">
              <span className="title-heavy block text-foreground">Win your niche,</span>
              <span className="title-light mt-3 block text-foreground/70">street by street.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Barbers, bakers, dentists, gyms: pick your trade. Outrive finds, audits, builds and pitches, street by street, until the niche knows your name.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Link
                  href="/app"
                  className="group flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Start free
                  <ArrowFlip />
                </Link>
              </Magnetic>
              <a href="#how" className="u-sweep px-1 py-3.5 text-[15px] text-muted-foreground transition-colors hover:text-foreground">
                See how it works
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.45}>
            <p className="mt-10 text-sm text-muted-foreground/80">No invented numbers. No borrowed logos. The work is the proof.</p>
          </Reveal>
        </div>
        <div className="mt-14 lg:order-1 lg:mt-0">
          <HeroStreet />
        </div>
      </div>
    </section>
  );
}
