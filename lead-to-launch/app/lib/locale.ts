/**
 * Lightweight locale detection for the Phase 4 build prompt.
 *
 * Design choice: the prompt's opening sentence never names a nationality —
 * it always uses the lead's actual city (e.g. "a Hair salon in Katy, TX"),
 * which is correct by construction for any market, anywhere.
 *
 * This module only resolves the handful of things that genuinely need a
 * country guess: the HTML lang attribute, whether Roman Urdu trust-phrase
 * guidance fits, the mobile-traffic note, and the placeholder-image search
 * hint. Everything defaults to a neutral, plain-English global locale —
 * Pakistan-specific guidance only kicks in when the lead's own address/city
 * actually points there.
 */

export type Locale = {
  id: "pakistan" | "us" | "global";
  htmlLang: string;
  copyToneGuidance: string;
  mobileTrafficNote: string;
  imageSearchRegion: string;
};

const PAKISTAN_LOCALE: Locale = {
  id: "pakistan",
  htmlLang: "en-PK",
  copyToneGuidance:
    `Warm, calm, confident. Roman Urdu / Urdu-English mix allowed for trust phrases ("zaroorat parne par seedha call kar lein"). Avoid jargon. Address common customer hesitations (cost, quality, trust) directly.`,
  mobileTrafficNote: "Mobile-first (90%+ of Pakistani traffic is mobile).",
  imageSearchRegion: "pakistani local business",
};

const US_LOCALE: Locale = {
  id: "us",
  htmlLang: "en-US",
  copyToneGuidance:
    `Warm, calm, confident, plain English. Avoid jargon. Address common customer hesitations (cost, quality, trust) directly.`,
  mobileTrafficNote: "Mobile-first (most local search traffic is mobile).",
  imageSearchRegion: "american local business",
};

const GLOBAL_LOCALE: Locale = {
  id: "global",
  htmlLang: "en",
  copyToneGuidance:
    `Warm, calm, confident, plain English. Avoid jargon. Address common customer hesitations (cost, quality, trust) directly.`,
  mobileTrafficNote: "Mobile-first (most local search traffic is mobile).",
  imageSearchRegion: "local business",
};

const US_STATE_ABBR = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
  "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

const PAKISTAN_CITY_HINTS = [
  "lahore", "karachi", "islamabad", "rawalpindi", "faisalabad", "multan",
  "peshawar", "gulberg", "dha", "bahria town", "gujranwala", "sialkot",
  "quetta", "sargodha", "hyderabad, pakistan",
];

/**
 * Detects the locale to use for the build prompt from a lead's address/city.
 * Defaults to GLOBAL_LOCALE (neutral, no nationality assumption) whenever
 * there isn't a confident signal.
 */
export function detectLocale(lead: { address?: string; city?: string }): Locale {
  const rawText = `${lead.address ?? ""} ${lead.city ?? ""}`;
  const lowerText = rawText.toLowerCase();

  if (/\bpakistan\b/.test(lowerText)) return PAKISTAN_LOCALE;
  if (/\b(usa|u\.s\.a\.|united states)\b/.test(lowerText)) return US_LOCALE;

  // US state abbreviations are conventionally uppercase in real addresses
  // (", TX 77450"), so match case-sensitively against the raw text — this
  // avoids false positives from lowercase words like "or", "in", "hi", "ok".
  const hasUsState = US_STATE_ABBR.some(
    (s) => new RegExp(`,\\s*${s}\\b`).test(rawText) || new RegExp(`\\b${s}\\s+\\d{5}`).test(rawText),
  );
  if (hasUsState) return US_LOCALE;

  if (PAKISTAN_CITY_HINTS.some((c) => lowerText.includes(c))) return PAKISTAN_LOCALE;

  return GLOBAL_LOCALE;
}
