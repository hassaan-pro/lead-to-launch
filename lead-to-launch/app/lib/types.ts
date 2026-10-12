export type Lead = {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviewsCount?: number;
  lat: number;
  lng: number;
  photosCount?: number;
  yearsInBusiness?: number;
};

export type CheckStatus = "pass" | "fail" | "unknown";

/** One real, verifiable thing we looked for on the prospect's site. */
export type AuditCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  /** 1 = minor, 2 = notable, 3 = costs them customers. Only used when status is "fail". */
  severity: 1 | 2 | 3;
  /** What we actually saw. Shown to the user and safe to quote to the prospect. */
  evidence: string;
};

export type AuditResult = {
  leadId: string;
  pageSpeedScore: number;
  /** False when no real PageSpeed measurement exists, so 0 does not mean a bad site. */
  pageSpeedMeasured?: boolean;
  /** True only for the business's own website. Social pages and link-in-bio pages are false. */
  hasWebsite: boolean;
  siteKind?: "none" | "social" | "own";
  /** Platform the site is built on, when detectable (Wix, WordPress, and so on). */
  builder?: string;
  mobileFriendly: boolean;
  https: boolean;
  hasSchema: boolean;
  loadTimeMs: number;
  /** Real checks run against the live site. Absent on demo seed audits. */
  checks?: AuditCheck[];
  /** Failed checks as short labels, worst first. */
  gaps: string[];
  /** Checks that passed, so the pitch can be honest about what is already good. */
  strengths?: string[];
  /** One factual sentence a prospect can verify by opening their own site. */
  biggestGap: string;
  /** Why this lead is worth pitching, in plain words. No invented money figures. */
  opportunity?: string;
};

export type RankedLead = Lead & {
  audit: AuditResult;
  score: number;
  scoreBreakdown: {
    noOrBadSite: number;
    reviewVolume: number;
    rating: number;
    recency: number;
    reachable: number;
    industryFit: number;
  };
};

export type ScrapeInput = {
  niche: string;
  city: string;
  count: number;
};

export type OutreachChannel = "whatsapp" | "email" | "instagram";
export type OutreachLanguage = "english" | "roman-urdu";

export type MarketResearchResult = {
  title: string;
  url: string;
  snippet: string;
};
