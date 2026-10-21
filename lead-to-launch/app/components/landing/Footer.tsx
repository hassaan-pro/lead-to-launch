import Link from "next/link";
import { Logo, Wordmark } from "@/components/brand/Logo";

const RUN = ["Find", "Audit", "Rank", "Build", "Pitch"] as const;

const RULES = [
  "Couldn't check is an answer.",
  "A gap stays [ ] before a fact gets invented.",
  "A Facebook page is not a website.",
] as const;

const linkClass = "u-sweep text-foreground/80 transition-colors hover:text-foreground";
const labelClass = "font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground";

export function Footer() {
  return (
    <footer className="px-4 pb-6 pt-16 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-border bg-card px-6 py-10 sm:px-10 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1.2fr_1fr]">
          <div>
            <Logo className="text-foreground" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Win your niche, street by street. Outrive finds local businesses whose reputations are
              bigger than their websites, audits what they are missing, and shows up with the site
              already built.
            </p>
          </div>
          <nav aria-label="The run">
            <p className={labelClass}>The run</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {RUN.map((stage) => (
                <li key={stage}>
                  <Link href="/app" className={linkClass}>
                    {stage}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className={labelClass}>The rules</p>
            <ul className="mt-4 space-y-2.5 text-sm leading-snug text-foreground/80">
              {RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
          <nav aria-label="Start">
            <p className={labelClass}>Start</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/app" className={linkClass}>
                  Start free
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className={linkClass}>
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/" className={linkClass}>
                  Back to the top
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-14 select-none overflow-hidden" aria-hidden="true">
          <Wordmark className="block text-center text-[clamp(4.5rem,15vw,12.5rem)] text-foreground" />
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <span>© 2026 Outrive</span>
          <span>The brackets mean a gap we refused to fill with a guess.</span>
        </div>
      </div>
    </footer>
  );
}
