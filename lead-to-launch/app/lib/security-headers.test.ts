import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("security headers in next.config", () => {
  it("serves nosniff, frame deny, referrer, permissions, and HSTS on every path", async () => {
    const routes = await nextConfig.headers?.();
    expect(routes).toBeDefined();
    const all = routes?.find((r) => r.source === "/:path*");
    expect(all).toBeDefined();
    const map = new Map((all?.headers ?? []).map((h) => [h.key, h.value]));
    expect(map.get("X-Content-Type-Options")).toBe("nosniff");
    expect(map.get("X-Frame-Options")).toBe("DENY");
    expect(map.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(map.get("Permissions-Policy")).toContain("camera=()");
    expect(map.get("Permissions-Policy")).toContain("microphone=()");
    expect(map.get("Permissions-Policy")).toContain("geolocation=()");
    expect(map.get("Strict-Transport-Security")).toContain("max-age=63072000");
    expect(map.get("Strict-Transport-Security")).toContain("includeSubDomains");
  });

  it("does not set a main app CSP in config, so it cannot override the demo route CSP", async () => {
    const routes = await nextConfig.headers?.();
    const all = routes?.find((r) => r.source === "/:path*");
    const keys = (all?.headers ?? []).map((h) => h.key);
    expect(keys).not.toContain("Content-Security-Policy");
  });
});
