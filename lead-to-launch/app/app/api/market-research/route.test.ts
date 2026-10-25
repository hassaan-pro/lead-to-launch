import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({ userId: "user_1" })),
  currentUser: vi.fn(async () => ({
    emailAddresses: [{ emailAddress: "hassaan66ahmed@gmail.com" }],
  })),
}));

async function loadRoute() {
  vi.resetModules();
  process.env.TAVILY_API_KEY = "test-tavily-key";
  return (await import("./route")).POST;
}

describe("POST /api/market-research, with Tavily mocked", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        results: [
          { title: "Best salons in Austin", url: "https://example.com/salons", content: "Top rated salons with booking" },
          { title: "Second result", url: "https://example.com/two", content: "More detail" },
        ],
      }),
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.TAVILY_API_KEY;
  });

  it("returns Tavily results, capped and trimmed, with configured true", async () => {
    const POST = await loadRoute();
    const req = new Request("http://test/api/market-research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ niche: "Salon", city: "Austin" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { results: Array<{ title: string; url: string }>; configured: boolean };
    expect(data.configured).toBe(true);
    expect(data.results).toHaveLength(2);
    expect(data.results[0].title).toBe("Best salons in Austin");
  });

  it("rejects a request without niche and city", async () => {
    const POST = await loadRoute();
    const req = new Request("http://test/api/market-research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ niche: "Salon" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
