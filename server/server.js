// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routes/users.js";
import lgaRouter from "./routes/lgaRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/users", usersRouter);
// Root test
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Localis API running" });
});

// API health test
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    route: "/api/health",
    server: "Localis API",
    port: PORT,
    time: new Date().toISOString(),
  });
});

// 🔗 Mount all LGA-related routes under /api
app.use("/api", lgaRouter);

app.listen(PORT, () => {
  console.log(`🚀 Localis API listening on http://localhost:${PORT}`);
});
