import type { AuditResult, Lead } from "./types";
import type { Doc } from "../convex/_generated/dataModel";

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

/**
 * Rebuild the pipeline's Lead and AuditResult from a saved snapshot, so a
 * saved lead reopens as the selected prospect: the ranking re-derives from
 * these via scoreLead, and Build and Outreach run on it unchanged.
 * The lead's id is its placeKey: stable across scrapes and unique in the
 * run's lead list, whose scrape ids look nothing like it.
 * Fields an older snapshot never stored come back as unmeasured (a
 * PageSpeed of 0 with pageSpeedMeasured false, no checks), never invented:
 * the snapshot's own verdicts (gaps, strengths, biggest gap) are the facts
 * the reopened audit states.
 */
export function leadFromSaved(doc: Doc<"savedLeads">): Lead {
  return {
    id: doc.placeKey,
    placeId: doc.placeId,
    name: doc.name,
    category: doc.category,
    address: doc.address,
    city: doc.city,
    phone: doc.phone,
    whatsapp: doc.whatsapp,
    email: doc.email,
    website: doc.website,
    rating: doc.rating,
    reviewsCount: doc.reviewsCount,
    photosCount: doc.photosCount,
    lat: doc.lat ?? 0,
    lng: doc.lng ?? 0,
  };
}

export function auditFromSaved(doc: Doc<"savedLeads">): AuditResult {
  return {
    leadId: doc.placeKey,
    pageSpeedScore: doc.pageSpeedScore ?? 0,
    pageSpeedMeasured: doc.pageSpeedMeasured ?? false,
    hasWebsite: doc.hasWebsite,
    siteKind: (doc.siteKind as AuditResult["siteKind"]) ?? undefined,
    builder: doc.builder,
    mobileFriendly: doc.mobileFriendly ?? false,
    https: doc.https ?? false,
    hasSchema: doc.hasSchema ?? false,
    loadTimeMs: doc.loadTimeMs ?? 0,
    checks: doc.checks,
    gaps: doc.gaps,
    strengths: doc.strengths,
    biggestGap: doc.biggestGap,
    opportunity: doc.opportunity,
  };
}
