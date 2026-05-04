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

  // ── PDF/Scan Upload (Cloudinary, raw resource type) ───────────────────────

  app.post("/api/upload-pdf", uploadPdf.single("file"), async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const cloudinaryConfigured =
      (process.env.CLOUDINARY_CLOUD_NAME || "").trim() &&
      (process.env.CLOUDINARY_API_KEY || "").trim() &&
      (process.env.CLOUDINARY_API_SECRET || "").trim();

    if (!cloudinaryConfigured) {
      return res.json({
        url: `https://placehold.co/800x1100/001e40/ffffff?text=PDF+${encodeURIComponent(req.file.originalname)}`,
        note: "Cloudinary credentials not configured.",
      });
    }

    try {
      const { uploadPdfToCloudinary } = await import("./cloudinary");
      const isPdf = req.file.mimetype === "application/pdf";
      const url = await uploadPdfToCloudinary(req.file.buffer, isPdf);
      res.json({ url });
    } catch (e: any) {
      console.warn("Cloudinary PDF upload failed, falling back to local storage:", e?.message);
      try {
        const url = saveLocal(req.file.buffer, req.file.originalname);
        res.json({ url, note: "File disimpan lokal (Cloudinary tidak tersedia)." });
      } catch (localErr: any) {
        res.status(500).json({ message: localErr?.message || "Upload failed" });
      }
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
      const { nomor, perihal, pengirimTujuan, tanggal, jenis, status, pdfUrl } = req.body;
      const args: Record<string, unknown> = { nomor, perihal, pengirimTujuan, tanggal, jenis, status };
      if (pdfUrl && typeof pdfUrl === "string" && pdfUrl.trim()) {
        args.pdfUrl = pdfUrl.trim();
      }
      const data = await convexMutation("arsipSurat:create", args);
      res.status(201).json(data);
    } catch (e: any) {
      console.error("Convex create error:", e);
      res.status(500).json({ message: e?.message || "Failed to create" });
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

  return httpServer;
}
