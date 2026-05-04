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

  // ── PDF/Scan Upload (via Convex file storage — persistent & publicly accessible) ──

  app.post("/api/upload-pdf", uploadPdf.single("file"), async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    try {
      const { convexMutation: cMut, convexQuery: cQuery } = await import("./convexClient");

      // Step 1: Get upload URL from Convex
      const uploadUrl = await cMut("arsipSurat:generateUploadUrl", {});

      // Step 2: Upload file to Convex storage
      const uploadResp = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": req.file.mimetype },
        body: new Uint8Array(req.file.buffer),
      });

      if (!uploadResp.ok) {
        throw new Error(`Convex storage upload failed: ${uploadResp.statusText}`);
      }

      const uploadResult = await uploadResp.json();
      const storageId = uploadResult.storageId;

      // Step 3: Construct the public serving URL directly
      const convexUrl = process.env.CONVEX_URL || "https://fabulous-lemur-912.convex.cloud";
      const fileUrl = `${convexUrl}/api/storage/${storageId}`;

      return res.json({ url: fileUrl });
    } catch (e: any) {
      console.error("Convex file upload error:", e?.message);
      // Fallback to local storage
      try {
        const url = saveLocal(req.file.buffer, req.file.originalname);
        res.json({ url, note: "File disimpan lokal (Convex storage gagal)." });
      } catch (localErr: any) {
        res.status(500).json({ message: localErr?.message || "Upload failed" });
      }
    }
  });

  // ── PDF Proxy (bypass Cloudinary access restriction) ─────────────────────

  app.get("/api/pdf-proxy", async (req: Request, res: Response) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ message: "Missing url parameter" });

    try {
      const response = await fetch(url);
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
      const { nomor, perihal, pengirimTujuan, tanggal, jenis, pdfUrl, tanggalSurat } = req.body;
      const status = jenis === "Keluar" ? "Terkirim" : "Terarsip";
      const args: Record<string, unknown> = { nomor, perihal, pengirimTujuan, tanggal, jenis, status };
      if (pdfUrl && typeof pdfUrl === "string" && pdfUrl.trim()) {
        args.pdfUrl = pdfUrl.trim();
      }
      if (tanggalSurat && typeof tanggalSurat === "string" && tanggalSurat.trim()) {
        args.tanggalSurat = tanggalSurat.trim();
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

  return httpServer;
}
