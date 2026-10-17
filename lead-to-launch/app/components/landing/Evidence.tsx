import { AuditReceipt, EXAMPLE_ROWS } from "./AuditReceipt";
import { Viewfinder } from "@/components/brand/Viewfinder";

export function Evidence() {
  return (
    <section id="proof" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start lg:pt-6">
          <h2 className="title-heavy font-display text-4xl leading-[1.05] sm:text-5xl">Every gap comes with proof.</h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Telling a business its website is outdated gets ignored. Telling it there is no booking button on the homepage gets checked, and believed.
          </p>
          <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
            Lead to Launch opens each site and writes down what it actually saw, so every line in your pitch is something the owner can verify in ten seconds.
          </p>
        </div>

        <figure>
          <Viewfinder className="mx-3">
          <div className="rounded-xl border border-border bg-card px-6 py-2 sm:px-8">
            <div className="flex items-baseline justify-between border-b border-border/80 py-4">
              <div className="font-display text-lg"><span aria-hidden="true" className="mr-2 text-lamp">+</span>Noor Atelier</div>
              <div className="font-mono text-xs text-muted-foreground">6 gaps, 1 pass, 1 not checkable</div>
            </div>
            <AuditReceipt rows={EXAMPLE_ROWS} />
          </div>
          </Viewfinder>
          <figcaption className="mt-3 text-sm text-muted-foreground">An example audit. Real ones are generated for each business you scrape.</figcaption>
        </figure>
      </div>
    </section>
  );
}
