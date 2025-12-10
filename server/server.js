// server/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const usersRouter = require("./routes/users");
const lgaRouter = require("./routes/lgaRoutes");
const historicalRoutes = require("./routes/historical/index");
const lengthRoutes = require("./routes/length/index");
const spendRoutes = require("./routes/spend/index");
const snapshotRoutes = require("./routes/snapshot");



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const knex = require("./db");

app.use((req, res, next) => {
  req.db = knex;
  next();
});

app.use(cors());
app.use(express.json());

// user routes
app.use("/api/users", usersRouter);


// Root test
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Localis API running" });
});

const feedbackRoutes = require("./routes/feedback");
app.use("/api/feedback", feedbackRoutes);


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
app.use("/api/snapshot", snapshotRoutes);

app.listen(PORT, () => {
  console.log(`Localis API listening on http://localis-api.onrender.com:${PORT}`);
});

