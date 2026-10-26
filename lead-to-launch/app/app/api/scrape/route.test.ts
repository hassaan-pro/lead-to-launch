import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({ userId: "user_1" })),
  currentUser: vi.fn(async () => ({
    emailAddresses: [{ emailAddress: "hassaan66ahmed@gmail.com" }],
  })),
}));

function apifyItems() {
  return [
    {
      title: "Test Salon",
      categoryName: "Salon",
      address: "Main Street, Austin",
      phone: "+1 512-555-0100",
      website: "https://testsalon.example",
      totalScore: 4.7,
      reviewsCount: 173,
      imagesCount: 12,
      placeId: "place-1",
      location: { lat: 30.27, lng: -97.74 },
    },
    {
      title: "No Coords Shop",
      categoryName: "Salon",
      address: "Nowhere",
      location: {},
    },
  ];
}

async function loadRoute() {
  vi.resetModules();
  process.env.APIFY_TOKEN = "test-apify-token";
  process.env.DEMO_MODE = "false";
  const mod = await import("./route");
  return mod.POST;
}

describe("POST /api/scrape, with Apify mocked", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => apifyItems(),
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.APIFY_TOKEN;
    delete process.env.DEMO_MODE;
  });

  it("maps Apify items to leads, skips items without coordinates, and caps the count", async () => {
    const POST = await loadRoute();
    const req = new Request("http://test/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ niche: "Salon", city: "Austin", count: 25 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { source: string; leads: Array<{ id: string; name: string; rating?: number }> };
    expect(data.source).toBe("apify");
    expect(data.leads).toHaveLength(1);
    expect(data.leads[0].name).toBe("Test Salon");
    expect(data.leads[0].rating).toBe(4.7);
  });

  it("returns 429 on the 11th scrape in an hour for the same user", async () => {
    const POST = await loadRoute();
    async function scrapeOnce() {
      const req = new Request("http://test/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: "Salon", city: "Austin", count: 25 }),
      });
      return POST(req);
    }
    for (let i = 0; i < 10; i++) {
      const res = await scrapeOnce();
      expect(res.status).toBe(200);
    }
    const blocked = await scrapeOnce();
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).not.toBeNull();
    const data = (await blocked.json()) as { error: string };
    expect(data.error).toContain("Rate limit");
  });

  it("rejects a scrape without a numeric count", async () => {
    const POST = await loadRoute();
    const req = new Request("http://test/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ niche: "Salon", city: "Austin" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
