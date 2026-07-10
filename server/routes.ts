import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { insertSliderSchema, updateSliderSchema, insertStatSchema, updateStatSchema } from "@shared/schema";

function getUploadsDir() {
  const isVercel = process.env.VERCEL || process.env.NODE_ENV === "production";
  const dir = isVercel ? path.join("/tmp", "uploads") : path.join(process.cwd(), "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function saveLocal(buffer: Buffer, originalName: string): string {
  const ext = path.extname(originalName) || ".bin";
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  const dir = getUploadsDir();
  fs.writeFileSync(path.join(dir, name), buffer);
  return `/uploads/${name}`;
}

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only PDF or image files allowed"));
  },
});

export async function registerRoutes(httpServer: Server | null, app: Express): Promise<Server | null> {
  // ── Sliders ───────────────────────────────────────────────────────────────

  app.get("/api/sliders", async (_req, res: Response) => {
    try {
      const sliders = await storage.getSliders();
      res.json(sliders);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch sliders" });
    }
  });

  app.post("/api/sliders", async (req: Request, res: Response) => {
    const parsed = insertSliderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const slider = await storage.createSlider(parsed.data);
      res.status(201).json(slider);
    } catch (e) {
      res.status(500).json({ message: "Failed to create slider" });
    }
  });

  app.put("/api/sliders/:id", async (req: Request, res: Response) => {
    const parsed = updateSliderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const slider = await storage.updateSlider(req.params.id as string, parsed.data);
      if (!slider) return res.status(404).json({ message: "Slider not found" });
      res.json(slider);
    } catch (e) {
      res.status(500).json({ message: "Failed to update slider" });
    }
  });

  app.delete("/api/sliders/:id", async (req: Request, res: Response) => {
    try {
      const ok = await storage.deleteSlider(req.params.id as string);
      if (!ok) return res.status(404).json({ message: "Slider not found" });
      res.status(204).end();
    } catch (e) {
      res.status(500).json({ message: "Failed to delete slider" });
    }
  });

  // ── Stats ─────────────────────────────────────────────────────────────────

  app.get("/api/stats", async (_req, res: Response) => {
    try {
      const { convexQuery } = await import("./convexClient");
      const stats = await convexQuery("stats:list");
      res.json(stats);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.post("/api/stats", async (req: Request, res: Response) => {
    const parsed = insertStatSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const { convexMutation } = await import("./convexClient");
      const statId = await convexMutation("stats:create", parsed.data);
      res.status(201).json({ id: statId, ...parsed.data });
    } catch (e) {
      res.status(500).json({ message: "Failed to create stat" });
    }
  });

  app.put("/api/stats/:id", async (req: Request, res: Response) => {
    const parsed = updateStatSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const { convexMutation } = await import("./convexClient");
      await convexMutation("stats:update", { id: req.params.id, ...parsed.data });
      res.json({ id: req.params.id, ...parsed.data });
    } catch (e) {
      res.status(500).json({ message: "Failed to update stat" });
    }
  });

  app.delete("/api/stats/:id", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      await convexMutation("stats:remove", { id: req.params.id });
      res.status(204).end();
    } catch (e) {
      res.status(500).json({ message: "Failed to delete stat" });
    }
  });

  // ── Image Upload (Cloudinary) ─────────────────────────────────────────────

  app.post("/api/upload", uploadImage.single("image"), async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const cloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (!cloudinaryConfigured) {
      try {
        const url = saveLocal(req.file.buffer, req.file.originalname);
        return res.json({ url, note: "Gambar disimpan lokal (Cloudinary tidak dikonfigurasi)." });
      } catch (localErr: any) {
        return res.status(500).json({ message: localErr?.message || "Upload failed" });
      }
    }

    try {
      const { uploadToCloudinary } = await import("./cloudinary");
      const url = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      res.json({ url });
    } catch (e: any) {
      console.warn("Cloudinary image upload failed, falling back to local storage:", e?.message);
      try {
        const url = saveLocal(req.file.buffer, req.file.originalname);
        res.json({ url, note: "Gambar disimpan lokal (Cloudinary tidak tersedia)." });
      } catch (localErr: any) {
        res.status(500).json({ message: localErr?.message || "Upload failed" });
      }
    }
  });

  // ── PDF/Scan Upload (Cloudinary object storage) ───────────────────────────

  app.post("/api/upload-pdf", uploadPdf.single("file"), async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const cloudinaryConfigured =
      (process.env.CLOUDINARY_CLOUD_NAME || "").trim() &&
      (process.env.CLOUDINARY_API_KEY || "").trim() &&
      (process.env.CLOUDINARY_API_SECRET || "").trim();

    if (!cloudinaryConfigured) {
      return res.status(500).json({ message: "Cloudinary belum dikonfigurasi di environment lokal." });
    }

    try {
      const isPdf = req.file.mimetype === "application/pdf";
      const { uploadPdfToCloudinary } = await import("./cloudinary");
      const url = await uploadPdfToCloudinary(req.file.buffer, isPdf, req.file.originalname);
      return res.json({ url });
    } catch (e: any) {
      console.error("Cloudinary PDF upload error:", e?.message);
      try {
        const url = saveLocal(req.file.buffer, req.file.originalname);
        return res.json({ url, note: "File disimpan lokal (Cloudinary gagal)." });
      } catch (localErr: any) {
        return res.status(500).json({ message: localErr?.message || "Upload failed" });
      }
    }
  });

  // ── PDF Proxy (bypass Cloudinary access restriction) ─────────────────────

  app.get("/api/pdf-proxy", async (req: Request, res: Response) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ message: "Missing url parameter" });

    try {
      let targetUrl = url;
      const convexStorageMatch = url.match(/^(https:\/\/[^/]+\.convex\.cloud)\/api\/storage\/([^/?#]+)/i);
      if (convexStorageMatch) {
        const [, convexOrigin, storageId] = convexStorageMatch;
        const urlResp = await fetch(`${convexOrigin}/api/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: "arsipSurat:getFileUrl",
            args: { storageId },
          }),
        });
        if (urlResp.ok) {
          const json = await urlResp.json();
          const resolvedUrl = json?.value || json?.result;
          if (typeof resolvedUrl === "string" && resolvedUrl) {
            targetUrl = resolvedUrl;
          }
        }
      }

      const response = await fetch(targetUrl);
      if (!response.ok) {
        // If direct fetch fails, try generating a signed URL
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (cloudName && apiKey && apiSecret && url.includes("cloudinary.com")) {
          const { cloudinary } = await import("./cloudinary");
          // Extract public_id from Cloudinary URL
          const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
          if (match) {
            const publicId = match[1];
            const signedUrl = cloudinary.url(publicId, {
              resource_type: "raw",
              type: "upload",
              sign_url: true,
              secure: true,
            });
            const signedResp = await fetch(signedUrl);
            if (signedResp.ok) {
              const contentType = signedResp.headers.get("content-type") || "application/pdf";
              res.setHeader("Content-Type", contentType);
              res.setHeader("Content-Disposition", "inline");
              const buffer = Buffer.from(await signedResp.arrayBuffer());
              return res.send(buffer);
            }
          }

          // Fallback: try Cloudinary Admin API to get the resource
          const imageMatch = url.match(/\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
          if (imageMatch) {
            const publicId = imageMatch[1];
            const signedUrl = cloudinary.url(publicId, {
              resource_type: "image",
              type: "upload",
              sign_url: true,
              secure: true,
            });
            const signedResp = await fetch(signedUrl);
            if (signedResp.ok) {
              const contentType = signedResp.headers.get("content-type") || "application/pdf";
              res.setHeader("Content-Type", contentType);
              res.setHeader("Content-Disposition", "inline");
              const buffer = Buffer.from(await signedResp.arrayBuffer());
              return res.send(buffer);
            }
          }
        }
        return res.status(response.status).json({ message: "Failed to fetch file" });
      }

      const contentType = response.headers.get("content-type") || "application/pdf";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", "inline");
      const buffer = Buffer.from(await response.arrayBuffer());
      res.send(buffer);
    } catch (e: any) {
      console.error("PDF proxy error:", e);
      res.status(500).json({ message: e?.message || "Proxy error" });
    }
  });

  // ── Convex Proxy (arsip surat) ────────────────────────────────────────────

  app.get("/api/arsip-surat", async (_req, res: Response) => {
    try {
      const { convexQuery } = await import("./convexClient");
      const data = await convexQuery("arsipSurat:list");
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to fetch" });
    }
  });

  app.post("/api/arsip-surat", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      const { nomor, perihal, pengirimTujuan, tanggal, jenis, pdfUrl, tanggalSurat, customFields } = req.body;
      const status = jenis === "Keluar" ? "Terkirim" : "Terarsip";
      const args: Record<string, unknown> = { nomor, perihal, pengirimTujuan, tanggal, jenis, status };
      if (pdfUrl && typeof pdfUrl === "string" && pdfUrl.trim()) {
        args.pdfUrl = pdfUrl.trim();
      }
      if (tanggalSurat && typeof tanggalSurat === "string" && tanggalSurat.trim()) {
        args.tanggalSurat = tanggalSurat.trim();
      }
      if (customFields && typeof customFields === "object" && !Array.isArray(customFields)) {
        const cleaned: Record<string, string> = {};
        for (const [k, val] of Object.entries(customFields)) {
          if (typeof val === "string" && val.trim()) cleaned[k] = val.trim();
          else if (typeof val === "number") cleaned[k] = String(val);
        }
        if (Object.keys(cleaned).length > 0) args.customFields = cleaned;
      }
      const data = await convexMutation("arsipSurat:create", args);
      res.status(201).json(data);
    } catch (e: any) {
      console.error("Convex create error:", e);
      res.status(500).json({ message: e?.message || "Failed to create" });
    }
  });

  app.delete("/api/arsip-surat", async (_req: Request, res: Response) => {
    try {
      const { convexQuery, convexMutation } = await import("./convexClient");
      const data = await convexQuery("arsipSurat:list");
      for (const item of data) {
        await convexMutation("arsipSurat:remove", { id: item._id });
      }
      res.json({ deleted: data.length });
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to delete all" });
    }
  });

  app.delete("/api/arsip-surat/:id", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      await convexMutation("arsipSurat:remove", { id: req.params.id as string });
      res.status(204).end();
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to delete" });
    }
  });

  app.put("/api/arsip-surat/:id", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      const { nomor, perihal, pengirimTujuan, tanggal, jenis, pdfUrl, tanggalSurat, customFields, status } = req.body;
      const args: Record<string, unknown> = { id: req.params.id as string };
      if (nomor !== undefined) args.nomor = nomor;
      if (perihal !== undefined) args.perihal = perihal;
      if (pengirimTujuan !== undefined) args.pengirimTujuan = pengirimTujuan;
      if (tanggal !== undefined) args.tanggal = tanggal;
      if (jenis !== undefined) {
        args.jenis = jenis;
        args.status = status || (jenis === "Keluar" ? "Terkirim" : "Terarsip");
      }
      if (status !== undefined) args.status = status;
      if (pdfUrl !== undefined) args.pdfUrl = pdfUrl || undefined;
      if (tanggalSurat !== undefined) args.tanggalSurat = tanggalSurat || undefined;
      if (customFields && typeof customFields === "object" && !Array.isArray(customFields)) {
        const cleaned: Record<string, string> = {};
        for (const [k, val] of Object.entries(customFields)) {
          if (typeof val === "string" && val.trim()) cleaned[k] = val.trim();
          else if (typeof val === "number") cleaned[k] = String(val);
        }
        args.customFields = cleaned;
      }
      await convexMutation("arsipSurat:update", args);
      res.json({ ok: true });
    } catch (e: any) {
      console.error("Convex update error:", e);
      res.status(500).json({ message: e?.message || "Failed to update" });
    }
  });

  // ── Arsip Surat — Custom Columns ─────────────────────────────────────────
  app.get("/api/arsip-surat/custom-columns", async (_req: Request, res: Response) => {
    try {
      const { convexQuery } = await import("./convexClient");
      const data = await convexQuery("arsipCustomColumns:list");
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to fetch" });
    }
  });

  app.post("/api/arsip-surat/custom-columns", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      const { label, type } = req.body || {};
      if (!label || typeof label !== "string" || !label.trim()) {
        return res.status(400).json({ message: "Label kolom wajib diisi" });
      }
      const args: Record<string, unknown> = { label: label.trim() };
      if (type === "text" || type === "number" || type === "date") args.type = type;
      const id = await convexMutation("arsipCustomColumns:create", args);
      res.status(201).json({ id });
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to create" });
    }
  });

  app.delete("/api/arsip-surat/custom-columns/:id", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      await convexMutation("arsipCustomColumns:remove", { id: req.params.id as string });
      res.status(204).end();
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to delete" });
    }
  });

  app.patch("/api/arsip-surat/custom-columns/reorder", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      const { ids } = req.body || {};
      if (!Array.isArray(ids)) return res.status(400).json({ message: "ids harus array" });
      await convexMutation("arsipCustomColumns:reorder", { ids });
      res.status(204).end();
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to reorder" });
    }
  });

  // ── Pengaduan Masyarakat (local Convex proxy) ─────────────────────────────
  app.get("/api/pengaduan-masyarakat", async (_req: Request, res: Response) => {
    try {
      const { convexQuery } = await import("./convexClient");
      const data = await convexQuery("pengaduanMasyarakat:list");
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to fetch" });
    }
  });

  app.post("/api/pengaduan-masyarakat", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      const { nama, email, telepon, judul, isi, lokasi, imageUrl, status } = req.body;
      const args: Record<string, unknown> = { nama, email, telepon, judul, isi, status: status || "Baru" };
      if (lokasi && typeof lokasi === "string" && lokasi.trim()) args.lokasi = lokasi.trim();
      if (imageUrl && typeof imageUrl === "string" && imageUrl.trim()) args.imageUrl = imageUrl.trim();
      const data = await convexMutation("pengaduanMasyarakat:create", args);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to create" });
    }
  });

  app.patch("/api/pengaduan-masyarakat/:id/status", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      await convexMutation("pengaduanMasyarakat:updateStatus", { id: req.params.id as string, status: req.body.status });
      res.status(204).end();
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to update" });
    }
  });

  app.delete("/api/pengaduan-masyarakat/:id", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      await convexMutation("pengaduanMasyarakat:remove", { id: req.params.id as string });
      res.status(204).end();
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to delete" });
    }
  });

  // ── Whistle Blowing (local Convex proxy) ──────────────────────────────────
  app.get("/api/whistle-blowing", async (_req: Request, res: Response) => {
    try {
      const { convexQuery } = await import("./convexClient");
      const data = await convexQuery("whistleBlowing:list");
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to fetch" });
    }
  });

  app.post("/api/whistle-blowing", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      const { nama, email, telepon, judul, isi, imageUrl, isAnonymous, status } = req.body;
      const args: Record<string, unknown> = { nama, email, telepon, judul, isi, isAnonymous: !!isAnonymous, status: status || "Baru" };
      if (imageUrl && typeof imageUrl === "string" && imageUrl.trim()) args.imageUrl = imageUrl.trim();
      const data = await convexMutation("whistleBlowing:create", args);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to create" });
    }
  });

  app.patch("/api/whistle-blowing/:id/status", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      await convexMutation("whistleBlowing:updateStatus", { id: req.params.id as string, status: req.body.status });
      res.status(204).end();
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to update" });
    }
  });

  app.delete("/api/whistle-blowing/:id", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      await convexMutation("whistleBlowing:remove", { id: req.params.id as string });
      res.status(204).end();
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to delete" });
    }
  });

  // ── Pelaporan Gratifikasi (local Convex proxy) ─────────────────────────────
  app.get("/api/pelaporan-gratifikasi", async (_req: Request, res: Response) => {
    try {
      const { convexQuery } = await import("./convexClient");
      const data = await convexQuery("gratifikasi:list");
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to fetch" });
    }
  });

  app.post("/api/pelaporan-gratifikasi", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      const {
        nama, nip, jabatan, unitKerja, telepon, email,
        tanggalPenerimaan, jenisGratifikasi, nilaiGratifikasi,
        pemberGratifikasi, hubunganPemberi, kronologi,
        imageUrl, isAnonymous, status,
      } = req.body;
      const args: Record<string, unknown> = {
        nama: nama || "",
        jabatan: jabatan || "",
        unitKerja: unitKerja || "",
        telepon: telepon || "",
        email: email || "",
        tanggalPenerimaan: tanggalPenerimaan || "",
        jenisGratifikasi: jenisGratifikasi || "",
        nilaiGratifikasi: nilaiGratifikasi || "",
        pemberGratifikasi: pemberGratifikasi || "",
        hubunganPemberi: hubunganPemberi || "",
        kronologi: kronologi || "",
        isAnonymous: !!isAnonymous,
        status: status || "Baru",
      };
      if (nip && typeof nip === "string" && nip.trim()) args.nip = nip.trim();
      if (imageUrl && typeof imageUrl === "string" && imageUrl.trim()) args.imageUrl = imageUrl.trim();
      console.log("[pelaporan-gratifikasi] creating:", JSON.stringify(args));
      const data = await convexMutation("gratifikasi:create", args);
      res.status(201).json(data);
    } catch (e: any) {
      console.error("[pelaporan-gratifikasi] error:", e?.message);
      res.status(500).json({ message: e?.message || "Failed to create" });
    }
  });

  app.patch("/api/pelaporan-gratifikasi/:id/status", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      await convexMutation("gratifikasi:updateStatus", { id: req.params.id as string, status: req.body.status });
      res.status(204).end();
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to update" });
    }
  });

  app.delete("/api/pelaporan-gratifikasi/:id", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      await convexMutation("gratifikasi:remove", { id: req.params.id as string });
      res.status(204).end();
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to delete" });
    }
  });

  // SKM menu and content (local Convex proxy)
  app.get("/api/skm", async (_req: Request, res: Response) => {
    try {
      const { convexQuery } = await import("./convexClient");
      const data = await convexQuery("skm:list");
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to load SKM" });
    }
  });

  app.post("/api/skm", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      const id = await convexMutation("skm:create", {
        title: String(req.body.title || ""),
        slug: String(req.body.slug || ""),
        year: Number(req.body.year) || new Date().getFullYear(),
        quarter: String(req.body.quarter || ""),
        imageUrl: req.body.imageUrl ? String(req.body.imageUrl) : undefined,
        description: req.body.description ? String(req.body.description) : undefined,
        displayOrder: Number(req.body.displayOrder) || 0,
        isActive: Boolean(req.body.isActive),
      });
      res.status(201).json({ id });
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to create SKM" });
    }
  });

  app.post("/api/skm/seed-2025", async (_req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      await convexMutation("skm:seed2025", {});
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to seed SKM" });
    }
  });

  app.patch("/api/skm/:id", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      const args: Record<string, unknown> = { id: req.params.id as string };
      if (req.body.title !== undefined) args.title = String(req.body.title);
      if (req.body.slug !== undefined) args.slug = String(req.body.slug);
      if (req.body.year !== undefined) args.year = Number(req.body.year);
      if (req.body.quarter !== undefined) args.quarter = String(req.body.quarter);
      if (req.body.imageUrl !== undefined) args.imageUrl = req.body.imageUrl ? String(req.body.imageUrl) : "";
      if (req.body.description !== undefined) {
        args.description = req.body.description ? String(req.body.description) : "";
      }
      if (req.body.displayOrder !== undefined) args.displayOrder = Number(req.body.displayOrder);
      if (req.body.isActive !== undefined) args.isActive = Boolean(req.body.isActive);
      await convexMutation("skm:update", args);
      res.status(204).end();
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to update SKM" });
    }
  });

  app.delete("/api/skm/:id", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      await convexMutation("skm:remove", { id: req.params.id as string });
      res.status(204).end();
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to delete SKM" });
    }
  });

  app.post("/api/chatbot", async (req: Request, res: Response) => {
    try {
      const { message } = req.body as { message?: string };
      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ message: "Pesan kosong" });
      }
      const { generatePutikChatReply } = await import("./nvidiaChatbot");
      const reply = await generatePutikChatReply(message.trim());
      res.json(reply);
    } catch (e: any) {
      console.error("[chatbot] error:", e?.message);
      res.status(500).json({ message: e?.message || "Chatbot gagal merespons" });
    }
  });

  return httpServer;
}
