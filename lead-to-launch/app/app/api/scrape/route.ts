import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Lead } from "@/lib/types";
import { requireUser, parseScrapeInput, isDemoMode } from "@/lib/api-guard";

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_ACTOR = process.env.APIFY_ACTOR ?? "compass~crawler-google-places";

async function loadSeed(): Promise<{ leads: Lead[] }> {
  const p = path.join(process.cwd(), "data", "leads-seed.json");
  const raw = await fs.readFile(p, "utf-8");
  const json = JSON.parse(raw);
  return { leads: json.leads as Lead[] };
}

/** A landline cannot be on WhatsApp. Only mark mobile-looking numbers (PK, UK, UAE, India). */
function looksLikeMobile(phone: unknown): boolean {
  if (typeof phone !== "string") return false;
  const d = phone.replace(/[^\d+]/g, "");
  return /^(\+?92|0)3\d{9}$/.test(d) || /^\+?447\d{9}$/.test(d) || /^\+?9715\d{8}$/.test(d) || /^\+?91[6-9]\d{9}$/.test(d);
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const input = parseScrapeInput(body);
  if (!input) {
    return NextResponse.json({ error: "Niche, city and a numeric count are required" }, { status: 400 });
  }

  // Demo data is opt-in only. Never pass fake leads off as real ones.
  if (isDemoMode()) {
    const { leads } = await loadSeed();
    return NextResponse.json({ source: "demo", leads: leads.slice(0, input.count) });
  }

  if (!APIFY_TOKEN) {
    return NextResponse.json({ error: "Scraper is not configured. Set APIFY_TOKEN, or DEMO_MODE=true for demo data." }, { status: 503 });
  }

  try {
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items`,
      {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${APIFY_TOKEN}` },
        body: JSON.stringify({
          searchStringsArray: [`${input.niche} in ${input.city}`],
          maxCrawledPlacesPerSearch: input.count,
          language: "en",
        }),
        signal: AbortSignal.timeout(55000),
      },
    );
    if (!runRes.ok) throw new Error(`Apify ${runRes.status}`);
    const items = (await runRes.json()) as Array<Record<string, unknown>>;

    const leads: Lead[] = [];
    for (const it of items) {
      const loc = it.location as { lat?: number; lng?: number } | undefined;
      // No coordinates means we cannot place it on the map. Skip it rather than invent a position.
      if (typeof loc?.lat !== "number" || typeof loc?.lng !== "number") continue;
      if (leads.length >= input.count) break;
      leads.push({
        id: `live-${String(leads.length + 1).padStart(2, "0")}`,
        name: String(it.title ?? it.name ?? "Unknown"),
        category: String(it.categoryName ?? input.niche),
        address: String(it.address ?? ""),
        city: input.city,
        phone: it.phone ? String(it.phone) : undefined,
        whatsapp: looksLikeMobile(it.phone) ? String(it.phone) : undefined,
        email: undefined,
        website: it.website ? String(it.website) : undefined,
        rating: typeof it.totalScore === "number" ? it.totalScore : undefined,
        reviewsCount: typeof it.reviewsCount === "number" ? it.reviewsCount : undefined,
        lat: loc.lat,
        lng: loc.lng,
        photosCount: typeof it.imagesCount === "number" ? it.imagesCount : undefined,
      });
    }

    if (leads.length === 0) {
      return NextResponse.json({ error: `No results for ${input.niche} in ${input.city}. Try a broader niche or city.` }, { status: 404 });
    }
    return NextResponse.json({ source: "apify", leads });
  } catch (e) {
    console.error("scrape failed", e);
    return NextResponse.json({ error: "Scrape failed. Check the Apify token and credits, then retry." }, { status: 502 });
  }
}
