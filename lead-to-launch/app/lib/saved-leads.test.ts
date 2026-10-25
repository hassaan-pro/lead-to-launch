import { describe, expect, it } from "vitest";
import { placeKeyOf, tierOf } from "./saved-leads";
import type { AuditResult, Lead } from "./types";

const lead: Lead = {
  id: "live-01",
  name: "Bob's Barber Shop",
  category: "Barber",
  address: "123 Main St, Austin",
  city: "Austin",
  lat: 0,
  lng: 0,
  reviewsCount: 173,
};

function audit(over: Partial<AuditResult> = {}): AuditResult {
  return {
    leadId: "live-01",
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

describe("placeKeyOf", () => {
  it("prefers the permanent place id over the changing scrape id", () => {
    expect(placeKeyOf({ ...lead, placeId: "ChIJ123" })).toBe("place:ChIJ123");
  });

  it("falls back to a slug of name and address", () => {
    expect(placeKeyOf(lead)).toBe("local:bob-s-barber-shop-123-main-st-austin");
  });
});

describe("tierOf", () => {
  it("tiers social-only with strong reviews, no-website with demand, and failing own sites", () => {
    expect(tierOf(lead, audit({ siteKind: "social", hasWebsite: false }))).toBe("Social-only, strong reviews");
    expect(tierOf(lead, audit({ siteKind: "none", hasWebsite: false }))).toBe("No website, 100+ reviews");
    expect(tierOf(lead, audit({ siteKind: "own", hasWebsite: true, gaps: ["No booking path"] }))).toBe("Own site, failing checks");
    expect(tierOf({ ...lead, reviewsCount: 5 }, audit({ siteKind: "none", hasWebsite: false }))).toBe("Other");
  });
});
