import { describe, expect, it, vi, beforeEach } from "vitest";
import { normalizeAuditUrl, getCachedAudit, setCachedAudit, clearAuditCache, AUDIT_CACHE_TTL_MS } from "./audit-cache";
import type { AuditResult } from "./types";

function audit(leadId: string): AuditResult {
  return {
    leadId,
    pageSpeedScore: 90,
    pageSpeedMeasured: true,
    hasWebsite: true,
    siteKind: "own",
    mobileFriendly: true,
    https: true,
    hasSchema: false,
    loadTimeMs: 1200,
    gaps: ["No booking path"],
    strengths: [],
    biggestGap: "No booking path",
    opportunity: "Add booking",
  };
}

describe("normalizeAuditUrl", () => {
  it("normalizes host case, www, trailing slash, query, and fragment to one key", () => {
    expect(normalizeAuditUrl("https://WWW.TestSalon.example/")).toBe("https://testsalon.example/");
    expect(normalizeAuditUrl("https://testsalon.example/?utm_source=x#top")).toBe("https://testsalon.example/");
    expect(normalizeAuditUrl("https://testsalon.example/services")).toBe("https://testsalon.example/services");
  });

  it("returns null for a non http url and for a bad url", () => {
    expect(normalizeAuditUrl("ftp://testsalon.example")).toBeNull();
    expect(normalizeAuditUrl("not a url")).toBeNull();
    expect(normalizeAuditUrl("")).toBeNull();
  });
});

describe("audit cache", () => {
  beforeEach(() => {
    clearAuditCache();
    vi.useFakeTimers();
  });

  it("misses before a set, hits after a set, and is per user", () => {
    expect(getCachedAudit("user_1", "https://testsalon.example")).toBeNull();
    setCachedAudit("user_1", "https://testsalon.example", audit("lead-1"));
    expect(getCachedAudit("user_1", "https://testsalon.example")?.leadId).toBe("lead-1");
    expect(getCachedAudit("user_2", "https://testsalon.example")).toBeNull();
  });

  it("expires after the TTL", () => {
    setCachedAudit("user_1", "https://testsalon.example", audit("lead-1"));
    vi.advanceTimersByTime(AUDIT_CACHE_TTL_MS - 1);
    expect(getCachedAudit("user_1", "https://testsalon.example")).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(getCachedAudit("user_1", "https://testsalon.example")).toBeNull();
  });

  it("does not cache a null url", () => {
    setCachedAudit("user_1", "not a url", audit("lead-1"));
    expect(getCachedAudit("user_1", "not a url")).toBeNull();
  });
});
