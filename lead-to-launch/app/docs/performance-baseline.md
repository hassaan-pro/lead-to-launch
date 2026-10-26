# Performance baseline, Phase 0

Measured 2026-10-26, before any performance change. This file is the
reference every later perf PR is judged against. If a later PR does not
improve a number here, it does not ship as a performance fix.

## Test harness

- Vitest 3.2.7, `npm test` runs `vitest run`.
- 29 unit tests across 5 files, all passing at baseline:
  - `lib/scoring.test.ts` (5): scoreLead breakdown, caps, neutral on unloaded sites.
  - `lib/generation/brief.test.ts` (9): extractJson, parseBrief validation and palette fallbacks.
  - `lib/generation/html.test.ts` (5): cleanHtml fences and markers, looksLikeFullPage.
  - `lib/site-analyze.test.ts` (7): classifyWebsite, analyzeSite checks, gap wording.
  - `lib/saved-leads.test.ts` (3): placeKeyOf, tierOf.
- Full repo `tsc --noEmit`: 0 errors at baseline.
- No integration tests yet. That is Phase 0 gap 1: API routes are only
  covered by these pure function tests, not by route tests with mocked
  Gemini, Apify, or PageSpeed. Add those before changing any route.

## Build baseline (local production build, Next.js 16.2.7, Turbopack)

- Build compiled successfully in about 30 seconds, 11 static pages generated.
- Static JS and CSS in `.next/static`: about 2.4 MB uncompressed across
  all chunks (not per page; Vercel serves these compressed).
- Largest single chunks, uncompressed: about 307 KB, 203 KB, 186 KB, 186 KB.
- Routes: `/` and `/app` are static shells; `/api/audit`,
  `/api/generate/brief`, `/api/generate/site`, `/api/generate/status`,
  `/api/market-research`, `/api/scrape`, and `/demo/[slug]` are dynamic.
- No bundle size target is set yet. Set one in the first perf PR that
  touches the bundle, using this build as the before number.

## API timing caps (from code, not from live timing)

These caps explain why the loader feels slow. They are limits, not
measured live durations. Live durations still need to be captured on
production, because a cap is not a measurement.

- Scrape (`/api/scrape`): Apify run, 55 second client timeout.
- Audit (`/api/audit`): maxDuration 60 seconds. Site fetch capped at
  12 seconds, PageSpeed capped at 25 seconds, run in parallel.
- Creative direction (`/api/generate/brief`): maxDuration 120 seconds,
  model call timeout 100 seconds, up to 2 attempts on bad JSON.
- Website build (`/api/generate/site`): maxDuration 300 seconds,
  streams up to 16000 tokens. The code comment says a full page streams
  for one to three minutes. The studio only paints the preview after
  the full page passes validation, so the whole stream looks like one
  long loader even though bytes are arriving.
- Generate status (`/api/generate/status`): tiny, auth dependent, no
  timing problem to fix.

## What to measure live before any perf PR

- Time from clicking Create creative direction to the direction showing,
  and from clicking Build site to the first preview paint, on a phone,
  on production, for three different leads. Record the model used.
- Time for scrape, audit, and market research on the same leads.
- Core Web Vitals for `/` and `/app` from a real phone, not from a
  desktop lab run. LCP, INP, and CLS, with the network and device
  noted.
- Re-run `npm test` and `tsc --noEmit` on every perf PR. A PR that
  makes a number here worse, or breaks a test, is not a performance fix.

## Deliberately not changed in Phase 0

- No caching, no React Query, no code splitting, no compression or
  cache header change, no model change, no timeout change. Those are
  later phases, each with its own PR and its own before and after
  numbers from this file.

## Phase 1, measured 2026-10-26

Phase 1 does not change the model, the timeouts, or the bundle. It
changes when the user first sees something, and it adds the route
tests Phase 0 said must come before any route change.

- Tests: 46 passing. Main before this PR had 34 (29 from Phase 0
  plus 5 from PR 45). This PR adds 9 integration tests and 3
  progressive preview tests. Integration tests: scrape with Apify
  mocked, market research with Tavily mocked, brief with Gemini
  mocked, status, audit social, and audit own site with site fetch
  and PageSpeed mocked.
- Integration test method: Clerk auth and currentUser are mocked,
  external calls are mocked with global fetch, and all keys in tests
  are fake test values. No test calls a real Apify, Tavily, Gemini,
  or PageSpeed endpoint, and no test needs a live Clerk session.
- First perf change: progressive preview in SiteStudio. Previously
  the studio only painted after the full stream passed validation,
  so a one to three minute build looked like one long loader. Now
  the preview paints during the stream, throttled to every 400 ms,
  once the stream has real body content. The preview is sanitised
  and shown only in the existing sandboxed iframe. Publish,
  download, and copy still require the full validated page, so a
  streaming preview can never be published as a finished site.
- Build after Phase 1: compiled successfully in about 29 seconds,
  11 static pages, .next/static 2,305,031 bytes uncompressed,
  largest chunks 310 KB, 203 KB, 186 KB, 186 KB. That is effectively
  unchanged from the Phase 0 baseline, as expected: this PR adds
  almost no shipped code, it changes when the preview paints.
- Live timing still to capture on production, by phone, after this
  PR deploys: time from clicking Build site to the first preview
  paint, for three leads, with the model noted. That number, not
  the bundle number, is how this PR should be judged.
- Not changed in Phase 1, for a later PR: phase lazy loading,
  audit caching, recharts removal, rate limits, and any model or
  timeout change.

## Phase 2, measured 2026-10-26

Phase 2 is a bundle change, judged by the /app first load number
from .next/diagnostics/route-bundle-stats.json, not by total static
size, which includes chunks that load later.

- Before, on main after PR 46: /app first load 1,390,873 bytes
  uncompressed, / first load 1,186,434 bytes, total .next/static
  2,305,031 bytes.
- Change: app/(product)/app/page.tsx now loads Phases 2 to 5 and
  SavedLeads with next/dynamic and ssr false, with a plain loading
  line that shows no data. Phase 1 stays eager, because it is the
  first screen. The phases still run inside the same protected page,
  so no auth or data boundary changes, and no new external call.
- After: /app first load 1,136,016 bytes, down 254,857 bytes, about
  18 percent. / first load 1,187,548 bytes, effectively unchanged.
  Total .next/static 2,334,627 bytes, slightly up, because splitting
  adds chunk overhead: total size is the wrong number for this PR,
  first load is the right one.
- Also in this PR: recharts removed from package.json and the lock
  file (36 packages removed, lock diff is removals only). It was
  never imported anywhere, so it does not change first load, and
  the 1,136,016 number above is the same with and without it. It
  only removes install size and attack surface.
- Tests: 46 passing, unchanged from Phase 1. tsc: 0 errors.
  Lazy loading is a build property, so it is verified by the build
  manifest numbers above, not by a unit test, and the PR says so.
- Live check still to do on a phone after deploy: open /app, confirm
  Phase 1 shows immediately, then step to each later phase and Saved
  leads, and confirm each loads without a broken layout.
- Not changed in Phase 2, for a later PR: audit caching, rate
  limits, and any model or timeout change.
