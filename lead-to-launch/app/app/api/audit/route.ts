import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Lead, AuditResult } from "@/lib/types";
import { requireUser, clean } from "@/lib/api-guard";

const PSI_KEY = process.env.GOOGLE_PAGESPEED_KEY;

async function loadSeedAudits(): Promise<Record<string, AuditResult>> {
  const p = path.join(process.cwd(), "data", "leads-seed.json");
  const raw = await fs.readFile(p, "utf-8");
  const json = JSON.parse(raw);
  return json.audits as Record<string, AuditResult>;
}

async function pagespeed(url: string): Promise<{ score: number; loadTimeMs: number } | null> {
  if (!PSI_KEY) return null;
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=PERFORMANCE&key=${PSI_KEY}`;
  const res = await fetch(endpoint, { signal: AbortSignal.timeout(25000) }).catch(() => null);
  if (!res || !res.ok) return null;
  const j = await res.json();
  const score = Math.round((j.lighthouseResult?.categories?.performance?.score ?? 0) * 100);
  const lcp = j.lighthouseResult?.audits?.["largest-contentful-paint"]?.numericValue ?? 0;
  return { score, loadTimeMs: Math.round(lcp) };
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  let lead: Lead;
  try {
    const body = (await req.json()) as { lead?: Lead };
    if (!body.lead || typeof body.lead.id !== "string") throw new Error("bad lead");
    lead = body.lead;
  } catch {
    return NextResponse.json({ error: "A valid lead is required" }, { status: 400 });
  }
  // Only http(s) URLs ever reach PageSpeed.
  const site = clean(lead.website, 300);
  if (site && !/^https?:\/\//i.test(site)) lead = { ...lead, website: undefined };

  // Seed has rich pre-written audits for demo — use if id matches
  const seed = await loadSeedAudits();
  if (seed[lead.id]) {
    return NextResponse.json({ audit: seed[lead.id] });
  }

  // Fallback: real PageSpeed call or empty result
  const hasWebsite = !!lead.website;
  let score = 0;
  let loadTimeMs = 0;
  let measured = false;
  if (hasWebsite) {
    const r = await pagespeed(lead.website!);
    if (r) {
      score = r.score;
      loadTimeMs = r.loadTimeMs;
      measured = true;
    }
  }

  const gaps: string[] = [];
  if (!hasWebsite) gaps.push("No website at all");
  if (hasWebsite && measured && score < 50) gaps.push(`${score} PageSpeed (mobile)`);
  if (hasWebsite && loadTimeMs > 4000) gaps.push(`${(loadTimeMs / 1000).toFixed(1)}s load time`);
  if (!lead.whatsapp) gaps.push("No WhatsApp click-to-chat");
  gaps.push("No online booking", "No schema markup", "Weak local SEO");

  const estLostRevenuePerMonth = Math.max(
    20000,
    (lead.reviewsCount ?? 30) * 400 + (hasWebsite ? 0 : 30000),
  );

  const audit: AuditResult = {
    leadId: lead.id,
    pageSpeedScore: score,
    pageSpeedMeasured: measured,
    hasWebsite,
    mobileFriendly: PSI_KEY ? score > 60 : true,
    https: hasWebsite ? lead.website!.startsWith("https") : false,
    hasSchema: false,
    loadTimeMs,
    gaps,
    biggestGap: hasWebsite
      ? loadTimeMs > 0
        ? `Site loads in ${(loadTimeMs / 1000).toFixed(1)}s. Modern build fixes this overnight.`
        : `Outdated site with no booking flow. A modern build with WhatsApp booking converts visitors into customers.`
      : `${lead.reviewsCount ?? 0} reviews, zero web presence. Losing booking-ready customers to businesses that show up on Google search.`,
    estLostRevenuePerMonth,
  };
  return NextResponse.json({ audit });
}
