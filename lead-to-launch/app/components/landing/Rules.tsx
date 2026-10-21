import { Reveal, SectionKicker } from "@/components/motion/ui";

const RULES = [
  {
    t: "No invented facts.",
    d: "Testimonials, years in business, awards and prices are never made up. Anything missing shows up as a visible [REPLACE] tag in the sample, so you fill it in before you send.",
  },
  {
    t: "Unknown is a valid answer.",
    d: "If a site only renders with JavaScript, those checks are marked unknown, not failed. You never accuse a business of something nobody saw.",
  },
  {
    t: "A Facebook page is not a website.",
    d: "Facebook, Instagram and link-in-bio pages are classified as social pages, and the pitch is written that way.",
  },
];

export function Rules() {
  return (
    <section id="rules" className="scroll-mt-24 border-t border-border/60 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionKicker text="the rules" />
          <h2 className="title-heavy font-display max-w-xl text-4xl leading-[1.05] sm:text-5xl">Built so you never send something false.</h2>
        </Reveal>
        <div className="mt-14 divide-y divide-border/80 border-y border-border/80">
          {RULES.map((r, i) => (
            <Reveal key={r.t} delay={i * 0.08}>
              <div className="group grid gap-3 py-8 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:gap-12">
                <h3 className="font-display text-2xl leading-tight transition-colors duration-300 group-hover:text-lamp">{r.t}</h3>
                <p className="max-w-xl leading-relaxed text-muted-foreground">{r.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
