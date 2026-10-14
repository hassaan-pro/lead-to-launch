import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/60 px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Logo markClassName="h-6 w-6" className="text-foreground" />
          <span>Made in Lahore.</span>
        </div>
        <nav aria-label="Footer" className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/sign-in" className="transition-colors hover:text-foreground">Sign in</Link>
          <Link href="/app" className="transition-colors hover:text-foreground">Open the tool</Link>
        </nav>
      </div>
    </footer>
  );
}
