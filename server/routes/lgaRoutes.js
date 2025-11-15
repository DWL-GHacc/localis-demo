// server/routes/lgaRoutes.js
import express from "express";
import {
  getRecentSpend,
  getSpendByRegionAndDate,
  getSpendSummaryByRegion,
  getHistoricalByLGA,
  getLengthDataByLGA,
} from "../queries/localisQueries.js";

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

// GET /api/spend/region/:region?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get("/spend/region/:region", async (req, res) => {
  try {
    const { region } = req.params;
    const { start, end } = req.query; // optional
    const rows = await getSpendByRegionAndDate(region, start || null, end || null);
    res.json(rows);
  } catch (err) {
    console.error("Error in /spend/region:", err);
    res.status(500).json({ error: "Failed to fetch spend by region" });
  }
});

// GET /api/spend/summary/region
router.get("/spend/summary/region", async (req, res) => {
  try {
    const rows = await getSpendSummaryByRegion();
    res.json(rows);
  } catch (err) {
    console.error("Error in /spend/summary/region:", err);
    res.status(500).json({ error: "Failed to fetch spend summary" });
  }
});

// GET /api/historical/lga/:lgaName
router.get("/historical/lga/:lgaName", async (req, res) => {
  try {
    const { lgaName } = req.params;
    const rows = await getHistoricalByLGA(lgaName);
    res.json(rows);
  } catch (err) {
    console.error("Error in /historical/lga:", err);
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
});

// GET /api/length/lga/:lgaName
router.get("/length/lga/:lgaName", async (req, res) => {
  try {
    const { lgaName } = req.params;
    const rows = await getLengthDataByLGA(lgaName);
    res.json(rows);
  } catch (err) {
    console.error("Error in /length/lga:", err);
    res.status(500).json({ error: "Failed to fetch length-of-stay data" });
  }
});

export default router;
