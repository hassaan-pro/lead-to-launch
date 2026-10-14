import Link from "next/link";
import { HeroDemo } from "./HeroDemo";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden px-5 pb-20 pt-32 sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-18%] h-[620px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(240,179,74,0.07),transparent)]" />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:gap-10">
        <div>
          <h1 className="font-display text-[2.6rem] leading-[1.03] sm:text-6xl lg:text-[4.1rem]">
            <span className="block text-foreground">Find the businesses that need a website.</span>
            <span className="mt-3 block text-muted-foreground">Show up with it already built.</span>
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-muted-foreground">
            Lead to Launch pulls local businesses from Google Maps, checks their real websites, designs a sample site for the best prospects, and writes the pitch.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Open Lead to Launch
            </Link>
            <a href="#how" className="rounded-full px-5 py-3.5 text-[15px] text-muted-foreground transition-colors hover:text-foreground">
              See how it works
            </a>
          </div>
          <p className="mt-10 text-sm text-muted-foreground/80">Made in Lahore, first tested on salons there.</p>
        </div>
        <HeroDemo />
      </div>
    </section>
  );
}
