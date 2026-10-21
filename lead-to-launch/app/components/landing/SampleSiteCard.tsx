import { cn } from "@/lib/utils";

const CHIP =
  "inline-flex items-center rounded-md border border-lamp/50 bg-lamp/10 px-2 py-1 font-mono text-[11px] leading-4 text-foreground/85";

/**
 * The sample site the Bob's Barber Shop audit built (see BOBS_ROWS).
 * Every line is a fact that audit verified on public pages on 22 Oct 2026.
 * Where the business has published nothing, the gap stays on the page as a
 * [REPLACE] chip: no invented prices, no invented menu, no invented story,
 * and no fake domain in the browser bar.
 */
export function SampleSiteCard({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center gap-2 border-b border-border/80 px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">sample site, built by Outrive</span>
      </div>
      <div className="px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-display text-2xl leading-tight">Bob&apos;s Barber Shop</div>
            <div className="mt-1 text-sm text-muted-foreground">Barber shop · 9616 N Lamar Blvd, Austin</div>
          </div>
          <span className="rounded-full border border-border px-3 py-1.5 font-mono text-[11px] text-foreground/85">
            4.7 stars · 173 Google reviews
          </span>
        </div>
        <blockquote className="mt-5 border-l-2 border-lamp pl-4 text-[15px] leading-relaxed text-foreground/85">
          &ldquo;I found my barber for life.&rdquo;
          <span className="mt-1 block font-mono text-[11px] text-muted-foreground">Michael, from Google reviews</span>
        </blockquote>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className={CHIP}>[REPLACE: prices, never published]</span>
          <span className={CHIP}>[REPLACE: service menu]</span>
          <span className={CHIP}>[REPLACE: the shop&apos;s story]</span>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
          <span className="font-mono text-[11px] leading-relaxed text-muted-foreground">
            Mon 9-5:45 · Tue-Fri 8-5:45
            <br />
            Sat 8-1 · Sun closed
          </span>
          <span className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Call to book · (512) 339-1630
          </span>
        </div>
      </div>
    </div>
  );
}
