import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return setting?.value;
  },
});

export const getAll = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").collect();
    const result: Record<string, string> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  },
});

export const setMultiple = mutation({
  args: { settings: v.record(v.string(), v.string()) },
  handler: async (ctx, args) => {
    for (const [key, value] of Object.entries(args.settings)) {
      const existing = await ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();
      
      if (existing) {
        await ctx.db.patch(existing._id, { value });
      } else {
        await ctx.db.insert("settings", { key, value });
      }
    }
  },
});

export const set = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
      
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
    } else {
      await ctx.db.insert("settings", {
        key: args.key,
        value: args.value,
      });
    }
  },
});

export const verifyPassword = mutation({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "admin_password"))
      .first();
    const currentPassword = setting?.value || "putik@malang2026";
    return args.password === currentPassword;
  },
});

export const updatePassword = mutation({
  args: { oldPassword: v.string(), newPassword: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "admin_password"))
      .first();
    const currentPassword = setting?.value || "putik@malang2026";
    
    if (args.oldPassword !== currentPassword) {
      throw new Error("Kata sandi lama salah");
    }
    
    if (setting) {
      await ctx.db.patch(setting._id, { value: args.newPassword });
    } else {
      await ctx.db.insert("settings", { key: "admin_password", value: args.newPassword });
    }
    return true;
  },
});
