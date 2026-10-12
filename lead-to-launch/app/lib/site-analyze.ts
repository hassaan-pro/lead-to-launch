import type { AuditCheck, AuditResult, Lead } from "./types";
import type { FetchedPage } from "./site-fetch";

const SOCIAL_HOSTS = [
  "facebook.com", "fb.com", "fb.me", "instagram.com", "linktr.ee", "linktree.com", "beacons.ai", "tiktok.com",
  "wa.me", "whatsapp.com", "business.site", "google.com", "g.page", "maps.app.goo.gl", "youtube.com", "twitter.com", "x.com",
];

/** A Facebook page or link-in-bio is not a website the business owns. */
export function classifyWebsite(website?: string): "none" | "social" | "own" {
  if (!website) return "none";
  try {
    const host = new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`).hostname.replace(/^www\./, "").toLowerCase();
    return SOCIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`)) ? "social" : "own";
  } catch {
    return "none";
  }
}

const BOOKING_PLATFORMS =
  /(calendly\.com|fresha\.com|booksy\.com|setmore\.com|acuityscheduling\.com|squareup\.com\/appointments|square\.site|vagaro\.com|mindbodyonline\.com|treatwell\.|salonist\.|zenoti\.com|simplybook\.|appointy\.com|opentable\.com|resy\.com|cal\.com|reservio\.com|timely\.app|book\.)/i;
const BOOKING_WORDS = /\b(book(?:ing)?(?:\s+now|\s+online|\s+an?\s+appointment|\s+appointment)?|appointments?|reserve|reservations?|schedule)\b/i;
const WHATSAPP = /(wa\.me\/|api\.whatsapp\.com\/send|web\.whatsapp\.com\/send|whatsapp:\/\/send|wa\.link\/)/i;
const PRICE = /(?:rs\.?|pkr|₨|\$|£|€|usd)\s?\d[\d,]{1,}/i;
const LOCAL_SCHEMA = /(LocalBusiness|BeautySalon|HairSalon|DaySpa|HealthAndBeautyBusiness|Dentist|MedicalBusiness|MedicalClinic|Physician|Restaurant|CafeOrCoffeeShop|FoodEstablishment|GymOrFitnessCenter|SportsActivityLocation|Store|ProfessionalService|LegalService|Attorney|Organization)/i;

const BUILDERS: Array<[string, RegExp]> = [
  ["Wix", /wixstatic\.com|static\.parastorage\.com|wix\.com/i],
  ["Squarespace", /squarespace\.com|static1\.squarespace/i],
  ["Shopify", /cdn\.shopify\.com|shopify\.com/i],
  ["Webflow", /webflow\.(com|io)|data-wf-/i],
  ["Weebly", /weebly\.com/i],
  ["WordPress", /wp-content|wp-includes|wordpress/i],
];

function stripTags(s: string): string {
  return s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function metaContent(html: string, name: string): string | null {
  const a = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]*content=["']([^"']*)["']`, "i"));
  if (a) return a[1];
  const b = html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*name=["']${name}["']`, "i"));
  return b ? b[1] : null;
}

function schemaTypes(html: string): string[] {
  const out: string[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (node && typeof node === "object") {
      const o = node as Record<string, unknown>;
      const t = o["@type"];
      if (typeof t === "string") out.push(t);
      else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && out.push(x));
      if (o["@graph"]) walk(o["@graph"]);
    }
  };
  while ((m = re.exec(html))) {
    try {
      walk(JSON.parse(m[1]));
    } catch {
      /* malformed JSON-LD counts as absent */
    }
  }
  return out;
}

function findBooking(html: string): string | null {
  const platform = html.match(BOOKING_PLATFORMS);
  if (platform) return `links to a booking platform (${platform[1].replace(/\/$/, "")})`;
  const anchor = /<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = anchor.exec(html))) {
    const text = stripTags(m[3]).slice(0, 60);
    if (text && text.length <= 40 && BOOKING_WORDS.test(text)) return `button or link reads "${text}"`;
    const href = /href=["']([^"']*)["']/i.exec(m[2])?.[1] ?? "";
    if (/(book|appointment|reserv)/i.test(href) && !/^(mailto|tel):/i.test(href)) return `link to ${href.slice(0, 60)}`;
  }
  if (/<form[^>]*(book|appointment|reserv)/i.test(html)) return "has a booking form";
  return null;
}

const n = (x: number) => x.toLocaleString("en-US");

/** Commercial impact first. Ties between equal severities resolve by this order. */
const PRIORITY = ["booking", "viewport", "whatsapp", "speed", "https", "images", "prices", "tel", "schema", "meta", "fresh"];
const byImpact = (a: AuditCheck, b: AuditCheck) => b.severity - a.severity || PRIORITY.indexOf(a.id) - PRIORITY.indexOf(b.id);

