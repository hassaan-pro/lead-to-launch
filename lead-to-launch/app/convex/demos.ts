import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

// Diagnostic change only, no behaviour change: these helpers used to live
// in convex/demo-helpers.ts, a separate file in the convex directory.
// PR 52, the last production deploy that went green, had slugify and
// suffix inline in this file. This PR returns to that shape, to test
// whether the separate helper file is what the production convex deploy
// chokes on. Slug length, view throttle, and file limits are identical.
// If production goes green with this PR, the helper file was the cause.
// If it still fails, the cause is elsewhere, most likely the system
// table file check in publish, which is the next experiment.
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

async function requireUserId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not signed in");
  return identity.subject;
}

/** Short-lived upload URL for one demo HTML file (Convex file storage). */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);
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
    const userId = await requireUserId(ctx);
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
