import { cn } from "@/lib/utils";

/** A lead (dot) travelling to a launched site (a window with its light on). */
export function LogoMark({ className, lit = true }: { className?: string; lit?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn("h-7 w-7", className)}>
      <circle cx="5.5" cy="16" r="3" fill="currentColor" />
      <path d="M10 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      <rect x="17" y="8" width="12.5" height="16" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="20.2" y="11.2" width="6.1" height="9.6" rx="1" fill={lit ? "var(--lamp)" : "currentColor"} opacity={lit ? 1 : 0.25} />
    </svg>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      <span className="font-display text-[1.15rem] leading-none tracking-[-0.03em]">Outrive</span>
    </span>
  );
}
