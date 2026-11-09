import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Kunci yang nilainya rahasia. Tidak pernah dikembalikan oleh `get`/`getAll`
 * dan tidak boleh ditulis lewat `set`/`setMultiple`; ubah hanya melalui
 * `updatePassword` (memverifikasi kata sandi lama). Tanpa daftar ini, siapa pun
 * yang memegang URL deployment dapat membaca kata sandi admin lalu
 * menggantinya tanpa mengetahui yang lama.
 */
const KUNCI_RAHASIA: Record<string, true> = {
  admin_password: true,
  cee_access_password: true,
};

const rahasia = (key: string): boolean => KUNCI_RAHASIA[key] === true;

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    if (rahasia(args.key)) return undefined;
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
      if (rahasia(setting.key)) continue;
      result[setting.key] = setting.value;
    }
    return result;
  },
});

export const setMultiple = mutation({
  args: { settings: v.record(v.string(), v.string()) },
  handler: async (ctx, args) => {
    for (const [key, value] of Object.entries(args.settings)) {
      if (rahasia(key)) throw new Error(`Kunci "${key}" tidak dapat diubah lewat pengaturan`);
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
    if (rahasia(args.key)) throw new Error(`Kunci "${args.key}" tidak dapat diubah lewat pengaturan`);
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
