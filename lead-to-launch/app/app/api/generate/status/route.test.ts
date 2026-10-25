import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({ userId: "user_1" })),
  currentUser: vi.fn(async () => ({
    emailAddresses: [{ emailAddress: "hassaan66ahmed@gmail.com" }],
  })),
}));

describe("GET /api/generate/status", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.ANTHROPIC_API_KEY;
    process.env.GEMINI_API_KEY = "test-gemini-key";
    process.env.LLM_PROVIDER = "gemini";
    process.env.GENERATION_ALLOWED_EMAILS = "hassaan66ahmed@gmail.com";
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.LLM_PROVIDER;
    delete process.env.GENERATION_ALLOWED_EMAILS;
  });

  it("reports the active engine without ever returning a key", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(200);
    const data = (await res.json()) as { provider: string; model: string; allowed: boolean };
    expect(data.provider).toBe("gemini");
    expect(data.allowed).toBe(true);
    expect(JSON.stringify(data)).not.toContain("test-gemini-key");
  });
});
