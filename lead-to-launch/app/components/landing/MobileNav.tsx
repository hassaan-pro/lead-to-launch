"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The mobile half of the Clay-style header. Below lg the grouped nav is
 * hidden, so the pill carries a Menu button instead: it opens a panel
 * under the pill with the same links, and closes on Escape, on focus
 * leaving the menu, or when an item inside is chosen.
 */
export function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative lg:hidden"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open && "text-foreground",
        )}
      >
        Menu
        <svg aria-hidden="true" viewBox="0 0 10 6" className={cn("h-[6px] w-[10px] transition-transform duration-200", open && "rotate-180")}>
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "absolute right-0 top-full z-50 w-[min(19rem,calc(100vw-2.5rem))] pt-3 transition-all duration-150",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0",
        )}
      >
        <div className="rounded-2xl border border-border bg-card p-2 shadow-[0_24px_60px_-24px_rgba(20,16,8,0.4)]">{children}</div>
      </div>
    </div>
  );
}
