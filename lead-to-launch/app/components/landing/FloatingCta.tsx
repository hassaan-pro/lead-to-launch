"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const visibleOf = (ids: string[]) => ids.map((id) => document.getElementById(id)).find((el) => el && el.offsetParent !== null) ?? null;

/**
 * A pill that carries the call to action once the opening demo is behind you, and steps aside when the
 * closing scene brings its own. On phones the opening is the static hero, so it appears after that.
 */
export function FloatingCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const open = visibleOf(["journey", "hero"]);
      const close = visibleOf(["start-story", "start"]);
      const vh = window.innerHeight;
      const pastOpening = !!open && (open.id === "journey" ? open.getBoundingClientRect().bottom < vh - 40 : open.getBoundingClientRect().bottom < 0);
      const atClosing = !!close && close.getBoundingClientRect().top < vh * 0.45;
      setShow(pastOpening && !atClosing);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed bottom-4 left-1/2 z-40 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 transition-[opacity,transform] duration-300 ease-out md:bottom-5",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <div className="glass flex items-center gap-3 rounded-full py-1.5 pl-4 pr-1.5">
        <LogoMark className="h-6 w-6" />
        <Link
          href="/app"
          tabIndex={show ? 0 : -1}
          className="whitespace-nowrap rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Open Outrive
        </Link>
      </div>
    </div>
  );
}
