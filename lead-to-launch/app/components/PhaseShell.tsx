"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

// One phase of the run, dressed as a dashboard screen: a quiet header, the
// work itself on a single raised card, and the phase controls in a floating
// pill bar instead of a full-width strip. The entrance is the reference
// dashboard's move: header and card rise in sequence on a soft spring, and
// switching phases slides the old screen out as the new one lands.
export function PhaseShell({
  title,
  subtitle,
  children,
  onPrev,
  onNext,
  nextLabel = "Next phase",
  nextDisabled = false,
  prevDisabled = false,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  prevDisabled?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ type: "spring", stiffness: 110, damping: 22 }}
      className="w-full pb-32"
    >
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.45, ease: "easeOut" }}
        className="mb-8"
      >
        <h1 className="font-display text-4xl leading-[1.05] text-foreground sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 100, damping: 21 }}
        className="rounded-[1.6rem] border border-border/70 bg-card/70 p-4 shadow-[0_24px_50px_-32px_rgba(20,16,8,0.35)] sm:p-6"
      >
        {children}
      </motion.div>

      <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:left-[248px]">
        <div className="flex items-center gap-2 rounded-full border border-border bg-background/90 p-1.5 shadow-[0_18px_40px_-18px_rgba(20,16,8,0.45)] backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <Button
            variant="ghost"
            onClick={onPrev}
            disabled={prevDisabled || !onPrev}
            aria-label="Go to previous phase"
            className="h-10 rounded-full px-4"
          >
            <ChevronLeft className="mr-1.5 h-4 w-4" strokeWidth={1.75} /> Back
          </Button>
          {onNext ? (
            <Button
              onClick={onNext}
              disabled={nextDisabled}
              aria-label={nextLabel}
              className="h-10 rounded-full px-5 transition-transform duration-150 active:scale-[0.98]"
            >
              {nextLabel} <ChevronRight className="ml-1.5 h-4 w-4" strokeWidth={1.75} />
            </Button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </motion.div>
  );
}
