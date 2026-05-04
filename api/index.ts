import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import path from "path";
import fs from "fs";

const app = express();

// Create uploads dir in /tmp for Vercel
const uploadsDir = path.join("/tmp", "uploads");
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch {}
app.use("/uploads", express.static(uploadsDir));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register all routes synchronously at module load time
// We use a "ready" promise to defer requests until routes are registered
let ready: Promise<void>;

ready = registerRoutes(null as any, app).then(() => {}).catch((err) => {
  console.error("Failed to register routes:", err);
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("Error:", err);
  if (!res.headersSent) {
    res.status(status).json({ message });
  }
});

// Wrap the handler so it waits for routes to be registered before processing
const handler = async (req: any, res: any) => {
  await ready;
  return app(req, res);
};

export default handler;
