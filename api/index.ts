import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import express, { type Request, Response, NextFunction } from "express";
import multer from "multer";
import fs from "fs";
import { randomBytes } from "crypto";
import { generatePutikChatReply } from "./_lib/chatbot.js";

const app = express();

// Create uploads dir in /tmp for Vercel (only writable dir)
const uploadsDir = path.join("/tmp", "uploads");
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch { }
app.use("/uploads", express.static(uploadsDir));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Convex Client ─────────────────────────────────────────────────────────────
const CONVEX_URL = (process.env.CONVEX_URL || "https://fabulous-lemur-912.convex.cloud").trim();

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
    body: JSON.stringify({ path: mutPath, format: "json", args }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    console.error(`[convexMutation] HTTP error for ${mutPath}:`, res.status, errText);
    throw new Error(`Convex mutation failed (${res.status}): ${errText}`);
  }
  const data = await res.json();
  if (data.status !== "success") {
    console.error(`[convexMutation] Convex error for ${mutPath}:`, data.errorMessage);
    throw new Error(data.errorMessage || "Convex error");
  }
  return data.value;
}

// ── Multer setup ──────────────────────────────────────────────────────────────
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Hanya file gambar atau PDF yang diizinkan"));
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

// ── Cloudinary helper ─────────────────────────────────────────────────────────
function isCloudinaryConfigured() {
  return (
    (process.env.CLOUDINARY_CLOUD_NAME || "").trim() &&
    (process.env.CLOUDINARY_API_KEY || "").trim() &&
    (process.env.CLOUDINARY_API_SECRET || "").trim()
  );
}

async function getCloudinary() {
  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
    api_key: (process.env.CLOUDINARY_API_KEY || "").trim(),
    api_secret: (process.env.CLOUDINARY_API_SECRET || "").trim(),
  });
  return cloudinary;
}

// ── Debug (hapus setelah env vars terkonfirmasi) ──────────────────────────────
app.get("/api/debug-env", (_req: Request, res: Response) => {
  res.json({
    cloudinary_name: !!process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_key: !!process.env.CLOUDINARY_API_KEY,
    cloudinary_secret: !!process.env.CLOUDINARY_API_SECRET,
    convex_url: !!process.env.CONVEX_URL,
    convex_url_value: CONVEX_URL,
    node_env: process.env.NODE_ENV,
  });
});

// ── Image Upload ──────────────────────────────────────────────────────────────
app.post("/api/upload", uploadImage.single("image"), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  if (isCloudinaryConfigured()) {
    try {
      const cloudinary = await getCloudinary();
      const isPdf = req.file!.mimetype === "application/pdf";
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          isPdf
            ? { folder: "putik-cemerlang/pengaduan", resource_type: "raw", type: "upload", access_mode: "public" }
            : { folder: "putik-cemerlang/pengaduan", format: "webp", quality: "auto" },
          (err, result) => (err ? reject(err) : resolve(result))
        ).end(req.file!.buffer);
      });
      return res.json({ url: result.secure_url });
    } catch (e: any) {
      console.warn("Cloudinary upload failed, falling back to local:", e?.message);
    }
  }

  try {
    const url = saveLocal(req.file.buffer, req.file.originalname);
    return res.json({ url, note: "Gambar disimpan lokal (Cloudinary tidak dikonfigurasi)." });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Upload failed" });
  }
});

// ── PDF Upload (Cloudinary object storage) ───────────────────────────────────
app.post("/api/upload-pdf", uploadPdf.single("file"), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  if (!isCloudinaryConfigured()) {
    return res.status(500).json({ message: "Cloudinary belum dikonfigurasi di Vercel." });
  }

  try {
    const cloudinary = await getCloudinary();
    const isPdf = req.file.mimetype === "application/pdf";
    const ext = isPdf ? "pdf" : (path.extname(req.file.originalname).replace(".", "") || "jpg");
    const publicId = `putik-cemerlang/arsip-surat/arsip_${Date.now()}.${ext}`;
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: isPdf ? "raw" : "image",
          type: "upload",
          public_id: publicId,
          access_mode: "public",
        },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(req.file!.buffer);
    });

    if (!result?.secure_url) {
      throw new Error("Cloudinary upload tidak mengembalikan URL.");
    }

    return res.json({
      url: result.secure_url,
      resourceType: result.resource_type,
    });
  } catch (e: any) {
    console.error("Cloudinary PDF upload error:", e?.message);
    if (process.env.NODE_ENV === "production") {
      return res.status(500).json({
        message: `Upload PDF ke Cloudinary gagal: ${e?.message || "Unknown error"}`,
      });
    }
    try {
      const url = saveLocal(req.file.buffer, req.file.originalname);
      return res.json({ url, note: "File disimpan lokal (Cloudinary gagal)." });
    } catch (localErr: any) {
      return res.status(500).json({ message: localErr?.message || "Upload failed" });
    }
  }
});

