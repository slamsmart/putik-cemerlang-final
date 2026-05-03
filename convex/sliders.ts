import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List all sliders, ordered by displayOrder ascending
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sliders")
      .withIndex("by_displayOrder")
      .order("asc")
      .take(20);
  },
});

// Create a new slider
export const create = mutation({
  args: {
    title: v.string(),
    subtitle: v.string(),
    ctaText: v.string(),
    ctaLink: v.string(),
    imageUrl: v.string(),
    displayOrder: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sliders", args);
  },
});

// Update an existing slider (partial patch)
export const update = mutation({
  args: {
    id: v.id("sliders"),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    ctaText: v.optional(v.string()),
    ctaLink: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    // Remove undefined values
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, patch);
  },
});

// Delete a slider
export const remove = mutation({
  args: { id: v.id("sliders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
