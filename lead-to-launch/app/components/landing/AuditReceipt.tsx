"use client";

import { cn } from "@/lib/utils";
import { DecodeText } from "@/components/brand/DecodeText";

export type ReceiptRow = { state: "fail" | "pass" | "unknown"; label: string; evidence: string };

const GLYPH = {
  fail: { mark: "✕", name: "Gap", cls: "text-destructive" },
  pass: { mark: "✓", name: "Pass", cls: "text-ok" },
  unknown: { mark: "?", name: "Could not check", cls: "text-muted-foreground" },
} as const;

/** One real thing we looked for, and what we saw. Every audit in the product reads like this. */
export function AuditReceipt({ rows, className }: { rows: ReceiptRow[]; className?: string }) {
  return (
    <ul className={cn("divide-y divide-border/80", className)}>
      {rows.map((r, i) => (
        <li key={r.label} className="flex gap-3.5 py-3.5">
          <span className={cn("mt-0.5 w-4 shrink-0 text-center font-mono text-sm leading-5", GLYPH[r.state].cls)}>
            <span aria-hidden="true">{GLYPH[r.state].mark}</span>
            <span className="sr-only">{GLYPH[r.state].name}:</span>
          </span>
          <div className="min-w-0">
            <div className="text-[15px] leading-5">{r.label}</div>
            <DecodeText text={r.evidence} delay={i * 110} className="mt-1 block font-mono text-xs leading-5 text-muted-foreground" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * A real audit: Bob's Barber Shop, Austin, checked 22 Oct 2026 from public
 * pages only. The business was not contacted and Outrive is not affiliated
 * with it. Anything the business has never published stays "unknown" here,
 * exactly as the audit reported it. Never invent a row to fill the table.
 */
export const BOBS_ROWS: ReceiptRow[] = [
  { state: "fail", label: "No website at all", evidence: "The Google listing has no website link. Google itself shows an Add website prompt" },
  { state: "fail", label: "Listing is unclaimed", evidence: "Google still shows Claim this business on the listing" },
  { state: "fail", label: "No online booking path", evidence: "No Book online button and no booking page found. The phone is the only way in" },
  { state: "fail", label: "Photos live only on Google", evidence: "21 photos on the listing, and not one on a page the shop owns" },
  { state: "fail", label: "No social links on the listing", evidence: "No Instagram or Facebook linked from Google" },
  { state: "pass", label: "A reputation worth finding", evidence: "4.7 stars across 173 Google reviews" },
  { state: "unknown", label: "Prices", evidence: "The business publishes no prices anywhere we could find" },
  { state: "unknown", label: "Years in business", evidence: "Only a customer's review mentions it. The business never has" },
];

export const EXAMPLE_ROWS: ReceiptRow[] = [
  { state: "fail", label: "No online booking path", evidence: "No booking button, link or form found on the homepage" },
  { state: "fail", label: "Not built for phones", evidence: "No viewport tag, so phones show a shrunken desktop page" },
  { state: "fail", label: "No WhatsApp tap-to-chat", evidence: "No wa.me link anywhere on the page" },
  { state: "fail", label: "Almost no photos", evidence: "2 images on the homepage" },
  { state: "fail", label: "Looks abandoned", evidence: "Footer still says © 2017" },
  { state: "fail", label: "No local business markup", evidence: "Google gets no hours, address or services" },
  { state: "pass", label: "Secure", evidence: "Served over HTTPS" },
  { state: "unknown", label: "Prices", evidence: "Pricing may load with JavaScript, so a basic fetch cannot see it" },
];
