// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routes/users.js";
import lgaRouter from "./routes/lgaRoutes.js";
import historicalRoutes from "./localis_data/routes/historical/index.js";
import lengthRoutes from "./localis_data/routes/length/index.js";
import spendRoutes from "./localis_data/routes/spend/index.js";
import usersRoutes from "./localis_data/routes/users.js";


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
app.use("/api/historical", historicalRoutes);
app.use("/api/length_data", lengthRoutes);
app.use("/api/spend_data", spendRoutes);
app.use("/api/users", usersRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Localis API listening on http://localhost:${PORT}`);
});

