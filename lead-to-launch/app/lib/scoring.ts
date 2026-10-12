import type { Lead, AuditResult, RankedLead } from "./types";

const HIGH_FIT_NICHES = ["dentist", "salon", "clinic", "spa", "gym", "restaurant", "cafe", "lawyer", "doctor", "coaching"];

/** How much a lead's web presence hurts them. More evidence-backed gaps means a warmer pitch. */
function sitePain(audit: AuditResult): number {
  if (!audit.hasWebsite) return audit.siteKind === "social" ? 23 : 25;
  if (audit.checks) {
    // Could not load or inspect the site: stay neutral instead of guessing.
    if (audit.checks.some((c) => c.id === "reachable" && c.status !== "pass")) return 8;
    const severity = audit.checks.filter((c) => c.status === "fail").reduce((sum, c) => sum + c.severity, 0);
    return Math.min(22, Math.round(severity * 2.5));
  }
  // Demo seed audits have no checks.
  const measured = audit.pageSpeedMeasured ?? audit.pageSpeedScore > 0;
  return !measured ? 10 : audit.pageSpeedScore < 50 ? 20 : audit.pageSpeedScore < 70 ? 10 : 0;
}

export function scoreLead(lead: Lead, audit: AuditResult): RankedLead {
  const noOrBadSite = sitePain(audit);
  const reviews = lead.reviewsCount ?? 0;
  const reviewVolume = Math.min(20, Math.round(reviews / 5));
  const rating = (lead.rating ?? 0) >= 4 ? 15 : (lead.rating ?? 0) >= 3.5 ? 8 : 0;
  const recency = reviews > 20 ? 10 : reviews > 5 ? 5 : 0;
  const reachable = (lead.phone ? 5 : 0) + (lead.whatsapp ? 5 : 0) + (lead.email ? 5 : 0);
  const fit = HIGH_FIT_NICHES.some((n) => lead.category.toLowerCase().includes(n)) ? 15 : 8;
  const score = noOrBadSite + reviewVolume + rating + recency + reachable + fit;
  return {
    ...lead,
    audit,
    score: Math.min(100, score),
    scoreBreakdown: {
      noOrBadSite,
      reviewVolume,
      rating,
      recency,
      reachable,
      industryFit: fit,
    },
  };
}
