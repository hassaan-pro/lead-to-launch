import { Reveal, SectionKicker } from "@/components/motion/ui";

const CAPTIONS = [
  { a: "Ritual steps", b: "Rose clay and ink, for a bridal salon" },
  { a: "Split stage", b: "Night ink and brass, for a city hotel" },
  { a: "Soft bento", b: "Clinical blue, for a dental clinic" },
];

function Ritual() {
  return (
    <div className="h-full rounded-xl bg-[#F3E9E2] p-4 text-[#2A1F1C]">
      <div className="font-display text-[19px] leading-[1.02]">Four steps to your wedding morning</div>
      <ol className="mt-4 divide-y divide-[#2A1F1C]/15 text-[10px]">
        {["Arrive and settle", "A quiet consultation", "The work, unhurried", "Leave glowing"].map((t, i) => (
          <li key={t} className="flex gap-2 py-2"><span className="opacity-50">{i + 1}</span>{t}</li>
        ))}
      </ol>
      <div className="mt-4 inline-block rounded-full bg-[#B5533C] px-3 py-1.5 text-[9px] text-white">Book a trial</div>
    </div>
  );
}

function Stage() {
  return (
    <div className="grid h-full grid-cols-[42%_1fr] gap-2 rounded-xl bg-[#0E1114] p-3 text-[#EDE3CF]">
      <div className="flex flex-col justify-between">
        <div>
          <div className="font-display text-[17px] leading-none">Meridian</div>
          <div className="mt-1.5 text-[9px] opacity-60">Congress Ave, Austin</div>
        </div>
        <div className="rounded-full bg-[#C9A55B] px-2.5 py-1.5 text-center text-[9px] font-medium text-[#14100A]">Check availability</div>
      </div>
      <div className="space-y-2">
        {["#2B2A26", "#38342C", "#241F19"].map((c, i) => (
          <div key={c} className="rounded-md" style={{ background: c, height: i === 0 ? 76 : 52 }} />
        ))}
      </div>
    </div>
  );
}

function Bento() {
  return (
    <div className="grid h-full grid-cols-3 grid-rows-3 gap-1.5 rounded-xl bg-[#E9EEF2] p-3 text-[#102A3A]">
      <div className="col-span-2 row-span-2 rounded-lg bg-white p-2.5">
        <div className="font-display text-[15px] leading-tight">Gentle dentistry, no surprises.</div>
        <div className="mt-1.5 text-[8px] opacity-60">4.9 stars, 1,480 reviews</div>
      </div>
      <div className="rounded-lg bg-[#2F6F8F] p-2 text-[8px] text-white">Book today</div>
      <div className="rounded-lg bg-white p-2 text-[8px]">Mon to Sat</div>
      <div className="rounded-lg bg-white p-2 text-[8px]">First visit FAQ</div>
      <div className="col-span-2 rounded-lg bg-white p-2 text-[8px]">Cleaning, whitening, braces, emergencies</div>
    </div>
  );
}

export function Directions() {
  const pieces = [<Ritual key="r" />, <Stage key="s" />, <Bento key="b" />];
  return (
    <section id="directions" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <SectionKicker text="the sites" />
          <h2 className="title-heavy font-display text-4xl leading-[1.05] sm:text-5xl">Never the same site twice.</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Before any code, each business gets a creative direction: a concept, one of twelve page architectures, a palette, type, and only the sections that earn their place. It remembers what you made last, so the next one does not repeat it.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {pieces.map((p, i) => (
            <Reveal key={CAPTIONS[i].a} delay={i * 0.1} className={i === 1 ? "sm:mt-10" : i === 2 ? "sm:mt-4" : ""}>
              <figure>
                <div aria-hidden="true" className="h-[290px] rounded-2xl border border-border bg-card p-2.5 transition-[border-color,transform] duration-300 ease-out hover:-translate-y-1 hover:border-lamp/50">{p}</div>
                <figcaption className="mt-3">
                  <div className="font-display text-base">{CAPTIONS[i].a}</div>
                  <div className="text-sm text-muted-foreground">{CAPTIONS[i].b}</div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground/80">Illustrations of three directions. The real sites are generated per business.</p>
      </div>
    </section>
  );
}
