import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  arsipSurat: defineTable({
    nomor: v.string(),
    perihal: v.string(),
    pengirimTujuan: v.string(),
    tanggal: v.string(),
    jenis: v.union(v.literal("Masuk"), v.literal("Keluar")),
    status: v.union(v.literal("Terbaca"), v.literal("Terkirim"), v.literal("Belum Dibaca")),
    pdfUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_jenis", ["jenis"]).index("by_created", ["createdAt"]),
});
