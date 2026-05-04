import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("pengaduanMasyarakat")
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
    lokasi: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    status: v.union(v.literal("Baru"), v.literal("Diproses"), v.literal("Selesai")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pengaduanMasyarakat", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("pengaduanMasyarakat"),
    status: v.union(v.literal("Baru"), v.literal("Diproses"), v.literal("Selesai")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: {
    id: v.id("pengaduanMasyarakat"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
