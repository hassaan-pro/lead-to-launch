import { describe, expect, it } from "vitest";
import { slugify, demoSuffix, shouldCountView, MAX_DEMO_FILE_BYTES, VIEW_THROTTLE_MS, parseAllowedEmails, isAllowedEmail } from "../convex/demos";

describe("demo slug helpers", () => {
  it("slugifies a business name and truncates to 40 characters", () => {
    expect(slugify("Test Salon!")).toBe("test-salon");
    expect(slugify("  Bob's Barber Shop, Austin  ")).toBe("bob-s-barber-shop-austin");
    expect(slugify("")).toBe("");
    expect(slugify("a".repeat(100))).toHaveLength(40);
  });

  it("generates a 12 character suffix from the unambiguous alphabet only", () => {
    const s = demoSuffix();
    expect(s).toHaveLength(12);
    expect(s).toMatch(/^[abcdefghjkmnpqrstuvwxyz23456789]{12}$/);
  });

  it("generates unique suffixes across many samples", () => {
    const set = new Set<string>();
    for (let i = 0; i < 1000; i++) set.add(demoSuffix());
    expect(set.size).toBe(1000);
  });
});

describe("view throttling", () => {
  it("counts a first view, skips a view within a minute, and counts again after a minute", () => {
    const now = Date.now();
    expect(shouldCountView(undefined, now)).toBe(true);
    expect(shouldCountView(now - 30000, now)).toBe(false);
    expect(shouldCountView(now - VIEW_THROTTLE_MS, now)).toBe(true);
    expect(shouldCountView(now - VIEW_THROTTLE_MS - 1, now)).toBe(true);
  });
});

describe("demo file limits", () => {
  it("caps a demo file at 1 MB", () => {
    expect(MAX_DEMO_FILE_BYTES).toBe(1000000);
  });
});

describe("publish allowlist", () => {
  it("parses a comma separated allowlist, lowercasing and trimming, ignoring blanks", () => {
    expect(parseAllowedEmails("  Alice@Example.com ,bob@example.com,, ")).toEqual(["alice@example.com", "bob@example.com"]);
    expect(parseAllowedEmails(undefined)).toEqual([]);
    expect(parseAllowedEmails("")).toEqual([]);
  });

  it("allows only an exact email match, case insensitive, and never a missing email", () => {
    const allowed = ["alice@example.com"];
    expect(isAllowedEmail("Alice@Example.com", allowed)).toBe(true);
    expect(isAllowedEmail("alice@example.com", allowed)).toBe(true);
    expect(isAllowedEmail("mallory@example.com", allowed)).toBe(false);
    expect(isAllowedEmail(undefined, allowed)).toBe(false);
    expect(isAllowedEmail(null, allowed)).toBe(false);
    expect(isAllowedEmail("alice@example.com", [])).toBe(false);
  });
});