// ── PDF Proxy (serve Cloudinary files via server using API credentials) ─────────
app.get("/api/pdf-proxy", async (req: Request, res: Response) => {
  const url = req.query.url as string;
  if (!url) return res.status(400).json({ message: "Missing url parameter" });

  const isCloudinaryUrl = url.includes("cloudinary.com");
  const convexStorageMatch = url.match(/^(https:\/\/[^/]+\.convex\.cloud)\/api\/storage\/([^/?#]+)/i);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Determine correct MIME type from the URL extension (never trust upstream octet-stream)
  const urlExt = (url.split("?")[0].split(".").pop() || "pdf").toLowerCase();
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
  };
  const forcedMime = mimeMap[urlExt] || "application/pdf";
  const filename = url.split("/").pop()?.split("?")[0] || `document.${urlExt}`;

  // Helper: fetch URL, override content-type to correct MIME, send inline
  const tryFetchAndSend = async (fetchUrl: string): Promise<boolean> => {
    try {
      const r = await fetch(fetchUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; PutikProxy/1.0)" },
      });
      if (!r.ok) return false;
      // Force correct content-type — Cloudinary private_download_url returns octet-stream
      res.setHeader("Content-Type", forcedMime);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.send(Buffer.from(await r.arrayBuffer()));
      return true;
    } catch {
      return false;
    }
  };

  try {
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
        if (typeof resolvedUrl === "string" && resolvedUrl && await tryFetchAndSend(resolvedUrl)) return;
      }
    }

    // 1️⃣ Direct fetch (works if file is truly public)
    if (await tryFetchAndSend(url)) return;
    console.warn(`PDF proxy: direct fetch failed for ${url}`);

    if (isCloudinaryUrl && isCloudinaryConfigured()) {
      const cloudinary = await getCloudinary();

      // Extract public_id and extension from URL
      const match = url.match(/\/(?:raw|image|auto)\/upload\/(?:v\d+\/)?(.+)$/);
      if (match) {
        const fullPath = match[1]; // e.g. "putik-cemerlang/arsip-surat/arsip_123.pdf"
        const ext = fullPath.includes(".") ? (fullPath.split(".").pop() || "pdf") : "pdf";
        const publicIdWithExt = fullPath;
        const publicIdWithoutExt = fullPath.replace(/\.[^.]+$/, "");
        const urlResType = url.includes("/raw/upload/") ? "raw" : "image";
        const resTypes = urlResType === "raw"
          ? (["raw", "image"] as const)
          : (["image", "raw"] as const);
        const publicIdCandidates = Array.from(new Set([publicIdWithExt, publicIdWithoutExt]));

        // 2️⃣ private_download_url — uses API key+secret, bypasses delivery auth
        for (const rt of resTypes) {
          for (const publicId of publicIdCandidates) {
            for (const format of [ext, ""] as const) {
              try {
                const dlUrl = (cloudinary.utils as any).private_download_url(publicId, format, {
                  resource_type: rt,
                  expires_at: Math.floor(Date.now() / 1000) + 600,
                });
                if (await tryFetchAndSend(dlUrl)) return;
              } catch (e: any) {
                console.warn(`PDF proxy: private_download_url (${rt}, ${publicId}) error:`, e?.message);
              }
            }
          }
        }

        // 3️⃣ Signed delivery URL fallback
        for (const rt of resTypes) {
          for (const publicId of publicIdCandidates) {
            try {
              const signedUrl = cloudinary.url(publicId, {
                resource_type: rt,
                type: "upload",
                sign_url: true,
                secure: true,
              });
              if (await tryFetchAndSend(signedUrl)) return;
            } catch (e: any) {
              console.warn(`PDF proxy: signed URL (${rt}, ${publicId}) error:`, e?.message);
            }
          }
        }
      }
    }

    return res.status(404).json({
      message: "File PDF tidak dapat diakses dari Cloudinary. Aktifkan Cloudinary Settings > Security > Restricted media types > Allow delivery of PDF and ZIP files, lalu upload ulang PDF.",
    });
  } catch (e: any) {
    console.error("PDF proxy error:", e);
    return res.status(500).json({ message: e?.message || "Proxy error" });
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
    res.status(500).json({ message: e?.message || "Failed to create" });
  }
});

app.delete("/api/arsip-surat", async (_req: Request, res: Response) => {
  try {
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
    await convexMutation("arsipSurat:remove", { id: req.params.id });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to delete" });
  }
});

