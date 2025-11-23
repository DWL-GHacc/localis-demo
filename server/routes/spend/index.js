const express = require("express");
const router = express.Router();


// Get all spend data
router.get("/", async (req, res, next) => {
  req.db
    .from("spend_data")
    .select(
      "id",
      "spend",
      "cards_seen",
      "no_txns",
      "spend_date",
      "region",
      "category"
    )
    .then((rows) => {
      res.json({ Error: false, Message: "success", Data: rows });
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "Error executing MySQL query" });
    });
});

// Get distinct LGA names from spend data
router.get("/distinct_lgas_spend", async (req, res, next) => {
    req.db
      .from("spend_data")
      .distinct("region")
      .orderBy("region")
      .then((rows) => {
        res.json({ Error: false, Message: "success", Data: rows });
      })
      .catch((err) => {
        console.log(err);
        res.json({ Error: true, Message: "Error executing MySQL query" });
      });
});


// Get data range for spend data
router.get("/data_range", async (req, res, next) => {
  req.db
    .from("spend_data")
    .min("spend_date as min_date")
    .max("spend_date as max_date")
    .then((rows) => {
      res.json({ Error: false, Message: "success", Data: rows });
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "Error executing MySQL query" });
    });
});

// Get distinct categories from spend data
router.get("/categories", async (req, res, next) => {
    req.db
      .from("spend_data")
      .distinct("category")
      .orderBy("category")
      .then((rows) => {
        res.json({ Error: false, Message: "success", Data: rows });
      })
      .catch((err) => {
        console.log(err);
        res.json({ Error: true, Message: "Error executing MySQL query" });
      });
});


// Get distinct regions from spend data
router.get("/regions", async (req, res, next) => {
    req.db
      .from("spend_data")
      .distinct("region")
      .orderBy("region")
      .then((rows) => {
        res.json({ Error: false, Message: "success", Data: rows });
      })
      .catch((err) => {
        console.log(err);
        res.json({ Error: true, Message: "Error executing MySQL query" });
      });
});

// Get spend by category
router.get("/spend_by_category", async (req, res, next) => {
    req.db
      .from("spend_data")
      .select(
        "category",
        req.db.raw("SUM(spend) AS total_spend"),
        req.db.raw("SUM(no_txns) AS total_transactions"),
        req.db.raw("SUM(cards_seen) AS total_cards_seen")
      )
      .groupBy("category")
      .orderBy("total_spend", "desc")
      .then((rows) => {
        res.json({ Error: false, Message: "success", Data: rows });
      })
      .catch((err) => {
        console.log(err);
        res.json({ Error: true, Message: "Error executing MySQL query" });
      });
});


// Get spend intensity per region
router.get("/spend_intensity", async (req, res, next) => {
    req.db
      .from("spend_data")
      .select(
        "region",
        req.db.raw("YEAR(spend_date) AS year"),
        req.db.raw("MONTH(spend_date) AS month"),
        req.db.raw("SUM(spend) As total_spend"),
        req.db.raw("SUM(cards_seen) AS total_cards_seen"),
        req.db.raw("SUM(no_txns) AS total_transactions"),
        req.db.raw("SUM(spend) / NULLIF(SUM(cards_seen), 0) AS spend_per_card_seen")
      )
      .groupBy(
        "region",
        req.db.raw("YEAR(spend_date)"),
        req.db.raw("MONTH(spend_date)")
      )
      .orderBy(
        "region",
        "year",
        "month"
    )
      .then((rows) => {
        res.json({ Error: false, Message: "success", Data: rows });
      })
      .catch((err) => {
        console.log(err);
        res.json({ Error: true, Message: "Error executing MySQL query" });
      });
});


// Get spend by region
router.get("/spend_by_region", async (req, res, next) => {
    req.db 
      .from("spend_data")
      .select(
        "region",
        req.db.raw("SUM(spend) AS total_spend"),
        req.db.raw("SUM(no_txns) AS total_transactions"),
        req.db.raw("SUM(cards_seen) / NULLIF(SUM(no_txns), 0) AS avg_cards_per_transaction")
      )
      .groupBy("region")
      .orderBy("total_spend", "desc")
      .then((rows) => {
        res.json({ Error: false, Message: "success", Data: rows });
      })
      .catch((err) => {
        console.log(err);
        res.json({ Error: true, Message: "Error executing MySQL query" });
      });
});


// Get spend by category per region
router.get("/category_spend_per_region", async (req, res, next) => {
    const region = req.query.region;
    console.log(`Region: ${region}`);

    // const region = "Gold Coast"; // for testing
    // frontend request URL example:
    // http://localhost:3000/spend_data/category_spend_per_region?region=Gold%20Coast

    if (!region) {
      return res.status(400).json({ Error: true, Message: "Missing region parameter" });
    }

    req.db
      .from("spend_data")
      .select(
        "region",
        "category",
        req.db.raw("SUM(spend) AS total_spend"),
        req.db.raw("SUM(no_txns) AS total_transactions"),
        req.db.raw("SUM(cards_seen) AS total_cards_seen")
      )
      .where("region", region)
      .groupBy("region", "category")
      .orderBy("region", "category")
      .then((rows) => {
        res.json({ Error: false, Message: "success", Data: rows });
      })
      .catch((err) => {
        console.log(err);
        res.json({ Error: true, Message: "Error executing MySQL query" });
      });
});


// Get monthly spend per region
router.get("/monthly_spend_per_region", async (req, res, next) => {
    req.db
      .from("spend_data")
      .select(
        "region",
        req.db.raw("YEAR(spend_date) AS year"),
        req.db.raw("MONTH(spend_date) AS month"),
        req.db.raw("SUM(spend) AS total_spend"),
        req.db.raw("SUM(no_txns) AS total_transactions"),
        req.db.raw("SUM(cards_seen) AS total_cards_seen")
      )
      .groupBy(
        "region",
        req.db.raw("YEAR(spend_date)"),
        req.db.raw("MONTH(spend_date)")
      )
      .orderBy(["region", "year", "month"])
      .then((rows) => {
        res.json({ Error: false, Message: "success", Data: rows });
      })
      .catch((err) => {
        console.log(err);
        res.json({ Error: true, Message: "Error executing MySQL query" });
      });
});


module.exports = router;
