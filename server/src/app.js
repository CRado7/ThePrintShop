import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

import { catalogRoutes } from "./routes/catalogRoutes.js";
import quoteShareRoutes from "./routes/quoteShareRoutes.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origin.startsWith("http://localhost:")) return cb(null, true);
    if (origin === process.env.CLIENT_ORIGIN) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  }}));

  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  // --- API Routes ---
  app.get("/api/health", (req, res) => res.json({ ok: true }));
  app.use("/api/catalog", catalogRoutes);
  app.use("/api", quoteShareRoutes);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distPath = path.resolve(__dirname, "../../client/dist");

  // Serve JS/CSS assets under /assets
  app.use("/assets", express.static(path.join(distPath, "assets")));

  // Serve index.html at root
  app.get("/", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  // SPA fallback for non-API routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err?.message || "Server error" });
  });

  return app;
};