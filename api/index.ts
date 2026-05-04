import express, { type Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomBytes } from "crypto";

const app = express();

// Create uploads dir in /tmp for Vercel (only writable dir)
const uploadsDir = path.join("/tmp", "uploads");
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch {}
app.use("/uploads", express.static(uploadsDir));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Convex Client ─────────────────────────────────────────────────────────────
const CONVEX_URL = process.env.CONVEX_URL || "https://mellow-gerbil-927.convex.cloud";

async function convexQuery(queryPath: string, args: Record<string, unknown> = {}) {
  const res = await fetch(`${CONVEX_URL}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: queryPath, args }),
  });
  if (!res.ok) throw new Error(`Convex query failed: ${res.statusText}`);
  const data = await res.json();
  if (data.status !== "success") throw new Error(data.errorMessage || "Convex error");
  return data.value;
}

async function convexMutation(mutPath: string, args: Record<string, unknown> = {}) {
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: mutPath, args }),
  });
  if (!res.ok) throw new Error(`Convex mutation failed: ${res.statusText}`);
  const data = await res.json();
  if (data.status !== "success") throw new Error(data.errorMessage || "Convex error");
  return data.value;
}

// ── Multer setup ──────────────────────────────────────────────────────────────
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

function saveLocal(buffer: Buffer, originalName: string): string {
  const ext = path.extname(originalName) || ".bin";
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  fs.writeFileSync(path.join(uploadsDir, name), buffer);
  return `/uploads/${name}`;
}

// ── Image Upload ──────────────────────────────────────────────────────────────
app.post("/api/upload", uploadImage.single("image"), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const cloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (cloudinaryConfigured) {
    try {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "putik-cemerlang", resource_type: "image" },
          (err, result) => (err ? reject(err) : resolve(result))
        ).end(req.file!.buffer);
      });
      return res.json({ url: result.secure_url });
    } catch (e: any) {
      console.warn("Cloudinary failed, falling back to local:", e?.message);
    }
  }

  try {
    const url = saveLocal(req.file.buffer, req.file.originalname);
    return res.json({ url, note: "Gambar disimpan lokal (Cloudinary tidak dikonfigurasi)." });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Upload failed" });
  }
});

// ── PDF Upload ────────────────────────────────────────────────────────────────
app.post("/api/upload-pdf", uploadPdf.single("file"), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const cloudinaryConfigured =
    (process.env.CLOUDINARY_CLOUD_NAME || "").trim() &&
    (process.env.CLOUDINARY_API_KEY || "").trim() &&
    (process.env.CLOUDINARY_API_SECRET || "").trim();

  if (cloudinaryConfigured) {
    try {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      const isPdf = req.file.mimetype === "application/pdf";
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "putik-cemerlang-pdfs", resource_type: isPdf ? "raw" : "image" },
          (err, result) => (err ? reject(err) : resolve(result))
        ).end(req.file!.buffer);
      });
      return res.json({ url: result.secure_url });
    } catch (e: any) {
      console.warn("Cloudinary PDF upload failed, falling back:", e?.message);
    }
  }

  try {
    const url = saveLocal(req.file.buffer, req.file.originalname);
    return res.json({ url, note: "File disimpan lokal (Cloudinary tidak dikonfigurasi)." });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Upload failed" });
  }
});

// ── Arsip Surat (Convex proxy) ────────────────────────────────────────────────
app.get("/api/arsip-surat", async (_req: Request, res: Response) => {
  try {
    const data = await convexQuery("arsipSurat:list");
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to fetch" });
  }
});

app.post("/api/arsip-surat", async (req: Request, res: Response) => {
  try {
    const { nomor, perihal, pengirimTujuan, tanggal, jenis, status, pdfUrl } = req.body;
    const args: Record<string, unknown> = { nomor, perihal, pengirimTujuan, tanggal, jenis, status };
    if (pdfUrl && typeof pdfUrl === "string" && pdfUrl.trim()) {
      args.pdfUrl = pdfUrl.trim();
    }
    const data = await convexMutation("arsipSurat:create", args);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to create" });
  }
});

app.delete("/api/arsip-surat/:id", async (req: Request, res: Response) => {
  try {
    await convexMutation("arsipSurat:remove", { id: req.params.id });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to delete" });
  }
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("Error:", err);
  if (!res.headersSent) res.status(status).json({ message });
});

export default app;
