import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { leadStatus } from "./schema";

async function requireUserId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not signed in");
  return identity.subject;
}

async function ownDoc(ctx: MutationCtx, id: Id<"savedLeads">) {
  const userId = await requireUserId(ctx);
  const doc = await ctx.db.get(id);
  if (!doc || doc.userId !== userId) throw new Error("Saved lead not found");
  return doc;
}

/** Every lead this user has saved, most recently touched first. */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("savedLeads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

const snapshotArgs = {
  placeKey: v.string(),
  placeId: v.optional(v.string()),
  name: v.string(),
  category: v.string(),
  address: v.string(),
  city: v.string(),
  phone: v.optional(v.string()),
  whatsapp: v.optional(v.string()),
  email: v.optional(v.string()),
  website: v.optional(v.string()),
  rating: v.optional(v.number()),
  reviewsCount: v.optional(v.number()),
  photosCount: v.optional(v.number()),
  tier: v.string(),
  auditDate: v.number(),
  gaps: v.array(v.string()),
  strengths: v.array(v.string()),
  biggestGap: v.string(),
  hasWebsite: v.boolean(),
  siteKind: v.optional(v.string()),
  lat: v.optional(v.number()),
  lng: v.optional(v.number()),
  pageSpeedScore: v.optional(v.number()),
  pageSpeedMeasured: v.optional(v.boolean()),
  mobileFriendly: v.optional(v.boolean()),
  https: v.optional(v.boolean()),
  hasSchema: v.optional(v.boolean()),
  loadTimeMs: v.optional(v.number()),
  builder: v.optional(v.string()),
  opportunity: v.optional(v.string()),
  checks: v.optional(
    v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        status: v.union(v.literal("pass"), v.literal("fail"), v.literal("unknown")),
        severity: v.union(v.literal(1), v.literal(2), v.literal(3)),
        evidence: v.string(),
      }),
    ),
  ),
};

/**
 * Save a lead with its audit snapshot. Saving the same business again
 * (same placeKey) refreshes the snapshot and audit date but keeps the
 * status and notes the user has already set.
 */
export const save = mutation({
  args: snapshotArgs,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("savedLeads")
      .withIndex("by_user_place", (q) => q.eq("userId", userId).eq("placeKey", args.placeKey))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("savedLeads", {
      ...args,
      userId,
      status: "new" as const,
      notes: "",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const setStatus = mutation({
  args: { id: v.id("savedLeads"), status: leadStatus },
  handler: async (ctx, args) => {
    const doc = await ownDoc(ctx, args.id);
    await ctx.db.patch(doc._id, { status: args.status, updatedAt: Date.now() });
  },
});

export const setNotes = mutation({
  args: { id: v.id("savedLeads"), notes: v.string() },
  handler: async (ctx, args) => {
    const doc = await ownDoc(ctx, args.id);
    await ctx.db.patch(doc._id, { notes: args.notes, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("savedLeads") },
  handler: async (ctx, args) => {
    const doc = await ownDoc(ctx, args.id);
    await ctx.db.delete(doc._id);
  },
});
