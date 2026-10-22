import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { JumpLink } from "./JumpLink";
import { NavMenu } from "./NavMenu";
import { MobileNav } from "./MobileNav";
import { ArrowFlip, Magnetic } from "@/components/motion/ui";

const itemCls = "block rounded-xl px-3 py-2.5 transition-colors hover:bg-secondary";
const itemTitle = "block text-sm font-medium text-foreground";
const itemDesc = "mt-0.5 block text-xs leading-relaxed text-muted-foreground";

/**
 * The header, on Clay's structure: a wide floating pill, the wordmark, a
 * grouped nav with a Product dropdown, then a plain sign in, a soft pill
 * and the black primary pill. No search box and no pricing link: Clay has
 * both, Outrive does not, and the header does not pretend otherwise.
 * Below lg the grouped nav gives way to a Menu button in the same pill,
 * opening the same links as a panel, the way Clay's mobile header does.
 */
export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="glass mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full py-2.5 pl-6 pr-2.5 shadow-[0_18px_50px_-20px_rgba(20,16,8,0.35)]">
        <Link href="/" aria-label="Outrive home" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo />
        </Link>
        <nav aria-label="Sections" className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
          <NavMenu label="Product">
            <JumpLink ids={["journey", "how"]} className={itemCls}>
              <span className={itemTitle}>How it works</span>
              <span className={itemDesc}>Find, audit, build and pitch, one business at a time</span>
            </JumpLink>
            <JumpLink ids={["proof-story", "proof"]} className={itemCls}>
              <span className={itemTitle}>The audit</span>
              <span className={itemDesc}>Every gap arrives with the evidence for it</span>
            </JumpLink>
            <JumpLink ids={["directions-story", "directions"]} className={itemCls}>
              <span className={itemTitle}>The sites</span>
              <span className={itemDesc}>A creative direction per business, never a template</span>
            </JumpLink>
            <JumpLink ids={["rules-story", "rules"]} className={itemCls}>
              <span className={itemTitle}>The rules</span>
              <span className={itemDesc}>Never pitch a lie: the honesty rules the tool enforces</span>
            </JumpLink>
          </NavMenu>
          <JumpLink ids={["proof-story", "proof"]} className="u-sweep transition-colors hover:text-foreground">
            The proof
          </JumpLink>
          <JumpLink ids={["rules-story", "rules"]} className="u-sweep transition-colors hover:text-foreground">
            Honest by default
          </JumpLink>
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <MobileNav>
            <JumpLink ids={["journey", "how"]} className={itemCls}>
              <span className={itemTitle}>How it works</span>
              <span className={itemDesc}>Find, audit, build and pitch, one business at a time</span>
            </JumpLink>
            <JumpLink ids={["proof-story", "proof"]} className={itemCls}>
              <span className={itemTitle}>The audit</span>
              <span className={itemDesc}>Every gap arrives with the evidence for it</span>
            </JumpLink>
            <JumpLink ids={["directions-story", "directions"]} className={itemCls}>
              <span className={itemTitle}>The sites</span>
              <span className={itemDesc}>A creative direction per business, never a template</span>
            </JumpLink>
            <JumpLink ids={["rules-story", "rules"]} className={itemCls}>
              <span className={itemTitle}>The rules</span>
              <span className={itemDesc}>Never pitch a lie: the honesty rules the tool enforces</span>
            </JumpLink>
            <div className="mx-3 my-1.5 border-t border-border/70" />
            <JumpLink ids={["proof-story", "proof"]} className={itemCls}>
              <span className={itemTitle}>The proof</span>
            </JumpLink>
            <JumpLink ids={["rules-story", "rules"]} className={itemCls}>
              <span className={itemTitle}>Honest by default</span>
            </JumpLink>
            <Link href="/sign-in" className={itemCls}>
              <span className={itemTitle}>Sign in</span>
            </Link>
          </MobileNav>
          <Link href="/sign-in" className="u-sweep hidden px-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block">
            Sign in
          </Link>
          <JumpLink
            ids={["proof-story", "proof"]}
            className="hidden rounded-full border border-border bg-background/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary md:inline-block"
          >
            See the proof
          </JumpLink>
          <Magnetic>
            <Link
              href="/app"
              className="group flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
