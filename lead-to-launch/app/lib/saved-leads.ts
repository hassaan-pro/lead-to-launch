import type { AuditResult, Lead } from "./types";

/**
 * Stable identity for a business across scrapes. The scrape route's lead id
 * changes every run (live-01, live-02), so saved leads key on Google's
 * permanent place ID when the scraper returns one. Demo and older leads
 * fall back to a name and address key, which is weaker but honest.
 */
export function placeKeyOf(lead: Lead): string {
  if (lead.placeId) return `place:${lead.placeId}`;
  const slug = `${lead.name}|${lead.address}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `local:${slug}`;
}

/**
 * Which targeting tier a lead falls in, from the facts the audit verified.
 * Mirrors the tier definitions in the product plan: social-only with strong
 * reviews, no website with real demand, or an own site failing real checks.
 */
export function tierOf(lead: Lead, audit: AuditResult): string {
  const reviews = lead.reviewsCount ?? 0;
  if (audit.siteKind === "social" && reviews >= 100) return "Social-only, strong reviews";
  if (!audit.hasWebsite && reviews >= 100) return "No website, 100+ reviews";
  if (audit.hasWebsite && audit.gaps.length > 0) return "Own site, failing checks";
  return "Other";
}
