import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const skmEntryValidator = v.object({
  _id: v.id("skmEntries"),
  _creationTime: v.number(),
  title: v.string(),
  slug: v.string(),
  year: v.number(),
  quarter: v.string(),
  imageUrl: v.optional(v.string()),
  description: v.optional(v.string()),
  displayOrder: v.number(),
  isActive: v.boolean(),
  createdAt: v.number(),
});

export const list = query({
  args: {},
  returns: v.array(skmEntryValidator),
  handler: async (ctx) => {
    return await ctx.db
      .query("skmEntries")
      .withIndex("by_displayOrder")
      .order("asc")
      .take(100);
  },
});

export const listActive = query({
  args: {},
  returns: v.array(skmEntryValidator),
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("skmEntries")
      .withIndex("by_displayOrder")
      .order("asc")
      .take(100);
    return entries.filter((entry) => entry.isActive);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(skmEntryValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("skmEntries")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    year: v.number(),
    quarter: v.string(),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    displayOrder: v.number(),
    isActive: v.boolean(),
  },
  returns: v.id("skmEntries"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("skmEntries", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("skmEntries"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    year: v.optional(v.number()),
    quarter: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(id, patch);
    }
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("skmEntries") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

export const seed2025 = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const defaults = [
      { quarter: "Triwulan I", order: 0 },
      { quarter: "Triwulan II", order: 1 },
      { quarter: "Triwulan III", order: 2 },
      { quarter: "Triwulan IV", order: 3 },
    ];

    for (const item of defaults) {
      const slug = `skm-triwulan-${item.order + 1}-2025`;
      const existing = await ctx.db
        .query("skmEntries")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();

      if (!existing) {
        await ctx.db.insert("skmEntries", {
          title: `SKM ${item.quarter} 2025`,
          slug,
          year: 2025,
          quarter: item.quarter,
          imageUrl: undefined,
          description: "Hasil Survey Kepuasan Masyarakat Cabang Dinas Kelautan dan Perikanan Kab. Malang.",
          displayOrder: item.order,
          isActive: true,
          createdAt: Date.now(),
        });
      }
    }

    return null;
  },
});
