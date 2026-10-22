import { cn } from "@/lib/utils";

/** A lead (dot) travelling to a launched site (a window with its light on).
 *  Kept for compact spots (the floating CTA) where the wordmark cannot go. */
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

/**
 * The Placeholder wordmark: out[ ]rive.
 * The amber brackets are the honesty engine as a logo: the visible gap
 * where an unverified fact would go, never filled with a guess.
 * Decided 22 Oct 2026 (Brand Foundation). At favicon size it reduces
 * to the brackets alone (see app/icon.svg).
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Outrive"
      className={cn("whitespace-nowrap font-display lowercase leading-none tracking-[-0.03em]", className)}
    >
      out
      <span className="text-lamp">
        [<span className="inline-block w-[0.3em]" />]
      </span>
      rive
    </span>
  );
}

export function Logo({ className }: { className?: string; markClassName?: string }) {
  return <Wordmark className={cn("text-[1.5rem]", className)} />;
}
