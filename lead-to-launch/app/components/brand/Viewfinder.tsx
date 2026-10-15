import { cn } from "@/lib/utils";

/** One chamfered corner. Rotated into the other three by the parent. */
function Corner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true" className={cn("absolute h-11 w-11", className)}>
      <path d="M1 44V14L14 1H44" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter" />
    </svg>
  );
}

/**
 * A camera viewfinder drawn around its content: chamfered corners, edge bars, and a crosshair outside.
 * It marks the thing being examined, so we only use it where the product is looking at something.
 */
export function Viewfinder({ children, className, tone = "bone" }: { children: React.ReactNode; className?: string; tone?: "bone" | "lamp" }) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <div aria-hidden="true" className={cn("pointer-events-none absolute -inset-3", tone === "lamp" ? "text-lamp/80" : "text-foreground/45")}>
        <Corner className="left-0 top-0" />
        <Corner className="right-0 top-0 rotate-90" />
        <Corner className="bottom-0 right-0 rotate-180" />
        <Corner className="bottom-0 left-0 -rotate-90" />
        <span className="absolute left-0 top-1/2 h-20 w-[3px] -translate-y-1/2 bg-current" />
        <span className="absolute right-0 top-1/2 h-20 w-[3px] -translate-y-1/2 bg-current" />
        <svg viewBox="0 0 12 12" fill="none" className="absolute -left-5 -top-5 h-3 w-3" stroke="currentColor" strokeWidth="1.2">
          <path d="M6 0v12M0 6h12" />
        </svg>
      </div>
    </div>
  );
}
