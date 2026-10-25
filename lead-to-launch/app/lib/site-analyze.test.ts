import { describe, expect, it } from "vitest";
import { analyzeSite, classifyWebsite, describeBiggestGap, describeOpportunity } from "./site-analyze";
import type { Lead } from "./types";
import type { FetchedPage } from "./site-fetch";

const lead: Lead = {
  id: "lead-1",
  name: "Test Salon",
  category: "Salon",
  address: "1 Main St",
  city: "Austin",
  lat: 0,
  lng: 0,
  rating: 4.7,
  reviewsCount: 173,
};

function page(over: Partial<FetchedPage> = {}): FetchedPage {
  return {
    ok: true,
    finalUrl: "https://testsalon.example/",
    status: 200,
    https: true,
    ttfbMs: 200,
    totalMs: 400,
    bytes: 1000,
    html: "<html><head><title>Test Salon</title></head><body><p>Welcome to our salon, with plenty of readable text about cuts and colour and care for every client who walks through the door.</p></body></html>",
    ...over,
  };
}

describe("classifyWebsite", () => {
  it("calls a Facebook page social, not a website", () => {
    expect(classifyWebsite("https://www.facebook.com/testsalon")).toBe("social");
    expect(classifyWebsite("instagram.com/testsalon")).toBe("social");
  });

  it("calls a real domain owned, and an empty value none", () => {
    expect(classifyWebsite("https://testsalon.example")).toBe("own");
    expect(classifyWebsite("")).toBe("none");
    expect(classifyWebsite(undefined)).toBe("none");
  });
});

describe("analyzeSite", () => {
  it("flags a page with no viewport, no booking, and no prices", () => {
    const result = analyzeSite(lead, page(), null);
    const checks = result.checks ?? [];
    const ids = checks.map((c) => c.id);
    expect(ids).toContain("viewport");
    expect(checks.find((c) => c.id === "viewport")?.status).toBe("fail");
    expect(checks.find((c) => c.id === "booking")?.status).toBe("fail");
    expect(result.gaps.length).toBeGreaterThan(0);
    expect(result.https).toBe(true);
  });

  it("passes booking when a booking link is present", () => {
    const result = analyzeSite(
      lead,
      page({ html: "<html><head><title>Test Salon</title><meta name=\"viewport\" content=\"width=device-width\"></head><body><a href=\"https://calendly.com/testsalon\">Book now</a><p>Welcome to our salon, with plenty of readable text about cuts and colour and care for every client who walks through the door.</p></body></html>" }),
      null,
    );
    const checks = result.checks ?? [];
    expect(checks.find((c) => c.id === "booking")?.status).toBe("pass");
    expect(checks.find((c) => c.id === "viewport")?.status).toBe("pass");
  });

  it("does not guess when the site cannot be loaded", () => {
    const result = analyzeSite(lead, page({ ok: false, error: "timeout" }), null);
    expect(result.checks).toHaveLength(1);
    expect(result.checks?.[0].id).toBe("reachable");
    expect(result.checks?.[0].status).toBe("unknown");
    expect(result.gaps).toEqual([]);
  });
});

describe("describeBiggestGap and describeOpportunity", () => {
  it("states the no-website gap in verifiable words", () => {
    expect(describeBiggestGap(lead, { siteKind: "none" })).toContain("no website");
    expect(describeOpportunity(lead, { siteKind: "none", gaps: [] })).toContain("no website at all");
  });

  it("picks the worst failing check first", () => {
    const result = analyzeSite(lead, page(), null);
    const gap = describeBiggestGap(lead, { siteKind: "own", checks: result.checks });
    expect(gap).toContain("booking");
  });
});