export function analyzeSite(
  lead: Lead,
  page: FetchedPage,
  psi: { score: number; loadTimeMs: number } | null,
): Pick<AuditResult, "pageSpeedScore" | "pageSpeedMeasured" | "mobileFriendly" | "https" | "hasSchema" | "loadTimeMs" | "checks" | "gaps" | "strengths" | "builder"> {
  const checks: AuditCheck[] = [];
  const add = (c: AuditCheck) => checks.push(c);

  if (!page.ok) {
    add({ id: "reachable", label: "Site could not be loaded for the audit", status: "unknown", severity: 1, evidence: page.error ?? "No response" });
    return {
      pageSpeedScore: psi?.score ?? 0,
      pageSpeedMeasured: !!psi,
      mobileFriendly: psi ? psi.score > 60 : true,
      https: page.https,
      hasSchema: false,
      loadTimeMs: psi?.loadTimeMs ?? 0,
      checks,
      gaps: [],
      strengths: [],
    };
  }

  const html = page.html;
  const text = stripTags(html);
  const scriptCount = (html.match(/<script\b/gi) ?? []).length;
  // A JS app shell has almost no readable text. Content checks would be guesses, so mark them unknown.
  const jsShell = text.length < 500 && scriptCount > 2;
  const unknownJs = "Site renders with JavaScript, so a basic fetch cannot see this";
  const builder = BUILDERS.find(([, re]) => re.test(html))?.[0];

  add({ id: "reachable", label: "Site loads", status: "pass", severity: 1, evidence: `HTTP ${page.status}, first byte in ${n(page.ttfbMs)}ms` });

  add(
    page.https
      ? { id: "https", label: "Secure (HTTPS)", status: "pass", severity: 2, evidence: "Served over HTTPS" }
      : { id: "https", label: "Not served over HTTPS", status: "fail", severity: 2, evidence: "Browsers flag the site as Not secure" },
  );

  const viewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  add(
    viewport
      ? { id: "viewport", label: "Mobile viewport set", status: "pass", severity: 3, evidence: "Has a viewport meta tag" }
      : { id: "viewport", label: "Not built for mobile screens", status: "fail", severity: 3, evidence: "No viewport meta tag, so phones show a shrunken desktop page" },
  );

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
  const desc = metaContent(html, "description");
  add(
    desc && desc.trim().length >= 30
      ? { id: "meta", label: "Search snippet written", status: "pass", severity: 1, evidence: `Title and description present` }
      : { id: "meta", label: "No search description", status: "fail", severity: 1, evidence: title ? `Title is "${title.slice(0, 50)}" but no meta description` : "No title or meta description" },
  );

  const types = schemaTypes(html);
  const hasLocalSchema = types.some((t) => LOCAL_SCHEMA.test(t));
  add(
    hasLocalSchema
      ? { id: "schema", label: "Local business markup", status: "pass", severity: 1, evidence: `Schema types: ${types.slice(0, 3).join(", ")}` }
      : { id: "schema", label: "No local business markup", status: "fail", severity: 1, evidence: types.length ? `Only ${types.slice(0, 2).join(", ")} markup, no business details` : "No structured data, so Google gets no hours, address or services" },
  );

  // Content checks that depend on the visible page
  if (jsShell) {
    for (const [id, label] of [["booking", "Online booking"], ["whatsapp", "WhatsApp click-to-chat"], ["prices", "Prices visible"], ["images", "Photos"]] as const) {
      add({ id, label, status: "unknown", severity: 1, evidence: unknownJs });
    }
  } else {
    const booking = findBooking(html);
    add(
      booking
        ? { id: "booking", label: "Online booking path", status: "pass", severity: 3, evidence: booking }
        : { id: "booking", label: "No online booking path", status: "fail", severity: 3, evidence: "No booking button, link or form found on the homepage" },
    );

    const wa = html.match(WHATSAPP);
    add(
      wa
        ? { id: "whatsapp", label: "WhatsApp click-to-chat", status: "pass", severity: 2, evidence: "Has a WhatsApp link" }
        : { id: "whatsapp", label: "No WhatsApp click-to-chat", status: "fail", severity: 2, evidence: "No tap-to-chat WhatsApp link on the homepage" },
    );

    const tel = /href=["']tel:/i.test(html);
    add(
      tel
        ? { id: "tel", label: "Tap-to-call", status: "pass", severity: 1, evidence: "Has a tel: link" }
        : { id: "tel", label: "Phone number not tappable", status: "fail", severity: 1, evidence: "No tap-to-call link for mobile visitors" },
    );

    const price = text.match(PRICE);
    add(
      price
        ? { id: "prices", label: "Prices visible", status: "pass", severity: 1, evidence: `Shows pricing, for example "${price[0]}"` }
        : { id: "prices", label: "No prices shown", status: "fail", severity: 1, evidence: "No prices found on the homepage" },
    );

    const imgs = (html.match(/<img\b/gi) ?? []).length;
    add(
      imgs >= 5
        ? { id: "images", label: "Photos", status: "pass", severity: 1, evidence: `${imgs} images on the homepage` }
        : { id: "images", label: "Almost no photos", status: "fail", severity: 1, evidence: `Only ${imgs} image${imgs === 1 ? "" : "s"} on the homepage` },
    );
  }

  // Freshness
  const years = [...html.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(20\d{2})/gi)].map((m) => Number(m[1]));
  if (years.length) {
    const latest = Math.max(...years);
    const thisYear = new Date().getFullYear();
    add(
      latest < thisYear - 1
        ? { id: "fresh", label: "Looks abandoned", status: "fail", severity: 1, evidence: `Footer still says © ${latest}` }
        : { id: "fresh", label: "Recently maintained", status: "pass", severity: 1, evidence: `Footer says © ${latest}` },
    );
  }

  // Speed: a real PageSpeed number when we have one, otherwise server response time only.
  if (psi) {
    add(
      psi.score < 50
        ? { id: "speed", label: "Slow on mobile", status: "fail", severity: 2, evidence: `PageSpeed mobile score ${psi.score}, main content in ${(psi.loadTimeMs / 1000).toFixed(1)}s` }
        : { id: "speed", label: "Reasonable mobile speed", status: "pass", severity: 2, evidence: `PageSpeed mobile score ${psi.score}` },
    );
  } else if (page.ttfbMs > 2500) {
    add({ id: "speed", label: "Slow server response", status: "fail", severity: 2, evidence: `First byte took ${(page.ttfbMs / 1000).toFixed(1)}s` });
  }

  const failed = checks.filter((c) => c.status === "fail").sort(byImpact);
  const passed = checks.filter((c) => c.status === "pass" && c.id !== "reachable");

  return {
    pageSpeedScore: psi?.score ?? 0,
    pageSpeedMeasured: !!psi,
    mobileFriendly: viewport && (psi ? psi.score > 60 : true),
    https: page.https,
    hasSchema: hasLocalSchema,
    loadTimeMs: psi?.loadTimeMs ?? page.totalMs,
    checks,
    gaps: failed.map((c) => c.label),
    strengths: passed.map((c) => c.label),
    builder,
  };
}

