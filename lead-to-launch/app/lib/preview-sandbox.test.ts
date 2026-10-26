import { describe, expect, it } from "vitest";
import { PREVIEW_SANDBOX } from "./preview-sandbox";

describe("preview sandbox", () => {
  it("allows scripts and popups, so generated pages run and booking links open", () => {
    expect(PREVIEW_SANDBOX).toContain("allow-scripts");
    expect(PREVIEW_SANDBOX).toContain("allow-popups");
  });

  it("never allows a popup to escape the sandbox, and never allows same origin, forms, or top navigation", () => {
    expect(PREVIEW_SANDBOX).not.toContain("allow-popups-to-escape-sandbox");
    expect(PREVIEW_SANDBOX).not.toContain("allow-same-origin");
    expect(PREVIEW_SANDBOX).not.toContain("allow-forms");
    expect(PREVIEW_SANDBOX).not.toContain("allow-top-navigation");
  });
});
