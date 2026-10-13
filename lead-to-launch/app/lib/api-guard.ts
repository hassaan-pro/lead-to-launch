import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { ScrapeInput } from "./types";

/** Defense in depth: middleware already protects routes, this makes each handler safe on its own. */
export async function requireUser(): Promise<{ userId: string } | NextResponse> {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return { userId };
}

export function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export const MAX_SCRAPE_COUNT = 30;

export function parseScrapeInput(body: unknown): ScrapeInput | null {
  const b = (body ?? {}) as Record<string, unknown>;
  const niche = clean(b.niche, 60);
  const city = clean(b.city, 80);
  const count = Number(b.count);
  if (!niche || !city || !Number.isFinite(count)) return null;
  return { niche, city, count: Math.max(1, Math.min(MAX_SCRAPE_COUNT, Math.floor(count))) };
}

export const isDemoMode = () => process.env.DEMO_MODE === "true";

/**
 * Generation spends real Anthropic credits, so it is allowlist-only. Open sign-ups must never
 * be able to run it. Set GENERATION_ALLOWED_EMAILS to a comma-separated list of emails.
 */
export async function requireGenerator(): Promise<{ userId: string } | NextResponse> {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const allowed = (process.env.GENERATION_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length === 0) {
    return NextResponse.json({ error: "Site generation is switched off. Set GENERATION_ALLOWED_EMAILS in Vercel to enable it for your email." }, { status: 403 });
  }
  const u = await currentUser();
  const emails = (u?.emailAddresses ?? []).map((e) => e.emailAddress.toLowerCase());
  if (!emails.some((e) => allowed.includes(e))) {
    return NextResponse.json({ error: "Your account is not allowed to generate sites." }, { status: 403 });
  }
  return user;
}
