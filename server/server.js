// server/server.js
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import usersRouter from "./routes/users.js";
// import lgaRouter from "./routes/lgaRoutes.js";
// import historicalRoutes from "./localis_data/routes/historical/index.js";
// import lengthRoutes from "./localis_data/routes/length/index.js";
// import spendRoutes from "./localis_data/routes/spend/index.js";
// import usersRoutes from "./localis_data/routes/users.js";

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const usersRouter = require("./routes/users");
const lgaRouter = require("./routes/lgaRoutes");
const historicalRoutes = require("./routes/historical/index");
const lengthRoutes = require("./routes/length/index");
const spendRoutes = require("./routes/spend/index");


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


app.listen(PORT, () => {
  console.log(`🚀 Localis API listening on http://localhost:${PORT}`);
});

