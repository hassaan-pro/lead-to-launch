const SHOPS = ["Salon", "Dental", "Cafe", "Gym", "Bakery", "Optician", "Florist", "Tailor", "Barber", "Clinic", "Tutor", "Spa"];

/**
 * A slow, seamless ticker of the twelve businesses from the closing street, run as a
 * rhythm break between the opening story and the audit. Pure decoration: the list is
 * duplicated for the loop and the whole strip is hidden from assistive tech.
 */
export function Marquee() {
  return (
    <div aria-hidden="true" className="marquee overflow-hidden border-y border-border/70 py-4">
      <div className="marquee-track flex w-max items-center">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {SHOPS.map((s) => (
              <span key={`${copy}-${s}`} className="flex items-center font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
                <span className="px-6">{s}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-lamp/70" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
