import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({ userId: "user_1" })),
  currentUser: vi.fn(async () => ({
    emailAddresses: [{ emailAddress: "hassaan66ahmed@gmail.com" }],
  })),
}));

const briefJson = {
  concept: "A calm salon page built around one booking action",
  personality: ["calm", "precise", "warm"],
  audience: "Visitors who want to book in under a minute",
  mood: "Calm and confident",
  composition: { id: "custom", name: "Custom", why: "Fits this salon, not a template" },
  palette: { name: "Warm Bone", bg: "#F6F1E9", surface: "#FFFFFF", text: "#1F1B16", muted: "#6B6259", accent: "#B4532A" },
  typography: { display: "Fraunces", displayWhy: "Warm and distinctive", body: "Inter", notes: "Large headings, tight tracking" },
  sections: [
    { id: "hero", purpose: "Book in one tap", treatment: "Large headline and booking button" },
    { id: "services", purpose: "Show services", treatment: "Short list with prices" },
    { id: "proof", purpose: "Show reviews", treatment: "Review band with rating" },
  ],
  signature: "A booking strip that follows the visitor",
  imagery: "Type and gradients, no photographs",
  motion: "Gentle reveals only",
  voice: { tone: "Warm and direct", headlines: ["Book in a minute", "Good hair, no waiting", "Your salon, ready"] },
  mustFix: ["No booking path on the current site"],
  notTemplate: "A generic salon site lists everything. This one books first.",
};

const lead = {
  id: "live-01",
  name: "Test Salon",
  category: "Salon",
  address: "Main Street, Austin",
  city: "Austin",
  phone: "+1 512-555-0100",
  rating: 4.7,
  reviewsCount: 173,
  lat: 30.27,
  lng: -97.74,
  audit: {
    leadId: "live-01",
    pageSpeedScore: 0,
    hasWebsite: false,
    siteKind: "none",
    mobileFriendly: false,
    https: false,
    hasSchema: false,
    loadTimeMs: 0,
    gaps: ["No website at all"],
    strengths: [],
    biggestGap: "No website at all",
  },
};

async function loadRoute() {
  vi.resetModules();
  delete process.env.ANTHROPIC_API_KEY;
  process.env.GEMINI_API_KEY = "test-gemini-key";
  process.env.LLM_PROVIDER = "gemini";
  process.env.GENERATION_ALLOWED_EMAILS = "hassaan66ahmed@gmail.com";
  return (await import("./route")).POST;
}

describe("POST /api/generate/brief, with Gemini mocked", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: JSON.stringify(briefJson) }] } }],
      }),
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GEMINI_API_KEY;
    delete process.env.LLM_PROVIDER;
    delete process.env.GENERATION_ALLOWED_EMAILS;
  });

  it("returns a parsed brief and a seed for a valid lead with an audit", async () => {
    const POST = await loadRoute();
    const req = new Request("http://test/api/generate/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead, seed: 42 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { brief: { concept: string; sections: unknown[] }; seed: number };
    expect(data.brief.concept).toContain("calm salon");
    expect(data.brief.sections).toHaveLength(3);
    expect(data.seed).toBe(42);
  });

  it("rejects a lead without an audit", async () => {
    const POST = await loadRoute();
    const req = new Request("http://test/api/generate/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead: { id: "live-01", name: "Test Salon" } }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
