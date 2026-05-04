import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("pelaporanGratifikasi")
      .withIndex("by_created")
      .order("desc")
      .take(200);
  },
});

export const create = mutation({
  args: {
    nama: v.string(),
    nip: v.optional(v.string()),
    jabatan: v.string(),
    unitKerja: v.string(),
    telepon: v.string(),
    email: v.string(),
    tanggalPenerimaan: v.string(),
    jenisGratifikasi: v.string(),
    nilaiGratifikasi: v.string(),
    pemberGratifikasi: v.string(),
    hubunganPemberi: v.string(),
    kronologi: v.string(),
    imageUrl: v.optional(v.string()),
    isAnonymous: v.boolean(),
    status: v.union(v.literal("Baru"), v.literal("Diproses"), v.literal("Selesai")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pelaporanGratifikasi", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("pelaporanGratifikasi"),
    status: v.union(v.literal("Baru"), v.literal("Diproses"), v.literal("Selesai")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: {
    id: v.id("pelaporanGratifikasi"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
