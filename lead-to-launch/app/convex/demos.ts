import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

// Helpers live inline in this file on purpose. PR 55 proved that a
// separate helper file in the convex directory breaks the production
// convex deploy, while preview and local builds still pass.
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

const SUFFIX_CHARS = "abcdefghjkmnpqrstuvwxyz23456789";
export const DEMO_SUFFIX_LENGTH = 12;

export function demoSuffix(): string {
  let s = "";
  for (let i = 0; i < DEMO_SUFFIX_LENGTH; i++) s += SUFFIX_CHARS[Math.floor(Math.random() * SUFFIX_CHARS.length)];
  return s;
}

export const VIEW_THROTTLE_MS = 60_000;

export function shouldCountView(lastViewedAt: number | undefined | null, now: number): boolean {
  if (lastViewedAt === undefined || lastViewedAt === null) return true;
  return now - lastViewedAt >= VIEW_THROTTLE_MS;
}

/** Demo HTML files are generated pages, normally well under 300 KB. */
export const MAX_DEMO_FILE_BYTES = 1_000_000;

// Publish allowlist, closing the C1 bypass where any signed-in user could
// publish a demo, bypassing the generation allowlist in lib/api-guard.ts.
// Helpers live inline in this file on purpose: PR 55 proved that a
// separate helper file in the convex directory breaks the production
// convex deploy, while preview and local builds still pass, so no
// helper file is added back here.
// The Next allowlist lives in Vercel as GENERATION_ALLOWED_EMAILS. The
// Convex allowlist uses the same variable name, but it must be set
// separately in the Convex dashboard, because Convex does not read
// Vercel environment variables. The email comes from the Clerk JWT
// (identity.email), which depends on the Clerk JWT template named
// "convex" including an email claim. If that claim is missing, the
// caller is denied with a clear error, never allowed through, because
// allowing a missing email would let any signed-in user publish.
export function parseAllowedEmails(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedEmail(email: string | undefined | null, allowed: string[]): boolean {
  if (!email) return false;
  return allowed.includes(email.trim().toLowerCase());
}

async function requireUserId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not signed in");
  return identity.subject;
}

/**
 * Publishing is allowlist-only, matching the generation allowlist in
 * lib/api-guard.ts. This check must live in Convex, not only in the
 * Next UI, because a signed-in user can call a Convex mutation directly
 * and bypass any client or Next route check. It is applied to
 * generateUploadUrl and publish, the two steps that create a live page.
 * It is deliberately NOT applied to remove: deleting your own demo is
 * cleanup, not hosting, and a user removed from the allowlist should
 * still be able to take their own demo down.
 */
async function requireGenerator(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not signed in");
  const allowed = parseAllowedEmails(process.env.GENERATION_ALLOWED_EMAILS);
  if (allowed.length === 0) {
    throw new Error("Publishing is switched off. Set GENERATION_ALLOWED_EMAILS in Convex to enable it for your email.");
  }
  if (!identity.email) {
    throw new Error("Publishing is allowlist-only, and your account email is not available to Convex. Check the Clerk JWT template named convex includes an email claim.");
  }
  if (!isAllowedEmail(identity.email, allowed)) {
    throw new Error("Your account is not allowed to publish demos.");
  }
  return identity.subject;
}

/** Short-lived upload URL for one demo HTML file (Convex file storage). Allowlist-gated, so a non-allowlisted user cannot even start an upload. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireGenerator(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Publish the uploaded file as this lead's live demo. One demo per lead
 * per user: publishing again after a rebuild keeps the same slug and
 * swaps the file, so a link already sent to the prospect never breaks.
 */
