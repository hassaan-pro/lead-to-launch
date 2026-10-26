import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { slugify, demoSuffix, shouldCountView, MAX_DEMO_FILE_BYTES } from "./demo-helpers";

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
