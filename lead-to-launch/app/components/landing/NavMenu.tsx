"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A Clay-style nav dropdown: opens on hover, toggles on click, closes on
 * Escape, on focus leaving the menu, or when an item inside is chosen.
 */
export function NavMenu({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
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
          "flex items-center gap-1.5 rounded-full py-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open && "text-foreground",
        )}
      >
        {label}
        <svg aria-hidden="true" viewBox="0 0 10 6" className={cn("h-[6px] w-[10px] transition-transform duration-200", open && "rotate-180")}>
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-3 transition-all duration-150",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0",
        )}
      >
        <div className="rounded-2xl border border-border bg-card p-2 shadow-[0_24px_60px_-24px_rgba(20,16,8,0.4)]">{children}</div>
      </div>
    </div>
  );
}
