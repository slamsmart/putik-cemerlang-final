import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { getOpenGraphTags } from "./meta";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (req, res) => {
    try {
      const htmlPath = path.resolve(distPath, "index.html");
      let template = fs.readFileSync(htmlPath, "utf-8");
      const host = req.get("host") || "";
      const metaTags = getOpenGraphTags(req.originalUrl, host);
      template = template.replace("</head>", `${metaTags}\n  </head>`);
      res.status(200).set({ "Content-Type": "text/html" }).send(template);
    } catch (e) {
      res.status(500).send("Error reading index.html");
    }
  });
}
