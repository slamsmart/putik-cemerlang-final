import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("arsipSurat")
      .withIndex("by_created")
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    nomor: v.string(),
    perihal: v.string(),
    pengirimTujuan: v.string(),
    tanggal: v.string(),
    jenis: v.union(v.literal("Masuk"), v.literal("Keluar")),
    status: v.union(v.literal("Terarsip"), v.literal("Terbaca"), v.literal("Terkirim"), v.literal("Belum Dibaca")),
    pdfUrl: v.optional(v.string()),
    tanggalSurat: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("arsipSurat", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("arsipSurat"),
    nomor: v.optional(v.string()),
    perihal: v.optional(v.string()),
    pengirimTujuan: v.optional(v.string()),
    tanggal: v.optional(v.string()),
    jenis: v.optional(v.union(v.literal("Masuk"), v.literal("Keluar"))),
    status: v.optional(v.union(v.literal("Terarsip"), v.literal("Terbaca"), v.literal("Terkirim"), v.literal("Belum Dibaca"))),
    pdfUrl: v.optional(v.string()),
    tanggalSurat: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("arsipSurat") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("arsipSurat").collect();
    if (existing.length > 0) return;

    const seeds = [
      { nomor: "001/KKP/V/2024", perihal: "Undangan Rapat Koordinasi Perikanan", pengirimTujuan: "Dinas Kelautan & Perikanan Provinsi Jawa Timur", tanggal: "2024-05-03", jenis: "Masuk" as const, status: "Terarsip" as const },
      { nomor: "022/DKP/V/2024", perihal: "Laporan Hasil Monitoring Zona Tangkap Q1 2024", pengirimTujuan: "Bidang Pengawasan DKP Kab. Malang", tanggal: "2024-05-02", jenis: "Keluar" as const, status: "Terkirim" as const },
      { nomor: "035/KKP/V/2024", perihal: "Surat Edaran Tata Cara Perizinan Kapal Nelayan", pengirimTujuan: "Kementerian Kelautan dan Perikanan RI", tanggal: "2024-05-01", jenis: "Masuk" as const, status: "Terarsip" as const },
      { nomor: "018/DKP/IV/2024", perihal: "Permohonan Data Statistik Perikanan 2023", pengirimTujuan: "BPS Kabupaten Malang", tanggal: "2024-04-28", jenis: "Masuk" as const, status: "Belum Dibaca" as const },
      { nomor: "045/DKP/IV/2024", perihal: "Rekomendasi Lokasi Budidaya Rumput Laut", pengirimTujuan: "Bidang Budidaya DKP Kab. Malang", tanggal: "2024-04-25", jenis: "Keluar" as const, status: "Terkirim" as const },
    ];

    for (const s of seeds) {
      await ctx.db.insert("arsipSurat", { ...s, createdAt: Date.now() });
    }
  },
});

// ── Convex File Storage ─────────────────────────────────────
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

export const migrateStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("arsipSurat").collect();
    for (const record of records) {
      if (record.status === "Terbaca") {
        await ctx.db.patch(record._id, { status: "Terarsip" });
      }
    }
  },
});
