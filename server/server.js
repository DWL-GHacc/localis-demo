// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import lgaRouter from "./routes/lgaRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());            // Allow client (React) to call this API
app.use(express.json());    // Parse JSON bodies

// Simple health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Localis API is running" });
});

// Mount routes
app.use("/api", lgaRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Localis API listening on http://localhost:${PORT}`);
});
