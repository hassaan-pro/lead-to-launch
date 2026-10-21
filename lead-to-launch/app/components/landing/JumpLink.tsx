"use client";

/**
 * Anchor that works in both layouts. The motion page and the static page use different section ids,
 * so we scroll to whichever of the given ids is actually on screen.
 */
export function JumpLink({ ids, className, children }: { ids: string[]; className?: string; children: React.ReactNode }) {
  return (
    <a
      href={`#${ids[ids.length - 1]}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        const target = ids.map((id) => document.getElementById(id)).find((el) => el && el.offsetParent !== null);
        target?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      {children}
    </a>
  );
}
