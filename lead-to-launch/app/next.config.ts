import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Block MIME sniffing, so a served file cannot be reinterpreted
          // as a script or style by the browser.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // The main app must never be framed by another site. The demo
          // route already denies framing with frame-ancestors none, and
          // this header agrees with it, it does not replace its CSP.
          { key: "X-Frame-Options", value: "DENY" },
          // Send the origin, not the full path, to other sites.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The app never needs these browser features, so deny them
          // outright rather than leaving them available to injected code.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          // HTTPS only, for two years, including subdomains. No preload
          // on purpose: preload is hard to undo if the domain ever needs
          // plain HTTP again, and this is the first HSTS step.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          // No Content-Security-Policy here on purpose. A main app CSP
          // needs allowlists for Clerk, Convex, Google Fonts, and Vercel
          // Analytics, and a wrong one breaks sign in. That is a separate
          // follow-up with a phone test of sign in, not a line added
          // blind in this PR. The demo route keeps its own CSP.
        ],
      },
    ];
  },
};

export default nextConfig;
