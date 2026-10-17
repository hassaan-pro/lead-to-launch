"use client";

/** Scrolls to the journey on wide screens, or the static pipeline everywhere else. */
export function HowLink({ className }: { className?: string }) {
  return (
    <a
      href="#how"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        const target = [document.getElementById("journey"), document.getElementById("how")].find((el) => el && el.offsetParent !== null);
        target?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      How it works
    </a>
  );
}