export const publish = mutation({
  args: { storageId: v.id("_storage"), businessName: v.string(), leadKey: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireGenerator(ctx);
    // Validate the uploaded file before touching an existing demo, so a
    // rejected file never leaves a republished demo broken. Metadata
    // comes from the _storage system table, the preferred path over the
    // deprecated storage.getMetadata. A demo is a generated HTML page,
    // normally well under 300 KB, so 1 MB is generous, and a non-HTML
    // file is never a demo.
    const meta = await ctx.db.system.get("_storage", args.storageId);
    if (!meta) throw new Error("Uploaded file not found, please try publishing again");
    if (meta.size > MAX_DEMO_FILE_BYTES) {
      await ctx.storage.delete(args.storageId);
      throw new Error("Demo file is too large, please rebuild a smaller page");
    }
    if (meta.contentType && meta.contentType !== "text/html") {
      await ctx.storage.delete(args.storageId);
      throw new Error("Demo file must be an HTML page");
    }
    const existing = await ctx.db
      .query("demos")
      .withIndex("by_user_lead", (q) => q.eq("userId", userId).eq("leadKey", args.leadKey))
      .unique();
    if (existing) {
      if (existing.storageId !== args.storageId) await ctx.storage.delete(existing.storageId);
      await ctx.db.patch(existing._id, { storageId: args.storageId, businessName: args.businessName });
      return { slug: existing.slug };
    }
    const base = slugify(args.businessName) || "site";
    for (let attempt = 0; attempt < 6; attempt++) {
      const slug = `${base}-${demoSuffix()}`;
      const clash = await ctx.db
        .query("demos")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (clash) continue;
      await ctx.db.insert("demos", {
        userId,
        leadKey: args.leadKey,
        slug,
        storageId: args.storageId,
        businessName: args.businessName,
        views: 0,
        createdAt: Date.now(),
      });
      return { slug };
    }
    throw new Error("Could not allocate a demo link, please try again");
  },
});

/**
 * Delete the signed-in user's demo for one lead, unpublishing it and
 * removing the stored file. The link stops working on every device:
 * getBySlug finds no row, so the demo route returns its 404, and the
 * route serves successful demos with no-store, so there is no cached
 * copy to keep showing. The lookup is by user plus lead, never by slug
 * alone, so one user cannot delete another user's demo by guessing a
 * link. If the demo is already gone, this is a no-op, so tapping
 * delete twice on a phone does not error. If the stored file is
 * already gone, the row is still deleted, because taking the link down
 * matters more than storage cleanup. Publishing again after a delete
 * creates a new slug, the old link is never revived.
 */
export const remove = mutation({
  args: { leadKey: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const demo = await ctx.db
      .query("demos")
      .withIndex("by_user_lead", (q) => q.eq("userId", userId).eq("leadKey", args.leadKey))
      .unique();
    if (!demo) return null;
    try {
      await ctx.storage.delete(demo.storageId);
    } catch {
      /* File already gone. The row deletion below still unpublishes. */
    }
    await ctx.db.delete(demo._id);
    return { slug: demo.slug };
  },
});

/** The signed-in user's demo for one lead, if they have published one. */
export const byLeadKey = query({
  args: { leadKey: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const demo = await ctx.db
      .query("demos")
      .withIndex("by_user_lead", (q) => q.eq("userId", userId).eq("leadKey", args.leadKey))
      .unique();
    if (!demo) return null;
    return {
      slug: demo.slug,
      views: demo.views,
      lastViewedAt: demo.lastViewedAt ?? null,
      createdAt: demo.createdAt,
    };
  },
});

/** Public: the /demo/[slug] page route resolves a slug to its stored file. */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const demo = await ctx.db
      .query("demos")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!demo) return null;
    const url = await ctx.storage.getUrl(demo.storageId);
    return url ? { url, businessName: demo.businessName } : null;
  },
});

/** Public: the /demo/[slug] route records each open of the link, throttled to at most one counted view per minute per demo, so refreshing cannot inflate the count. lastViewedAt is only updated when a view counts, so repeated calls do not push the window forward forever. */
export const recordView = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const demo = await ctx.db
      .query("demos")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!demo) return;
    const now = Date.now();
    if (!shouldCountView(demo.lastViewedAt, now)) return;
    await ctx.db.patch(demo._id, { views: demo.views + 1, lastViewedAt: now });
  },
});