app.put("/api/arsip-surat/:id", async (req: Request, res: Response) => {
  try {
    const { nomor, perihal, pengirimTujuan, tanggal, jenis, pdfUrl, tanggalSurat, customFields, status } = req.body;
    const args: Record<string, unknown> = { id: req.params.id };
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

// ── Arsip Surat — Custom Columns ─────────────────────────────────────────────
app.get("/api/arsip-surat/custom-columns", async (_req: Request, res: Response) => {
  try {
    const data = await convexQuery("arsipCustomColumns:list");
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to fetch" });
  }
});

app.post("/api/arsip-surat/custom-columns", async (req: Request, res: Response) => {
  try {
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
    await convexMutation("arsipCustomColumns:remove", { id: req.params.id });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to delete" });
  }
});

app.patch("/api/arsip-surat/custom-columns/reorder", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids)) return res.status(400).json({ message: "ids harus array" });
    await convexMutation("arsipCustomColumns:reorder", { ids });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to reorder" });
  }
});

// ── Pengaduan Masyarakat (Convex proxy) ──────────────────────────────────────
app.get("/api/pengaduan-masyarakat", async (_req: Request, res: Response) => {
  try {
    const data = await convexQuery("pengaduanMasyarakat:list");
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to fetch" });
  }
});

app.post("/api/pengaduan-masyarakat", async (req: Request, res: Response) => {
  try {
    const { nama, email, telepon, judul, isi, lokasi, imageUrl, status } = req.body;
    const args: Record<string, unknown> = {
      nama: nama || "",
      email: email || "",
      telepon: telepon || "",
      judul: judul || "",
      isi: isi || "",
      status: status || "Baru",
    };
    if (lokasi && typeof lokasi === "string" && lokasi.trim()) args.lokasi = lokasi.trim();
    if (imageUrl && typeof imageUrl === "string" && imageUrl.trim()) args.imageUrl = imageUrl.trim();
    console.log("[pengaduan-masyarakat] creating with args:", JSON.stringify(args));
    const data = await convexMutation("pengaduanMasyarakat:create", args);
    res.status(201).json(data);
  } catch (e: any) {
    console.error("[pengaduan-masyarakat] error:", e?.message);
    res.status(500).json({ message: e?.message || "Failed to create" });
  }
});

app.patch("/api/pengaduan-masyarakat/:id/status", async (req: Request, res: Response) => {
  try {
    await convexMutation("pengaduanMasyarakat:updateStatus", { id: req.params.id, status: req.body.status });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to update" });
  }
});

app.delete("/api/pengaduan-masyarakat/:id", async (req: Request, res: Response) => {
  try {
    await convexMutation("pengaduanMasyarakat:remove", { id: req.params.id });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to delete" });
  }
});

// ── Whistle Blowing (Convex proxy) ────────────────────────────────────────────
app.get("/api/whistle-blowing", async (_req: Request, res: Response) => {
  try {
    const data = await convexQuery("whistleBlowing:list");
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to fetch" });
  }
});

app.post("/api/whistle-blowing", async (req: Request, res: Response) => {
  try {
    const { nama, email, telepon, judul, isi, imageUrl, isAnonymous, status } = req.body;
    const args: Record<string, unknown> = {
      nama: nama || "",
      email: email || "",
      telepon: telepon || "",
      judul: judul || "",
      isi: isi || "",
      isAnonymous: !!isAnonymous,
      status: status || "Baru",
    };
    if (imageUrl && typeof imageUrl === "string" && imageUrl.trim()) args.imageUrl = imageUrl.trim();
    console.log("[whistle-blowing] creating with args:", JSON.stringify(args));
    const data = await convexMutation("whistleBlowing:create", args);
    res.status(201).json(data);
  } catch (e: any) {
    console.error("[whistle-blowing] error:", e?.message);
    res.status(500).json({ message: e?.message || "Failed to create" });
  }
});

app.patch("/api/whistle-blowing/:id/status", async (req: Request, res: Response) => {
  try {
    await convexMutation("whistleBlowing:updateStatus", { id: req.params.id, status: req.body.status });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to update" });
  }
});

app.delete("/api/whistle-blowing/:id", async (req: Request, res: Response) => {
  try {
    await convexMutation("whistleBlowing:remove", { id: req.params.id });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to delete" });
  }
});

// ── Pelaporan Gratifikasi (Convex proxy) ─────────────────────────────────────
app.get("/api/pelaporan-gratifikasi", async (_req: Request, res: Response) => {
  try {
    const data = await convexQuery("gratifikasi:list");
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to fetch" });
  }
});

app.post("/api/pelaporan-gratifikasi", async (req: Request, res: Response) => {
  try {
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
    await convexMutation("gratifikasi:updateStatus", { id: req.params.id, status: req.body.status });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to update" });
  }
});

app.delete("/api/pelaporan-gratifikasi/:id", async (req: Request, res: Response) => {
  try {
    await convexMutation("gratifikasi:remove", { id: req.params.id });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to delete" });
  }
});

