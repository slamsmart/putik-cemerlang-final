import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Custom columns for Arsip Surat.
 * Admin dapat menambah / menghapus kolom tambahan tanpa mengubah schema utama.
 * Nilai per record disimpan di field `customFields` pada tabel `arsipSurat`.
 */

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("arsipCustomColumns")
      .withIndex("by_displayOrder")
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    label: v.string(),
    type: v.optional(v.union(v.literal("text"), v.literal("number"), v.literal("date"))),
  },
  handler: async (ctx, { label, type }) => {
    const trimmed = label.trim();
    if (!trimmed) throw new Error("Label kolom tidak boleh kosong");

    // Generate stable key dari label (slug) + suffix unik bila tabrakan
    const baseKey = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40) || "kolom";

    const existing = await ctx.db.query("arsipCustomColumns").collect();
    let key = baseKey;
    let suffix = 1;
    while (existing.some((c) => c.key === key)) {
      suffix += 1;
      key = `${baseKey}_${suffix}`;
    }

    const nextOrder =
      existing.length === 0
        ? 0
        : Math.max(...existing.map((c) => c.displayOrder)) + 1;

    return await ctx.db.insert("arsipCustomColumns", {
      key,
      label: trimmed,
      type: type ?? "text",
      displayOrder: nextOrder,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("arsipCustomColumns") },
  handler: async (ctx, { id }) => {
    const column = await ctx.db.get(id);
    if (!column) return;

    // Bersihkan nilai kolom tsb di semua record arsipSurat agar tidak bersisa.
    const records = await ctx.db.query("arsipSurat").collect();
    for (const record of records) {
      if (record.customFields && record.customFields[column.key] !== undefined) {
        const { [column.key]: _removed, ...rest } = record.customFields;
        await ctx.db.patch(record._id, { customFields: rest });
      }
    }

    await ctx.db.delete(id);
  },
});

export const reorder = mutation({
  args: { ids: v.array(v.id("arsipCustomColumns")) },
  handler: async (ctx, { ids }) => {
    for (let i = 0; i < ids.length; i++) {
      await ctx.db.patch(ids[i], { displayOrder: i });
    }
  },
});
