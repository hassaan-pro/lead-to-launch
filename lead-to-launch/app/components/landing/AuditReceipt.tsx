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
