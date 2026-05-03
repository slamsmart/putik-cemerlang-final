import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const statValidator = v.object({
  _id: v.id("stats"),
  _creationTime: v.number(),
  value: v.string(),
  label: v.string(),
  icon: v.string(),
  highlight: v.boolean(),
  displayOrder: v.number(),
  isActive: v.boolean(),
  linkUrl: v.string(),
});

export const list = query({
  args: {},
  returns: v.array(statValidator),
  handler: async (ctx) => {
    return await ctx.db
      .query("stats")
      .withIndex("by_displayOrder")
      .collect();
  },
});

export const create = mutation({
  args: {
    value: v.string(),
    label: v.string(),
    icon: v.string(),
    highlight: v.boolean(),
    displayOrder: v.number(),
    isActive: v.boolean(),
    linkUrl: v.string(),
  },
  returns: v.id("stats"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("stats", {
      value: args.value,
      label: args.label,
      icon: args.icon,
      highlight: args.highlight,
      displayOrder: args.displayOrder,
      isActive: args.isActive,
      linkUrl: args.linkUrl,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("stats"),
    value: v.optional(v.string()),
    label: v.optional(v.string()),
    icon: v.optional(v.string()),
    highlight: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    linkUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined),
    );
    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(id, cleanUpdates);
    }
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("stats") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
