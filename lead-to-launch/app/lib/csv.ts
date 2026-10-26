// CSV export escaping, with formula injection neutralisation. This is
// the M2 fix from the Oct 26 security audit.
//
// The old SavedLeads escape only quoted fields with commas, quotes, or
// newlines. That does not stop Excel: a quoted cell that starts with
// =, +, -, @, |, or % is still run as a formula when the file is
// opened, so a lead name, gap, or note that starts with one of those
// characters could run code on the user's machine. That matters here
// because lead data comes from scraped business listings, not from the
// user typing it, so a malicious listing could plant a formula.
//
// Fix, following the OWASP CSV injection guidance:
// - Strip leading spaces and tabs first, because Excel trims those
//   before checking for a formula, so "  =cmd" would still run.
// - If what remains starts with =, +, -, @, |, or %, prepend a single
//   quote. Excel treats a leading single quote as a text marker, so
//   the cell shows as text, and the quote itself is not displayed.
// - Only then apply the normal quoting for commas, quotes, and
//   newlines. A formula with a comma, like "=cmd, arg", therefore
//   becomes a quoted text cell, not a formula.
// - A plus phone number, like +92, gets the same treatment. That is
//   correct, not a bug: phone numbers should be text in a spreadsheet
//   anyway, so a leading plus and leading zeros are preserved.
export function csvEscape(value: unknown): string {
  const raw = value == null ? "" : String(value);
  const trimmed = raw.replace(/^[\s\t]+/, "");
  const neutralised = /^[=+\-@|%]/.test(trimmed) ? `'${trimmed}` : trimmed;
  return /[",\n]/.test(neutralised) ? `"${neutralised.replace(/"/g, '""')}"` : neutralised;
}
