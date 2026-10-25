import { describe, expect, it } from "vitest";
import { scoreLead } from "./scoring";
import type { AuditResult, Lead } from "./types";

function lead(over: Partial<Lead> = {}): Lead {
  return {
    id: "lead-1",
    name: "Bob's Barber Shop",
    category: "Barber salon",
    address: "1 Main St",
    city: "Austin",
    lat: 0,
    lng: 0,
    ...over,
  };
}

function audit(over: Partial<AuditResult> = {}): AuditResult {
  return {
    leadId: "lead-1",
    pageSpeedScore: 0,
    hasWebsite: false,
    mobileFriendly: false,
    https: false,
    hasSchema: false,
    loadTimeMs: 0,
    gaps: [],
    biggestGap: "",
    ...over,
  };
}

describe("scoreLead", () => {
  it("rewards a no-website lead with strong reviews and reachable contacts", () => {
    const ranked = scoreLead(
      lead({ rating: 4.7, reviewsCount: 173, phone: "+1 512-339-1630", whatsapp: "+1 512-339-1630" }),
      audit({ siteKind: "none", hasWebsite: false }),
    );
    // sitePain 25 + reviewVolume 20 + rating 15 + recency 10 + reachable 10 + fit 15
    expect(ranked.score).toBe(95);
    expect(ranked.scoreBreakdown).toEqual({
      noOrBadSite: 25,
      reviewVolume: 20,
      rating: 15,
      recency: 10,
      reachable: 10,
      industryFit: 15,
    });
  });

  it("treats a social-only presence as slightly less painful than no presence", () => {
    const ranked = scoreLead(
      lead({ rating: 4.0, reviewsCount: 10 }),
      audit({ siteKind: "social", hasWebsite: false }),
    );
    expect(ranked.scoreBreakdown.noOrBadSite).toBe(23);
  });

  it("caps the score at 100", () => {
    const ranked = scoreLead(
      lead({ rating: 5, reviewsCount: 5000, phone: "x", whatsapp: "x", email: "x@example.com" }),
      audit({ siteKind: "none", hasWebsite: false }),
    );
    expect(ranked.score).toBeLessThanOrEqual(100);
  });

  it("scores failing checks by severity, capped, instead of guessing", () => {
    const ranked = scoreLead(
      lead({ category: "Software", rating: 3, reviewsCount: 0 }),
      audit({
        siteKind: "own",
        hasWebsite: true,
        checks: [
          { id: "booking", label: "No online booking path", status: "fail", severity: 3, evidence: "none" },
          { id: "viewport", label: "Not built for mobile screens", status: "fail", severity: 3, evidence: "none" },
          { id: "https", label: "Secure (HTTPS)", status: "pass", severity: 2, evidence: "https" },
        ],
      }),
    );
    // severity 6 * 2.5 = 15
    expect(ranked.scoreBreakdown.noOrBadSite).toBe(15);
    expect(ranked.scoreBreakdown.industryFit).toBe(8);
  });

  it("stays neutral when the site could not be loaded", () => {
    const ranked = scoreLead(
      lead({}),
      audit({
        siteKind: "own",
        hasWebsite: true,
        checks: [{ id: "reachable", label: "Site could not be loaded", status: "unknown", severity: 1, evidence: "timeout" }],
      }),
    );
    expect(ranked.scoreBreakdown.noOrBadSite).toBe(8);
  });
});
