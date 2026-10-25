import { after } from "next/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { sanitizeDemoHtml, demoSecurityHeaders } from "@/lib/generation/html";

// A prospect's live demo: the generated site, served as its own page on
// the product domain. Public by design (the middleware lets /demo through);
// the slug carries an unguessable suffix, and the file behind it lives in
// Convex storage, published by the signed-in user from the Build phase.
//
// Security boundary: the stored file is never served as it was uploaded.
// It is sanitised here on the server before it reaches a browser, and it
// is served with a sandboxed CSP, so a direct Convex publish that bypasses
// the client cannot turn a demo link into a script on the product origin.
// See lib/generation/html.ts for what the sanitiser keeps and drops.
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = await fetchQuery(api.demos.getBySlug, { slug }).catch(() => null);
  if (!demo) {
    return new Response("This demo link is not live. It may have been replaced, or it was never published.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  const file = await fetch(demo.url).catch(() => null);
  if (!file || !file.ok) {
    return new Response("The demo file is unavailable right now.", { status: 502 });
  }
  const raw = await file.text();
  const html = sanitizeDemoHtml(raw);
  after(async () => {
    await fetchMutation(api.demos.recordView, { slug }).catch(() => {});
  });
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      ...demoSecurityHeaders(),
    },
  });
}
