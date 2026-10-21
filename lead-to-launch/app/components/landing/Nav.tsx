import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HowLink } from "./HowLink";
import { JumpLink } from "./JumpLink";
import { ArrowFlip, Magnetic } from "@/components/motion/ui";

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="glass mx-auto flex max-w-5xl items-center justify-between rounded-full px-5 py-2.5">
        <Link href="/" aria-label="Outrive home" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo />
        </Link>
        <nav aria-label="Sections" className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <HowLink className="u-sweep transition-colors hover:text-foreground" />
          <JumpLink ids={["directions-story", "directions"]} className="u-sweep transition-colors hover:text-foreground">The sites</JumpLink>
          <JumpLink ids={["rules-story", "rules"]} className="u-sweep transition-colors hover:text-foreground">Honest by default</JumpLink>
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/sign-in" className="u-sweep hidden px-1 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block">
            Sign in
          </Link>
          <Magnetic>
            <Link
              href="/app"
              className="group flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Start free
              <ArrowFlip className="h-3.5 w-3.5" />
            </Link>
          </Magnetic>
        </div>
      </div>
    </header>
  );
}
