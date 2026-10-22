"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, Check, FileSearch, Search, Send, Sparkles, Trophy } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

// The dashboard sidebar, in the shape of the reference dashboard the user
// picked: logo at the top, one quiet nav list with an animated pill behind
// the active item, account controls at the bottom. The five phases are the
// nav; Saved leads sits under its own divider. Phones never see this (the
// top bar and Stepper cover them), it renders from md up.
export const PHASE_NAV = [
  { id: 1, label: "Scrape", icon: Search },
  { id: 2, label: "Audit", icon: FileSearch },
  { id: 3, label: "Rank", icon: Trophy },
  { id: 4, label: "Build", icon: Sparkles },
  { id: 5, label: "Outreach", icon: Send },
] as const;

function NavItem({
  active,
  done,
  icon: Icon,
  label,
  onClick,
  pillId,
}: {
  active: boolean;
  done?: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  pillId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active && (
        <motion.span
          layoutId={pillId}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="absolute inset-0 rounded-full bg-primary shadow-[0_12px_24px_-12px_rgba(20,16,8,0.55)]"
        />
      )}
      <Icon className="relative z-10 h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span className="relative z-10 font-medium">{label}</span>
      {done && !active && <Check className="relative z-10 ml-auto h-4 w-4 text-lamp" strokeWidth={2} />}
      {done && active && <Check className="relative z-10 ml-auto h-4 w-4" strokeWidth={2} />}
    </button>
  );
}

export function DashboardNav({
  view,
  phase,
  completed,
  onPhase,
  onView,
}: {
  view: "pipeline" | "saved";
  phase: number;
  completed: Set<number>;
  onPhase: (n: number) => void;
  onView: (v: "pipeline" | "saved") => void;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-border/70 bg-card/50 px-4 py-6 md:flex">
      <Link href="/" aria-label="Outrive home" className="px-2">
        <Logo />
      </Link>

      <nav aria-label="Pipeline phases" className="mt-10 flex flex-col gap-1">
        {PHASE_NAV.map((item) => (
          <NavItem
            key={item.id}
            pillId="phase-pill"
            icon={item.icon}
            label={item.label}
            active={view === "pipeline" && phase === item.id}
            done={completed.has(item.id)}
            onClick={() => {
              onView("pipeline");
              onPhase(item.id);
            }}
          />
        ))}
      </nav>

      <div className="mx-2 my-5 border-t border-border/70" />

      <nav aria-label="Library" className="flex flex-col gap-1">
        <NavItem
          pillId="phase-pill"
          icon={Bookmark}
          label="Saved leads"
          active={view === "saved"}
          onClick={() => onView("saved")}
        />
      </nav>

      <p className="mt-auto px-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
        Win your niche,
        <br />
        street by street.
      </p>
      <div className="mt-4 flex items-center gap-2 px-2">
        <UserButton />
        <ThemeToggle />
        <Link href="/" className="ml-auto text-sm text-muted-foreground transition-colors hover:text-foreground">
          Back to site
        </Link>
      </div>
    </aside>
  );
}
