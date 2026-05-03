import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertSliderSchema, updateSliderSchema } from "@shared/schema";

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
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

  // ── Image Upload ──────────────────────────────────────────────────────────

  app.post("/api/upload", upload.single("image"), async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const cloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (!cloudinaryConfigured) {
      // Cloudinary not yet configured – return a placeholder so the UI still works.
      return res.json({
        url: `https://placehold.co/1920x1080/001e40/ffffff?text=${encodeURIComponent(req.file.originalname)}`,
        note: "Cloudinary credentials not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.",
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

  return httpServer;
}