// ── NVIDIA Chatbot ────────────────────────────────────────────────────────────
app.post("/api/chatbot", async (req: Request, res: Response) => {
  try {
    const { message } = req.body as { message?: string };
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Pesan kosong" });
    }

    const reply = await generatePutikChatReply(message.trim());
    res.json(reply);
  } catch (e: any) {
    console.error("[chatbot] error:", e?.message);
    res.status(500).json({ message: e?.message || "Chatbot gagal merespons" });
  }
});

// ── SPA Catch-all for Meta Tags ───────────────────────────────────────────────
function getOpenGraphTags(rawPath: string, host: string = "") {
  const pathStr = rawPath.split('?')[0];
  const baseUrl = host.includes("localhost") ? `http://${host}` : `https://${host}`;
  let title = "Putik Cemerlang";
  let description = "Portal Layanan Resmi Putik Cemerlang";
  let image = `${baseUrl}/logo.png`;

  const t = Date.now();
  if (pathStr === "/" || pathStr === "/index.html") {
    title = "Beranda | Putik Cemerlang";
    description = "Selamat datang di portal layanan resmi Putik Cemerlang.";
    image = `${baseUrl}/logo.png?v=${t}`;
  } else if (pathStr.includes("/buku-tamu")) {
    title = "Buku Tamu | Putik Cemerlang";
    description = "Silakan isi form buku tamu untuk mencatat kunjungan Anda.";
    image = `https://placehold.co/1200x630/0ea5e9/ffffff?text=Buku+Tamu&v=${t}`;
  } else if (pathStr.includes("/pengaduan-masyarakat")) {
    title = "Pengaduan Masyarakat | Putik Cemerlang";
    description = "Layanan pengaduan masyarakat. Sampaikan laporan Anda dengan aman.";
    image = `https://placehold.co/1200x630/eab308/ffffff?text=Pengaduan+Masyarakat&v=${t}`;
  } else if (pathStr.includes("/whistle-blowing")) {
    title = "Whistle Blowing System | Putik Cemerlang";
    description = "Layanan pelaporan pelanggaran yang aman dan rahasia.";
    image = `https://placehold.co/1200x630/ef4444/ffffff?text=Whistle+Blowing&v=${t}`;
  } else if (pathStr.includes("/pelaporan-gratifikasi")) {
    title = "Pelaporan Gratifikasi | Putik Cemerlang";
    description = "Layanan pelaporan penerimaan atau penolakan gratifikasi.";
    image = `https://placehold.co/1200x630/10b981/ffffff?text=Pelaporan+Gratifikasi&v=${t}`;
  } else if (pathStr.includes("/kontak")) {
    title = "Kontak Kami | Putik Cemerlang";
    description = "Informasi kontak, lokasi, dan jam layanan kami.";
    image = `https://placehold.co/1200x630/8b5cf6/ffffff?text=Kontak+Kami&v=${t}`;
  } else if (pathStr.includes("/profile")) {
    title = "Profil Instansi | Putik Cemerlang";
    description = "Visi, misi, dan struktur organisasi kami.";
    image = `https://placehold.co/1200x630/3b82f6/ffffff?text=Profil+Instansi&v=${t}`;
  } else if (pathStr.includes("/voting-eom")) {
    title = "Voting Employee of the Month | Putik Cemerlang";
    description = "Berikan suara Anda untuk kandidat Employee of the Month.";
    image = `https://placehold.co/1200x630/f59e0b/ffffff?text=Voting+EOM&v=${t}`;
  } else if (pathStr.includes("/admin/login")) {
    title = "Login | Putik Cemerlang";
    description = "Silakan login untuk mengakses halaman admin.";
    image = `${baseUrl}/logo.png?v=${t}`;
  } else if (pathStr.includes("/admin")) {
    title = "Admin Dashboard | Putik Cemerlang";
    description = "Halaman khusus administrator.";
    image = `${baseUrl}/logo.png?v=${t}`;
  }

  return `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${baseUrl}${pathStr}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
  `;
}

app.get("/{*path}", (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith("/api")) return next();
  
  try {
    const htmlPath = path.resolve(process.cwd(), "dist/public/index.html");
    if (!fs.existsSync(htmlPath)) {
      return res.status(404).send("index.html not found. Make sure to build the project.");
    }
    let template = fs.readFileSync(htmlPath, "utf-8");
    const host = req.get("host") || "";
    const metaTags = getOpenGraphTags(req.originalUrl, host);
    template = template.replace("</head>", `${metaTags}\n  </head>`);
    res.status(200).set({ "Content-Type": "text/html" }).send(template);
  } catch (e) {
    next(e);
  }
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("Error:", err);
  if (!res.headersSent) res.status(status).json({ message });
});

// ── Vercel serverless handler ─────────────────────────────────────────────────
export default app;