import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  arsipSurat: defineTable({
    nomor: v.string(),
    perihal: v.string(),
    pengirimTujuan: v.string(),
    tanggal: v.string(),
    jenis: v.union(v.literal("Masuk"), v.literal("Keluar")),
    status: v.union(v.literal("Terarsip"), v.literal("Terbaca"), v.literal("Terkirim"), v.literal("Belum Dibaca")),
    pdfUrl: v.optional(v.string()),
    tanggalSurat: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_jenis", ["jenis"]).index("by_created", ["createdAt"]),

  stats: defineTable({
    value: v.string(),
    label: v.string(),
    icon: v.string(),
    highlight: v.boolean(),
    displayOrder: v.number(),
    isActive: v.boolean(),
    linkUrl: v.string(),
  }).index("by_displayOrder", ["displayOrder"]),

  guestbook: defineTable({
    nama: v.string(),
    email: v.string(),
    pekerjaan: v.string(),
    pesan: v.string(),
    tanggal: v.string(),
    status: v.string(), // "Belum Dibalas", "Sudah Dibalas", "Diarsipkan"
  }),

  sliders: defineTable({
    title: v.string(),
    subtitle: v.string(),
    ctaText: v.string(),
    ctaLink: v.string(),
    imageUrl: v.string(),
    displayOrder: v.number(),
    isActive: v.boolean(),
  }).index("by_displayOrder", ["displayOrder"]),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  pengaduanMasyarakat: defineTable({
    nama: v.string(),
    email: v.string(),
    telepon: v.string(),
    judul: v.string(),
    isi: v.string(),
    lokasi: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    status: v.union(v.literal("Baru"), v.literal("Diproses"), v.literal("Selesai")),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]).index("by_status", ["status"]),

  whistleBlowing: defineTable({
    nama: v.string(),
    email: v.string(),
    telepon: v.string(),
    judul: v.string(),
    isi: v.string(),
    imageUrl: v.optional(v.string()),
    isAnonymous: v.boolean(),
    status: v.union(v.literal("Baru"), v.literal("Diproses"), v.literal("Selesai")),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]).index("by_status", ["status"]),
});
