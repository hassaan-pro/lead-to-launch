// Pure helpers for demo links, shared by convex/demos.ts and tested in
// lib/demo-helpers.test.ts. This file has no Convex imports on purpose,
// so the slug and view logic can be unit tested without a Convex harness.
//
// H2 from the Oct 26 security audit:
// - Slug suffix was 6 characters from a 31 character alphabet, about
//   887 million possibilities, on a predictable business name prefix.
//   Now 12 characters, about 31^12 possibilities, effectively
//   unguessable. Existing demos keep their old slugs and still work,
//   because getBySlug looks up the exact slug, with no format check.
// - Views were counted on every public open, with no throttle, so
//   anyone could inflate the "Opened N times" count by refreshing.
//   Now a view counts at most once per minute per demo.

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

const SUFFIX_CHARS = "abcdefghjkmnpqrstuvwxyz23456789";
export const DEMO_SUFFIX_LENGTH = 12;

export function demoSuffix(): string {
  let s = "";
  for (let i = 0; i < DEMO_SUFFIX_LENGTH; i++) s += SUFFIX_CHARS[Math.floor(Math.random() * SUFFIX_CHARS.length)];
  return s;
}

export const VIEW_THROTTLE_MS = 60_000;

export function shouldCountView(lastViewedAt: number | undefined | null, now: number): boolean {
  if (lastViewedAt === undefined || lastViewedAt === null) return true;
  return now - lastViewedAt >= VIEW_THROTTLE_MS;
}

/** Demo HTML files are generated pages, normally well under 300 KB. */
export const MAX_DEMO_FILE_BYTES = 1_000_000;
