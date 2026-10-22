import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const leadStatus = v.union(
  v.literal("new"),
  v.literal("pitched"),
  v.literal("replied"),
  v.literal("won"),
  v.literal("lost"),
);

/**
 * A business the user audited and chose to keep, with the audit snapshot
 * taken at save time. Keyed per user by placeKey (Google place ID when the
 * scrape provides one) so re-saving after a re-audit updates the same row
 * instead of creating a duplicate.
 */
export default defineSchema({
  savedLeads: defineTable({
    userId: v.string(),
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
    status: leadStatus,
    notes: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_place", ["userId", "placeKey"]),

  /**
   * A published demo site for one lead: the generated HTML lives in file
   * storage, this row is the permanent public link (/demo/<slug>) plus its
   * open count, so the owner can see whether the prospect ever looked.
   */
  demos: defineTable({
    userId: v.string(),
    leadKey: v.string(),
    slug: v.string(),
    storageId: v.id("_storage"),
    businessName: v.string(),
    views: v.number(),
    lastViewedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_user_lead", ["userId", "leadKey"]),
});
