import { describe, expect, it } from "vitest";
import { cleanHtml, looksLikeFullPage, sanitizeDemoHtml, demoSecurityHeaders, progressivePreviewHtml } from "./html";

const page = `<!doctype html><html><head><title>Shop</title></head><body>${"x".repeat(600)}</body></html>`;

describe("cleanHtml", () => {
  it("takes a fenced full page out of chat chatter", () => {
    const cleaned = cleanHtml(`Sure, here it is:\n\`\`\`html\n${page}\n\`\`\`\nLet me know`);
    expect(cleaned).toContain("<!doctype html>");
    expect(cleaned.endsWith("</html>")).toBe(true);
  });

  it("strips chatter before the doctype and trailing stream markers", () => {
    const cleaned = cleanHtml(`Here you go\n${page}\n<!-- L2L_TRUNCATED: cut -->`);
    expect(cleaned.startsWith("<!doctype html>")).toBe(true);
    expect(cleaned).not.toContain("L2L_TRUNCATED");
  });

  it("cuts everything after the closing html tag", () => {
    const cleaned = cleanHtml(`${page}\nSome trailing notes`);
    expect(cleaned.endsWith("</html>")).toBe(true);
    expect(cleaned).not.toContain("trailing notes");
  });
});

describe("sanitizeDemoHtml: pasted page", () => {
  const pasted = `<!doctype html><html><head><title>Shop</title><script src="https://evil.example/x.js"></script></head><body><iframe src="https://evil.example/frame"></iframe><a href="javascript:alert(1)">click</a><div onclick="alert(1)">hi</div><img src="https://evil.example/pixel.png" alt=""><form action="https://evil.example/steal"><input name="name"></form><p>Real shop text</p></body></html>`;

  it("strips external scripts, iframes, javascript links, handlers, tracking images, and form actions", () => {
    const out = sanitizeDemoHtml(pasted);
    expect(out).not.toContain("evil.example");
    expect(out).not.toContain("<iframe");
    expect(out).not.toContain("javascript:");
    expect(out).not.toContain("onclick");
    expect(out).not.toContain("<script src");
    expect(out).toContain("Real shop text");
    expect(out).toContain("click");
  });
});

describe("sanitizeDemoHtml: uploaded file", () => {
  const uploaded = `<!doctype html><html><head><base href="https://evil.example/"><meta http-equiv="refresh" content="0;url=https://evil.example"><link rel="stylesheet" href="https://evil.example/style.css"></head><body><object data="https://evil.example/x.swf"></object><embed src="https://evil.example/x.swf"><p>Uploaded shop text</p></body></html>`;

  it("strips base, refresh, external stylesheets, objects, and embeds", () => {
    const out = sanitizeDemoHtml(uploaded);
    expect(out).not.toContain("evil.example");
    expect(out).not.toContain("<object");
    expect(out).not.toContain("<embed");
    expect(out).not.toContain("http-equiv");
    expect(out).toContain("Uploaded shop text");
  });
});

describe("sanitizeDemoHtml: model generated page", () => {
  const model = `<!doctype html><html><head><title>Salon</title><link href="https://fonts.googleapis.com/css2?family=Test&display=swap" rel="stylesheet"><style>.a{color:red}</style><script src="https://cdn.evil.example/lib.js"></script><script>document.querySelector(".sig").textContent = "hi";</script></head><body><section class="sig"></section><a href="https://wa.me/123456">WhatsApp</a><a href="https://www.google.com/maps/search/?api=1&query=Salon">Directions</a><img src="data:image/svg+xml,<svg></svg>" alt=""></body></html>`;

  it("keeps the fonts link, inline style, inline script, and booking links, and strips the external script", () => {
    const out = sanitizeDemoHtml(model);
    expect(out).toContain("fonts.googleapis.com");
    expect(out).toContain(".a{color:red}");
    expect(out).toContain('document.querySelector(".sig")');
    expect(out).toContain("https://wa.me/123456");
    expect(out).toContain("google.com/maps");
    expect(out).not.toContain("cdn.evil.example");
    expect(out).not.toContain("<script src");
  });

  it("strips a style attribute that tries to run javascript", () => {
    const out = sanitizeDemoHtml(`<html><body><div style="background:url(javascript:alert(1))">hi</div></body></html>`);
    expect(out).not.toContain("javascript:");
    expect(out).toContain("hi");
  });
});

describe("demoSecurityHeaders", () => {
  it("sandboxes the page without same origin access, and blocks fetch and form submission", () => {
    const headers = demoSecurityHeaders();
    const csp = headers["content-security-policy"] ?? "";
    expect(csp).toContain("sandbox");
    expect(csp).toContain("allow-scripts");
    expect(csp).not.toContain("allow-same-origin");
    expect(csp).not.toContain("allow-popups");
    expect(csp).not.toContain("allow-forms");
    expect(csp).toContain("connect-src 'none'");
    expect(csp).toContain("form-action 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("fonts.googleapis.com");
    expect(csp).toContain("fonts.gstatic.com");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("no-referrer");
    expect(headers["cache-control"]).toBe("no-store");
  });
});

describe("progressivePreviewHtml", () => {
  const partial = `<!doctype html><html><head><title>Salon</title><style>.a{color:red}</style></head><body><section><h1>Test Salon</h1><p>${"x".repeat(600)}</p></section><section><h2>Services</h2>`;

  it("returns a preview for a partial page, without requiring a closing html tag", () => {
    const out = progressivePreviewHtml(partial);
    expect(out).not.toBeNull();
    expect(out).toContain("Test Salon");
    expect(out).toContain("<section>");
  });

  it("returns null for a short fragment and for a head only stream", () => {
    expect(progressivePreviewHtml("<html><body>hi</body>")).toBeNull();
    expect(progressivePreviewHtml(`<!doctype html><html><head><title>Salon</title><style>.a{color:red}</style></head>${"x".repeat(100)}`)).toBeNull();
  });

  it("cuts a trailing incomplete tag and strips an external script from a partial page", () => {
    const out = progressivePreviewHtml(`${partial}<script src="https://evil.example/lib.js"></script><div cla`);
    expect(out).not.toBeNull();
    expect(out).not.toContain("evil.example");
    expect(out).not.toContain("cla");
    expect(out).toContain("Test Salon");
  });
});

describe("looksLikeFullPage", () => {
  it("accepts a complete page of real length", () => {
    expect(looksLikeFullPage(page)).toBe(true);
  });

  it("rejects a short fragment and a page missing its closing tag", () => {
    expect(looksLikeFullPage("<html><body>hi</body>")).toBe(false);
    expect(looksLikeFullPage(page.replace("</html>", ""))).toBe(false);
  });
});
