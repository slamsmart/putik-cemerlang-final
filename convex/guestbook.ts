import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List all guestbook entries, newest first
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("guestbook").order("desc").collect();
  },
});

// Create a new guestbook entry
export const create = mutation({
  args: {
    nama: v.string(),
    email: v.string(),
    pekerjaan: v.string(),
    pesan: v.string(),
    tanggal: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("guestbook", args);
  },
});

// Update status of an entry (e.g. "Sudah Dibalas")
export const updateStatus = mutation({
  args: {
    id: v.id("guestbook"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// Delete a guestbook entry
export const remove = mutation({
  args: {
    id: v.id("guestbook"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
