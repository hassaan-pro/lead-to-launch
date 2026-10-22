import { after } from "next/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

// A prospect's live demo: the generated site, served as its own page on
// the product domain. Public by design (the middleware lets /demo through);
// the slug carries an unguessable suffix, and the file behind it lives in
// Convex storage, published by the signed-in user from the Build phase.
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
  const html = await file.arrayBuffer();
  after(async () => {
    await fetchMutation(api.demos.recordView, { slug }).catch(() => {});
  });
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=60",
    },
  });
}
