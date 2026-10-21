"use client";

import { useEffect, useSyncExternalStore } from "react";

const KEY = "l2l-motion";
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  // The page class changes when the visitor opts in, so watch it too.
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => {
    mq.removeEventListener("change", onChange);
    mo.disconnect();
  };
}

const snapshot = () => window.matchMedia(QUERY).matches && !document.documentElement.classList.contains("force-motion");

/**
 * People whose device asks for reduced motion see the still page by default. This lets them choose the
 * animated version for themselves, and remembers it for the session.
 */
export function MotionOptIn() {
  const show = useSyncExternalStore(subscribe, snapshot, () => false);

  useEffect(() => {
    if (sessionStorage.getItem(KEY) === "1") document.documentElement.classList.add("force-motion");
  }, []);

  if (!show) return null;
  return (
    <div className="fixed inset-x-4 top-20 z-40 mx-auto max-w-md rounded-xl border border-border bg-card/95 p-4 text-sm shadow-lg">
      <p className="leading-relaxed text-muted-foreground">Your device asks for reduced motion, so you are seeing the still version of this page.</p>
      <button
        type="button"
        onClick={() => {
          sessionStorage.setItem(KEY, "1");
          document.documentElement.classList.add("force-motion");
        }}
        className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Play the animated version
      </button>
    </div>
  );
}
