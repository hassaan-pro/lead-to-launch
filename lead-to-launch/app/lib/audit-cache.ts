import type { AuditResult } from "./types";

// Server side audit cache, in memory only. It exists for one reason:
// Phase 2 audits every selected lead on every Audit click, even leads
// already audited in the same run, and a business that appears in two
// scrapes gets audited twice. Each own site audit pays a site fetch
// plus a PageSpeed call, so a repeat audit of the same site within a
// day is wasted money and wasted waiting time.
//
// This is deliberately small and conservative:
// - Key is user plus normalized URL, so one user's cached audit is
//   never served to another user, and a user only ever gets an audit
//   for a URL they already supplied.
// - Only successful own site audits are cached. Failed loads, social
//   pages, and no website results are cheap or must not be frozen in.
// - TTL is 24 hours. Small business sites change slowly, and a day is
//   short enough that a stale gap is unlikely to mislead a pitch, while
//   long enough to cover re-runs in the same day.
// - This is per server instance, not shared across Vercel instances,
//   so a cache hit is a saving when it happens, never a promise. A
//   shared Convex cache would be a bigger change with a schema and a
//   migration, and is not needed to prove the saving first.
// - Max 200 entries, oldest evicted first, so the map cannot grow
//   without bound from arbitrary URLs.
export const AUDIT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 200;

type Entry = { audit: AuditResult; at: number };
const cache = new Map<string, Entry>();

export function normalizeAuditUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const path = u.pathname.replace(/\/+$/, "") || "/";
    return `${u.protocol}//${host}${path}`;
  } catch {
    return null;
  }
}

function key(userId: string, url: string): string | null {
  const normalized = normalizeAuditUrl(url);
  return normalized ? `${userId}:${normalized}` : null;
}

export function getCachedAudit(userId: string, url: string): AuditResult | null {
  const k = key(userId, url);
  if (!k) return null;
  const entry = cache.get(k);
  if (!entry) return null;
  if (Date.now() - entry.at >= AUDIT_CACHE_TTL_MS) {
    cache.delete(k);
    return null;
  }
  return entry.audit;
}

export function setCachedAudit(userId: string, url: string, audit: AuditResult): void {
  const k = key(userId, url);
  if (!k) return;
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(k, { audit, at: Date.now() });
}

export function clearAuditCache(): void {
  cache.clear();
}
