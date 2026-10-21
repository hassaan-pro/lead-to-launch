import { AuditReceipt, BOBS_ROWS } from "./AuditReceipt";
import { SampleSiteCard } from "./SampleSiteCard";
import { Viewfinder } from "@/components/brand/Viewfinder";
import { Reveal, SectionKicker } from "@/components/motion/ui";

export function Evidence() {
  return (
    <section id="proof" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start lg:pt-6">
          <Reveal>
            <SectionKicker text="the audit" />
            <h2 className="title-heavy font-display text-4xl leading-[1.05] sm:text-5xl">Every gap comes with proof.</h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Telling a business its website is outdated gets ignored. Telling it there is no booking button on the homepage gets checked, and believed.
            </p>
            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
              Outrive opens each site and writes down what it actually saw, so every line in your pitch is something the owner can verify in ten seconds.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
        <figure>
          <Viewfinder className="mx-3">
          <div className="rounded-xl border border-border bg-card px-6 py-2 sm:px-8">
            <div className="flex items-baseline justify-between gap-4 border-b border-border/80 py-4">
              <div>
                <div className="font-display text-lg"><span aria-hidden="true" className="mr-2 text-lamp">+</span>Bob&apos;s Barber Shop</div>
                <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">9616 N Lamar Blvd, Austin · checked 22 Oct 2026</div>
              </div>
              <div className="shrink-0 font-mono text-xs text-muted-foreground">5 gaps, 1 pass, 2 couldn&apos;t check</div>
            </div>
            <AuditReceipt rows={BOBS_ROWS} />
          </div>
          </Viewfinder>
          <figcaption className="mt-3 text-sm text-muted-foreground">
            A real audit, run on public information. Bob&apos;s Barber Shop is a real Austin business; Outrive is not
            affiliated with it and did not contact it. This is what the audit in the product produces.
          </figcaption>
        </figure>
        <div className="mt-12">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">the site this audit built</p>
          <SampleSiteCard />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Built only from the facts the audit verified. Where the business has published nothing, the gap stays
            visible as a [REPLACE] tag instead of an invented price, menu or story.
          </p>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
