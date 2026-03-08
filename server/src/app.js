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

  // --- CORS Setup ---
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (origin.startsWith("http://localhost:")) return cb(null, true);
        if (origin === process.env.CLIENT_ORIGIN) return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
      },
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  // --- API Routes ---
  app.get("/api/health", (req, res) => res.json({ ok: true }));
  app.use("/api/catalog", catalogRoutes);
  app.use("/api", quoteShareRoutes);

  // --- React Build Serving (Production Safe) ---
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Adjust this relative path depending on your repo structure
  const distPath = path.resolve(__dirname, "../../client/dist");

  // Serve static files (JS, CSS, assets)
  app.use(express.static(distPath));

  // Fallback to index.html for all non-API routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });

  // --- Error Handler ---
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err?.message || "Server error" });
  });

  return app;
}