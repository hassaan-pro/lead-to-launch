import { describe, expect, it } from "vitest";
import { cleanHtml, looksLikeFullPage } from "./html";

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

describe("looksLikeFullPage", () => {
  it("accepts a complete page of real length", () => {
    expect(looksLikeFullPage(page)).toBe(true);
  });

  it("rejects a short fragment and a page missing its closing tag", () => {
    expect(looksLikeFullPage("<html><body>hi</body>")).toBe(false);
    expect(looksLikeFullPage(page.replace("</html>", ""))).toBe(false);
  });
});
