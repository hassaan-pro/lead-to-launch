import { auth } from "@clerk/nextjs/server";
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
