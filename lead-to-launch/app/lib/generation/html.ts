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
