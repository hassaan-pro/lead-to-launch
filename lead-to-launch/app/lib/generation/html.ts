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

/**
 * Sanitiser for a page that will be served as a public demo.
 *
 * This is not a general HTML sanitiser and it does not try to make an
 * arbitrary page safe by itself. It enforces the generated page contract:
 * inline style and inline script are allowed, because model generated
 * pages need them for their signature and motion, but no external
 * resource, frame, plugin, form, or script URL is allowed through.
 * The demo route adds a sandboxed Content-Security-Policy on top of
 * this, which is the boundary that keeps an inline script from reaching
 * the product origin, fetching data, or submitting a form.
 *
 * Apply this both before upload and before serving. The serving step
 * matters most, because a direct Convex publish call can bypass any
 * client side check, while every public demo still goes through the
 * demo route.
 */
export function sanitizeDemoHtml(raw: string): string {
  let t = raw;

  // Whole elements that must never reach a demo, including their content.
  t = t.replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe\s*>/gi, "");
  t = t.replace(/<iframe\b[^>]*\/?>/gi, "");
  t = t.replace(/<object\b[^>]*>([\s\S]*?)<\/object\s*>/gi, "");
  t = t.replace(/<object\b[^>]*\/?>/gi, "");
  t = t.replace(/<embed\b[^>]*>/gi, "");
  t = t.replace(/<applet\b[^>]*>([\s\S]*?)<\/applet\s*>/gi, "");
  t = t.replace(/<base\b[^>]*>/gi, "");

  // External scripts only. Inline scripts are kept, see the note above.
  t = t.replace(/<script\b[^>]*\bsrc\s*=[^>]*>([\s\S]*?)<\/script\s*>/gi, "");
  t = t.replace(/<script\b[^>]*\bsrc\s*=[^>]*\/?>/gi, "");

  // Link tags: keep Google Fonts and data URIs only, drop everything else.
  t = t.replace(/<link\b[^>]*>/gi, (tag) => {
    const href = /href\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i.exec(tag)?.[1]?.replace(/^["']|["']$/g, "") ?? "";
    if (/^https:\/\/fonts\.googleapis\.com\//i.test(href) || /^data:/i.test(href)) return tag;
    return "";
  });

  // Meta refresh only. Other meta tags, including charset and viewport, stay.
  t = t.replace(/<meta\b[^>]*>/gi, (tag) => (/refresh/i.test(tag) ? "" : tag));

  // Media with an external source. Data URIs, used for inline SVG, stay.
  t = t.replace(/<(img|video|audio|source|track)\b[^>]*>/gi, (tag) => {
    const src = /(?:src|srcset)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i.exec(tag)?.[1]?.replace(/^["']|["']$/g, "") ?? "";
    if (!src) return tag;
    if (/^data:/i.test(src)) return tag;
    return "";
  });

  // Form tags only, so a pasted contact form cannot submit anywhere.
  // The visible fields stay as inert content.
  t = t.replace(/<form\b[^>]*>/gi, "");
  t = t.replace(/<\/form\s*>/gi, "");
  t = t.replace(/\s+formaction\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Event handler attributes, on any tag.
  t = t.replace(/\s+on[a-zA-Z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Style attributes that try to run code.
  t = t.replace(/\s+style\s*=\s*("[^"]*"|'[^']*')/gi, (match) =>
    /javascript:|vbscript:|expression\s*\(|data:text\/html/i.test(match) ? "" : match,
  );

  // Dangerous URL schemes in link, media, and action attributes.
  t = t.replace(
    /(\s+)(href|src|action|xlink:href)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,
    (match, space: string, attr: string, value: string) => {
      const clean = value.replace(/^["']|["']$/g, "").trim().toLowerCase().replace(/[\u0000-\u0020]+/g, "");
      if (
        clean.startsWith("javascript:") ||
        clean.startsWith("vbscript:") ||
        clean.startsWith("data:text/html") ||
        clean.startsWith("data:text/javascript") ||
        clean.startsWith("data:application") ||
        clean.startsWith("file:")
      ) {
        return "";
      }
      return `${space}${attr}=${value}`;
    },
  );

  return t;
}

/**
 * A preview of a page that is still streaming, for the build tool only.
 * Returns null until the stream has real body content, so the preview
 * does not flicker on a head only chunk. The result is sanitised with
 * the same rules as a published demo, and it is shown only in the
 * sandboxed preview iframe, never as a finished site: publish and
 * download still require the full, validated page from buildSite.
 * A trailing incomplete tag is cut, because the model often stops
 * mid tag between stream chunks, and a browser parses the rest fine
 * without a closing html tag.
 */
export function progressivePreviewHtml(raw: string): string | null {
  let t = raw.replace(/\r\n/g, "\n").trim();
  if (t.startsWith("```")) t = t.replace(/^```(?:html)?\s*\n?/i, "");
  const start = t.search(/<!doctype html|<html/i);
  if (start > 0) t = t.slice(start);
  const lastOpen = t.lastIndexOf("<");
  const lastClose = t.lastIndexOf(">");
  if (lastOpen > lastClose) t = t.slice(0, lastOpen).trimEnd();
  if (t.length < 500) return null;
  if (!/<body[\s>]/i.test(t) || !/<section[\s>]/i.test(t)) return null;
  return sanitizeDemoHtml(t);
}

/**
 * Headers for a served demo page. The CSP sandbox has no
 * allow-same-origin, so a script in the demo runs with an opaque origin
 * and cannot reach the product origin, its cookies, or its storage.
 * Top navigation is allowed only on a user activation, so a booking
 * link still works while a script cannot silently redirect the page.
 * Fetch and form submission are blocked outright.
 */
export function demoSecurityHeaders(): Record<string, string> {
  return {
    "content-security-policy":
      "default-src 'none'; " +
      "script-src 'unsafe-inline'; " +
      "style-src 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src https://fonts.gstatic.com; " +
      "img-src data:; " +
      "media-src data:; " +
      "connect-src 'none'; " +
      "form-action 'none'; " +
      "frame-ancestors 'none'; " +
      "base-uri 'none'; " +
      "object-src 'none'; " +
      "sandbox allow-scripts allow-top-navigation-by-user-activation",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "cache-control": "no-store",
  };
}
