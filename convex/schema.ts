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
    customFields: v.optional(v.record(v.string(), v.string())),
    createdAt: v.number(),
  }).index("by_jenis", ["jenis"]).index("by_created", ["createdAt"]),

  arsipCustomColumns: defineTable({
    key: v.string(),
    label: v.string(),
    type: v.union(v.literal("text"), v.literal("number"), v.literal("date")),
    displayOrder: v.number(),
    createdAt: v.number(),
  }).index("by_displayOrder", ["displayOrder"]).index("by_key", ["key"]),

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

  skmEntries: defineTable({
    title: v.string(),
    slug: v.string(),
    year: v.number(),
    quarter: v.string(),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    displayOrder: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_displayOrder", ["displayOrder"])
    .index("by_slug", ["slug"])
    .index("by_year_and_displayOrder", ["year", "displayOrder"]),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
    label: v.optional(v.string()),
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

  pelaporanGratifikasi: defineTable({
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
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]).index("by_status", ["status"]),

  eomCandidates: defineTable({
    nama: v.string(),
    seksi: v.string(),
    imageUrl: v.optional(v.string()),
    periode: v.string(), // e.g. "Mei 2026"
    isActive: v.boolean(),
    voteCount: v.number(),
    displayOrder: v.number(),
    createdAt: v.number(),
  }).index("by_periode", ["periode"]).index("by_created", ["createdAt"]),

  eomVotes: defineTable({
    candidateId: v.id("eomCandidates"),
    ipAddress: v.string(),
    voterId: v.optional(v.string()), // UUID unik per browser/device (localStorage)
    voterEmail: v.optional(v.string()), // Gmail dari Google Sign-In
    voterName: v.optional(v.string()),  // Nama profil Google (ditampilkan publik)
    periode: v.string(),
    createdAt: v.number(),
  }).index("by_ip_periode", ["ipAddress", "periode"])
    .index("by_candidateId", ["candidateId"])
    .index("by_voterId_periode", ["voterId", "periode"])
    .index("by_voterEmail_periode", ["voterEmail", "periode"]),

  // ── Visitor Tracking ────────────────────────────────────────────────────────
  // Satu record per visitorId per hari (YYYY-MM-DD). Increment `pageviews`
  // setiap kali visitor membuka halaman. Kombinasi visitorId + dateKey unik.
  visitorSessions: defineTable({
    visitorId: v.string(),       // UUID di localStorage browser
    dateKey: v.string(),          // YYYY-MM-DD
    pageviews: v.number(),
    firstSeen: v.number(),        // timestamp ms
    lastSeen: v.number(),         // timestamp ms
    userAgent: v.optional(v.string()),
    isAdmin: v.boolean(),         // admin yg sudah login
  }).index("by_visitor_date", ["visitorId", "dateKey"])
    .index("by_date", ["dateKey"])
    .index("by_created", ["firstSeen"]),
});
