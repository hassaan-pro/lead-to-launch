import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Lead, AuditResult } from "@/lib/types";
import { requireUser, clean } from "@/lib/api-guard";
import { fetchPage } from "@/lib/site-fetch";
import { analyzeSite, classifyWebsite, describeBiggestGap, describeOpportunity } from "@/lib/site-analyze";
import { getCachedAudit, setCachedAudit } from "@/lib/audit-cache";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

// Fetching a real site plus an optional PageSpeed call can take a while.
export const maxDuration = 60;

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
  const raw = j.lighthouseResult?.categories?.performance?.score;
  if (typeof raw !== "number") return null;
  const lcp = j.lighthouseResult?.audits?.["largest-contentful-paint"]?.numericValue ?? 0;
  return { score: Math.round(raw * 100), loadTimeMs: Math.round(lcp) };
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

  // Demo seed audits only exist for the demo lead ids.
  const seed = await loadSeedAudits();
  if (seed[lead.id]) return NextResponse.json({ audit: seed[lead.id] });

  const site = clean(lead.website, 300);
  const siteKind = classifyWebsite(site);

  if (siteKind !== "own") {
    const base = { leadId: lead.id, siteKind, hasWebsite: false, pageSpeedScore: 0, pageSpeedMeasured: false, mobileFriendly: false, https: false, hasSchema: false, loadTimeMs: 0 };
    const gaps = siteKind === "social" ? ["Only a social page, no website"] : ["No website at all"];
    const audit: AuditResult = {
      ...base,
      gaps,
      strengths: [],
      biggestGap: describeBiggestGap(lead, { siteKind }),
      opportunity: describeOpportunity(lead, { siteKind, gaps }),
    };
    return NextResponse.json({ audit });
  }

  // Repeat audits of the same site within a day skip the site fetch
  // and PageSpeed call. The cached audit is rewritten to this lead's
  // id, so scoring and saved lead joins still work when the same site
  // appears under two different lead ids.
  const cached = getCachedAudit(user.userId, site);
  if (cached) return NextResponse.json({ audit: { ...cached, leadId: lead.id }, cached: true });

  const limit = checkRateLimit(user.userId, "audit");
  if (!limit.allowed) {
    const r = rateLimitResponse(limit.resetInMs);
    return NextResponse.json(r.body, { status: r.status, headers: r.headers });
  }

  const [page, psi] = await Promise.all([fetchPage(site), pagespeed(site)]);
  const result = analyzeSite(lead, page, psi);
  const audit: AuditResult = {
    leadId: lead.id,
    siteKind: "own",
    hasWebsite: true,
    ...result,
    biggestGap: "",
  };
  audit.biggestGap = page.ok
    ? describeBiggestGap(lead, audit)
    : `Could not load their site from our server (${page.error ?? "no response"}). Check it by hand before pitching.`;
  audit.opportunity = page.ok ? describeOpportunity(lead, audit) : "Site could not be audited automatically. Verify manually.";
  if (page.ok) setCachedAudit(user.userId, site, audit);
  return NextResponse.json({ audit });
}
