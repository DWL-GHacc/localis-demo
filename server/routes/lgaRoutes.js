// server/routes/lgaRoutes.js
// import express from "express";
// import {
//   getRecentSpend,
//   getSpendByRegionAndDate,
//   getSpendSummaryByRegion,
//   getHistoricalByLGA,
//   getLengthDataByLGA,
// } from "../queries/localisQueries.js";

const express = require("express");
const {
  getRecentSpend,
  getSpendByRegionAndDate,
  getSpendSummaryByRegion,
  getHistoricalByLGA,
  getLengthDataByLGA,
} = require("../queries/localisQueries");

const router = express.Router();

// GET /api/spend/recent?limit=10
router.get("/spend/recent", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "10", 10);
    const rows = await getRecentSpend(limit);
    res.json(rows);
  } catch (err) {
    console.error("Error in /spend/recent:", err);
    res.status(500).json({ error: "Failed to fetch recent spend data" });
  }
});

// // GET /api/spend/region/:region?start=YYYY-MM-DD&end=YYYY-MM-DD
// router.get("/spend/region/:region", async (req, res) => {
//   try {
//     const { region } = req.params;
//     const { start, end } = req.query;
//     const rows = await getSpendByRegionAndDate(region, start, end);
//     res.json(rows);
//   } catch (err) {
//     console.error("Error in /spend/region/:region:", err);
//     res
//       .status(500)
//       .json({ error: "Failed to fetch regional spend data" });
//   }
// });

// // GET /api/spend/summary/region
// router.get("/spend/summary/region", async (req, res) => {
//   try {
//     const rows = await getSpendSummaryByRegion();
//     res.json(rows);
//   } catch (err) {
//     console.error("Error in /spend/summary/region:", err);
//     res
//       .status(500)
//       .json({ error: "Failed to fetch spend summary by region" });
//   }
// });

// // GET /api/historical/:lgaCode
// router.get("/historical/:lgaCode", async (req, res) => {
//   try {
//     const { lgaCode } = req.params;
//     const rows = await getHistoricalByLGA(lgaCode);
//     res.json(rows);
//   } catch (err) {
//     console.error("Error in /historical/:lgaCode:", err);
//     res
//       .status(500)
//       .json({ error: "Failed to fetch historical occupancy data" });
//   }
// });

// // GET /api/length-of-stay/:lgaCode
// router.get("/length-of-stay/:lgaCode", async (req, res) => {
//   try {
//     const { lgaCode } = req.params;
//     const rows = await getLengthDataByLGA(lgaCode);
//     res.json(rows);
//   } catch (err) {
//     console.error("Error in /length-of-stay/:lgaCode:", err);
//     res
//       .status(500)
//       .json({ error: "Failed to fetch length-of-stay data" });
//   }
// });



// 👈 THIS is what your server.js is trying to import
// export default router;
module.exports = router;
