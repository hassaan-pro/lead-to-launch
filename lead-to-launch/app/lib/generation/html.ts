/**
 * Turns whatever came back from a model or a chat window into one clean HTML document.
 * Handles markdown fences, chatter before and after the page, and our own stream markers.
 */
export function cleanHtml(raw: string): string {
  let t = raw.replace(/\r\n/g, "\n").trim();
  // If the reply holds a fenced block containing a full page, take that block.
  const fenced = t.match(/```(?:html)?\s*\n([\s\S]*?<\/html>\s*)\n?```/i);
  if (fenced) t = fenced[1];
  const start = t.search(/<!doctype html|<html/i);
  if (start > 0) t = t.slice(start);
  t = t.replace(/\n?<!-- L2L_(?:TRUNCATED|ERROR)[^>]*-->\s*$/i, "").trim();
  const end = t.toLowerCase().lastIndexOf("</html>");
  return end === -1 ? t : t.slice(0, end + 7);
}

/** True when the text looks like a complete page worth previewing. */
export function looksLikeFullPage(html: string): boolean {
  return html.length >= 500 && /<html|<!doctype/i.test(html) && /<\/html>\s*$/i.test(html);
}

export type FileResult = { ok: true; html: string; truncated: boolean } | { ok: false; error: string };

const MAX_FILE_BYTES = 3_000_000;

/** Reads a dropped or chosen file and returns a previewable page, or a plain-English reason it cannot be one. */
export async function readHtmlFile(file: { name: string; size: number; text: () => Promise<string> }): Promise<FileResult> {
  if (/\.(zip|rar|7z|tar|gz)$/i.test(file.name)) {
    return { ok: false, error: "That is an archive. Ask the chat for a single self-contained index.html file (CSS and JavaScript inside it), then drop that instead." };
  }
  if (file.size > MAX_FILE_BYTES) return { ok: false, error: "That file is too large to be a single page (over 3MB)." };
  if (!/\.(html?|xhtml|txt)$/i.test(file.name) && file.name.includes(".")) {
    return { ok: false, error: `${file.name} is not an HTML file. Drop the .html file the chat gave you.` };
  }
  const out = cleanHtml(await file.text());
  if (out.length < 200 || !/<html|<!doctype/i.test(out)) return { ok: false, error: "That file does not look like an HTML page." };
  return { ok: true, html: out, truncated: !/<\/html>\s*$/i.test(out) };
}
