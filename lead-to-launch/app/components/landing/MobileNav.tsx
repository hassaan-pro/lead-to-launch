"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The mobile half of the header, on Clay's phone pattern: the bar itself
 * carries only the wordmark, the soft pill and this hamburger. The panel
 * hangs from the pill (the pill is the positioned ancestor) at full pill
 * width, so it can never slide off the side of the screen. It closes on
 * Escape, on focus leaving the menu, or when an item inside is chosen.
 */
export function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="lg:hidden"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span aria-hidden="true" className="relative block h-[12px] w-5">
          <span className={cn("absolute left-0 top-0 h-[1.5px] w-full rounded bg-current transition-all duration-200", open && "top-1/2 -translate-y-1/2 rotate-45")} />
          <span className={cn("absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 rounded bg-current transition-opacity duration-200", open && "opacity-0")} />
          <span className={cn("absolute bottom-0 left-0 h-[1.5px] w-full rounded bg-current transition-all duration-200", open && "bottom-1/2 translate-y-1/2 -rotate-45")} />
        </span>
      </button>
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "absolute inset-x-0 top-full z-50 pt-3 transition-all duration-150",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0",
        )}
      >
        <div className="max-h-[calc(100svh-7rem)] overflow-y-auto rounded-3xl border border-border bg-card p-2 shadow-[0_24px_60px_-24px_rgba(20,16,8,0.4)]">{children}</div>
      </div>
    </div>
  );
}
