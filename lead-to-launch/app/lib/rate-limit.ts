// Per user, per route rate limits for the paid routes. This is the H1
// fix from the Oct 26 security audit: before this, any signed in user
// could call Apify, PageSpeed, Tavily, or the model with no limit, so
// one account could burn the whole paid API budget.
//
// Limits are per hour, per user, per route, chosen to cover normal
// human use with headroom, not to ration a normal run:
// - scrape 10: one Apify run per scrape, a human does a few per hour.
// - audit 100: four full 25 lead runs per hour, plus re-runs. Cached
//   audits do not count, because they cost nothing.
// - market-research 20: one Tavily call per scrape, typically.
// - generate-brief 20: one brief per lead, short replies.
// - generate-site 10: the most expensive call, up to 16000 tokens,
//   and a build takes minutes, so a human builds one at a time.
// - generate-status is tiny and is not limited.
//
// Honest limit, stated here and in the PR: this store is in memory,
// per server instance, like the audit cache. It stops a single client
// looping against a warm instance, and it caps cost per instance, but
// it is not a global quota across Vercel instances. A shared Convex
// backed quota is the next hardening if sign up opens to the public,
// and these route call sites do not need to change for that swap: they
// only call checkRateLimit and return rateLimitResponse on a block.
//
// Free paths do not consume quota. Routes check the limit only after
// auth, validation, and any free path (demo seed, audit cache, or a
// missing provider key that returns without a paid call), so a cached
// audit or a demo scrape never counts against the paid limit.
export type RateLimitRoute = "scrape" | "audit" | "market-research" | "generate-brief" | "generate-site";

const HOUR_MS = 60 * 60 * 1000;

export const RATE_LIMITS: Record<RateLimitRoute, { limit: number; windowMs: number }> = {
  scrape: { limit: 10, windowMs: HOUR_MS },
  audit: { limit: 100, windowMs: HOUR_MS },
  "market-research": { limit: 20, windowMs: HOUR_MS },
  "generate-brief": { limit: 20, windowMs: HOUR_MS },
  "generate-site": { limit: 10, windowMs: HOUR_MS },
};

type Entry = { count: number; windowStart: number };
const store = new Map<string, Entry>();

export function checkRateLimit(userId: string, route: RateLimitRoute): { allowed: boolean; remaining: number; resetInMs: number } {
  const { limit, windowMs } = RATE_LIMITS[route];
  const key = `${userId}:${route}`;
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now - entry.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetInMs: windowMs };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetInMs: entry.windowStart + windowMs - now };
  }
  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetInMs: entry.windowStart + windowMs - now };
}

export function clearRateLimits(): void {
  store.clear();
}

// Build the 429 response in one place so every route says the same
// thing. The client shows data.error, so the message must be plain.
export function rateLimitResponse(resetInMs: number): { body: { error: string }; status: 429; headers: { "Retry-After": string } } {
  const minutes = Math.max(1, Math.ceil(resetInMs / 60000));
  return {
    body: { error: `Rate limit reached for this action. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.` },
    status: 429,
    headers: { "Retry-After": String(Math.ceil(resetInMs / 1000)) },
  };
}
