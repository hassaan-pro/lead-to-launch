import { describe, expect, it, vi, afterEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({ userId: "user_1" })),
  currentUser: vi.fn(async () => ({
    emailAddresses: [{ emailAddress: "hassaan66ahmed@gmail.com" }],
  })),
}));

vi.mock("@/lib/site-fetch", () => ({
  fetchPage: vi.fn(async () => ({
    ok: true,
    finalUrl: "https://testsalon.example/",
    status: 200,
    https: true,
    ttfbMs: 100,
    totalMs: 200,
    bytes: 1200,
    html: `<html><head><title>Test Salon</title><meta name="viewport" content="width=device-width"></head><body><a href="https://calendly.com/testsalon">Book now</a><a href="tel:+15125550100">Call</a><p>Welcome to our salon, with plenty of readable text about cuts and colour and care for every client who walks through the door.</p></body></html>`,
  })),
}));

describe("POST /api/audit, own site with PageSpeed mocked", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GOOGLE_PAGESPEED_KEY;
  });

  it("runs the site fetch and PageSpeed in parallel and returns a measured score", async () => {
    vi.resetModules();
    process.env.GOOGLE_PAGESPEED_KEY = "test-psi-key";
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        lighthouseResult: {
          categories: { performance: { score: 0.9 } },
          audits: { "largest-contentful-paint": { numericValue: 1200 } },
        },
      }),
    })));
    const { POST } = await import("./route");
    const req = new Request("http://test/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead: {
          id: "live-98",
          name: "Test Salon",
          category: "Salon",
          address: "Main Street, Austin",
          city: "Austin",
          website: "https://testsalon.example",
          lat: 30.27,
          lng: -97.74,
        },
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { audit: { siteKind: string; hasWebsite: boolean; pageSpeedScore: number; pageSpeedMeasured: boolean } };
    expect(data.audit.siteKind).toBe("own");
    expect(data.audit.hasWebsite).toBe(true);
    expect(data.audit.pageSpeedScore).toBe(90);
    expect(data.audit.pageSpeedMeasured).toBe(true);
  });
});

describe("POST /api/audit, cached repeat audit", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GOOGLE_PAGESPEED_KEY;
  });

  it("audits a site once, then serves the second lead for the same site from cache with its own lead id", async () => {
    vi.resetModules();
    process.env.GOOGLE_PAGESPEED_KEY = "test-psi-key";
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        lighthouseResult: {
          categories: { performance: { score: 0.9 } },
          audits: { "largest-contentful-paint": { numericValue: 1200 } },
        },
      }),
    })));
    const { POST } = await import("./route");
    const { fetchPage } = await import("@/lib/site-fetch");
    const { clearAuditCache } = await import("@/lib/audit-cache");
    clearAuditCache();
    vi.mocked(fetchPage).mockClear();

    async function auditLead(id: string) {
      const req = new Request("http://test/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: {
            id,
            name: "Cached Salon",
            category: "Salon",
            address: "Main Street, Austin",
            city: "Austin",
            website: "https://cachedsalon.example",
            lat: 30.27,
            lng: -97.74,
          },
        }),
      });
      const res = await POST(req);
      return (await res.json()) as { audit: { leadId: string; siteKind: string }; cached?: boolean };
    }

    const first = await auditLead("live-90");
    expect(first.audit.leadId).toBe("live-90");
    expect(first.cached).toBeUndefined();
    const second = await auditLead("live-91");
    expect(second.audit.leadId).toBe("live-91");
    expect(second.cached).toBe(true);
    expect(vi.mocked(fetchPage).mock.calls.length).toBe(1);
  });
});

describe("POST /api/audit, social page case", () => {
  it("classifies a Facebook page as social, without fetching a site", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://test/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead: {
          id: "live-99",
          name: "Test Salon",
          category: "Salon",
          address: "Main Street, Austin",
          city: "Austin",
          website: "https://www.facebook.com/testsalon",
          lat: 30.27,
          lng: -97.74,
        },
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { audit: { siteKind: string; hasWebsite: boolean; gaps: string[] } };
    expect(data.audit.siteKind).toBe("social");
    expect(data.audit.hasWebsite).toBe(false);
    expect(data.audit.gaps[0]).toContain("social");
  });
});
