import { describe, expect, it, vi, beforeEach } from "vitest";
import { checkRateLimit, clearRateLimits, RATE_LIMITS } from "./rate-limit";

describe("rate limits", () => {
  beforeEach(() => {
    clearRateLimits();
    vi.useFakeTimers();
  });

  it("allows calls up to the limit, then blocks with a reset time", () => {
    for (let i = 0; i < RATE_LIMITS.scrape.limit; i++) {
      expect(checkRateLimit("user_1", "scrape").allowed).toBe(true);
    }
    const blocked = checkRateLimit("user_1", "scrape");
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetInMs).toBeGreaterThan(0);
  });

  it("is per user and per route", () => {
    for (let i = 0; i < RATE_LIMITS.scrape.limit; i++) {
      checkRateLimit("user_1", "scrape");
    }
    expect(checkRateLimit("user_1", "scrape").allowed).toBe(false);
    expect(checkRateLimit("user_2", "scrape").allowed).toBe(true);
    expect(checkRateLimit("user_1", "audit").allowed).toBe(true);
  });

  it("resets after the window", () => {
    for (let i = 0; i < RATE_LIMITS.scrape.limit; i++) {
      checkRateLimit("user_1", "scrape");
    }
    expect(checkRateLimit("user_1", "scrape").allowed).toBe(false);
    vi.advanceTimersByTime(RATE_LIMITS.scrape.windowMs);
    expect(checkRateLimit("user_1", "scrape").allowed).toBe(true);
  });

  it("reports remaining calls going down", () => {
    expect(checkRateLimit("user_1", "market-research").remaining).toBe(RATE_LIMITS["market-research"].limit - 1);
    expect(checkRateLimit("user_1", "market-research").remaining).toBe(RATE_LIMITS["market-research"].limit - 2);
  });
});