/** One factual sentence. Everything in it is something the prospect can verify on their own site. */
export function describeBiggestGap(lead: Lead, a: Pick<AuditResult, "siteKind" | "checks">): string {
  const rep = lead.reviewsCount && lead.rating ? `${n(lead.reviewsCount)} Google reviews at ${lead.rating.toFixed(1)} stars` : "a good Google presence";
  if (a.siteKind === "none") return `${rep}, but no website. People who find ${lead.name} on Google have nowhere to go next.`;
  if (a.siteKind === "social") return `${rep}, but the only link is a social page, not a website with booking, prices or a way to convert visitors.`;
  const top = (a.checks ?? []).filter((c) => c.status === "fail").sort(byImpact)[0];
  if (!top) return `No major gaps found on the homepage. This is a polish pitch, not a rescue.`;
  switch (top.id) {
    case "booking":
      return `${rep} are sending people to a site with no way to book. ${top.evidence}.`;
    case "viewport":
      return `The site is not built for mobile screens: ${top.evidence.toLowerCase()}.`;
    case "whatsapp":
      return `The site has no tap-to-chat WhatsApp link, so a visitor has to copy the number and switch apps.`;
    case "https":
      return `The site is not served over HTTPS, so browsers warn visitors it is not secure.`;
    case "speed":
      return `The site is slow on mobile: ${top.evidence.toLowerCase()}.`;
    default:
      return `${top.label}: ${top.evidence}.`;
  }
}

export function describeOpportunity(lead: Lead, a: Pick<AuditResult, "siteKind" | "checks" | "gaps">): string {
  const demand =
    lead.reviewsCount && lead.reviewsCount >= 300
      ? `Proven demand (${n(lead.reviewsCount)} reviews)`
      : lead.reviewsCount && lead.reviewsCount >= 50
        ? `Solid demand (${n(lead.reviewsCount)} reviews)`
        : `Smaller footprint (${n(lead.reviewsCount ?? 0)} reviews)`;
  if (a.siteKind === "none") return `${demand} and no website at all. Easiest pitch: a first site.`;
  if (a.siteKind === "social") return `${demand} and only a social page. Pitch: a real site that takes bookings.`;
  const fails = a.gaps.length;
  if (fails === 0) return `${demand}, site is in decent shape. Only pitch if you can show clear design upside.`;
  return `${demand} and ${fails} gap${fails === 1 ? "" : "s"} found. ${a.gaps.slice(0, 2).join("; ")}.`;
}
