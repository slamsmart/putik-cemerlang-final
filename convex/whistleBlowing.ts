import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("whistleBlowing")
      .withIndex("by_created")
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    nama: v.string(),
    email: v.string(),
    telepon: v.string(),
    judul: v.string(),
    isi: v.string(),
    imageUrl: v.optional(v.string()),
    isAnonymous: v.boolean(),
    status: v.union(v.literal("Baru"), v.literal("Diproses"), v.literal("Selesai")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("whistleBlowing", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("whistleBlowing"),
    status: v.union(v.literal("Baru"), v.literal("Diproses"), v.literal("Selesai")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: {
    id: v.id("whistleBlowing"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
