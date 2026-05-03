import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertSliderSchema, updateSliderSchema } from "@shared/schema";

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

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
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
      const slider = await storage.updateSlider(req.params.id, parsed.data);
      if (!slider) return res.status(404).json({ message: "Slider not found" });
      res.json(slider);
    } catch (e) {
      res.status(500).json({ message: "Failed to update slider" });
    }
  });

  app.delete("/api/sliders/:id", async (req: Request, res: Response) => {
    try {
      const ok = await storage.deleteSlider(req.params.id);
      if (!ok) return res.status(404).json({ message: "Slider not found" });
      res.status(204).end();
    } catch (e) {
      res.status(500).json({ message: "Failed to delete slider" });
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
      return res.json({
        url: `https://placehold.co/1920x1080/001e40/ffffff?text=${encodeURIComponent(req.file.originalname)}`,
        note: "Cloudinary credentials not configured.",
      });
    }

    try {
      const { uploadToCloudinary } = await import("./cloudinary");
      const url = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      res.json({ url });
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Upload failed" });
    }
  });

  // ── PDF/Scan Upload (Cloudinary, raw resource type) ───────────────────────

  app.post("/api/upload-pdf", uploadPdf.single("file"), async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const cloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (!cloudinaryConfigured) {
      return res.json({
        url: `https://placehold.co/800x1100/001e40/ffffff?text=PDF+${encodeURIComponent(req.file.originalname)}`,
        note: "Cloudinary credentials not configured.",
      });
    }

    try {
      const { v2: cloudinary } = await import("cloudinary");
      const buffer = req.file.buffer;
      const isPdf = req.file.mimetype === "application/pdf";

      const url = await new Promise<string>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "putik-cemerlang/arsip-surat",
              public_id: `arsip_${Date.now()}`,
              resource_type: isPdf ? "raw" : "image",
              format: isPdf ? "pdf" : undefined,
            },
            (error, result) => {
              if (error || !result) return reject(error || new Error("Upload failed"));
              resolve(result.secure_url);
            }
          )
          .end(buffer);
      });

      res.json({ url });
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Upload failed" });
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
      const data = await convexMutation("arsipSurat:create", req.body);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to create" });
    }
  });

  app.delete("/api/arsip-surat/:id", async (req: Request, res: Response) => {
    try {
      const { convexMutation } = await import("./convexClient");
      await convexMutation("arsipSurat:remove", { id: req.params.id });
      res.status(204).end();
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to delete" });
    }
  });

  return httpServer;
}
