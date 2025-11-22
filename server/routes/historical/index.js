const express = require("express");
const router = express.Router();


// Get all historical data
router.get("/", async (req, res, next) => {
  req.db
    .from("historical")
    .select(
      "id",
      "hist_date",
      "lga_name",
      "average_historical_occupancy",
      "average_daily_rate"
    )
    .then((rows) => {
      res.json({ Error: false, Message: "success", Data: rows });
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "Error executing MySQL query" });
    });
});

// Get data range for historical data
router.get("/data_range", async (req, res, next)=> {
    req.db
      .from("historical")
      .min("hist_date as min_date")
      .max("hist_date as max_date")
      .then((rows) => {
        res.json({ Error: false, Message: "success", Data: rows });
      })
      .catch((err) => {
        console.log(err);
        res.json({ Error: true, Message: "Error executing MySQL query" });
      });
});

// Get average rates joined with length of stay and booking window
router.get("/average_rates", async (req, res, next) => {
  try {
    const rows = await req
      .db("historical as h")
      .join("length_data as l", function () {
        this.on("h.lga_name", "=", "l.lga_name").andOn(
          "h.hist_date",
          "=",
          "l.date_length"
        );
      })
      .select(
        "h.lga_name",
        req.db.raw("YEAR(h.hist_date) AS year"),
        req.db.raw("MONTH(h.hist_date) AS month"),
        req.db.raw("AVG(h.average_historical_occupancy) AS avg_occupancy"),
        req.db.raw("AVG(h.average_daily_rate) AS avg_daily_rate"),
        req.db.raw("AVG(l.average_length_of_stay) AS avg_length_of_stay"),
        req.db.raw("AVG(l.average_booking_window) AS avg_booking_window")
      )
      .groupBy("h.lga_name")
      .groupByRaw("YEAR(h.hist_date), MONTH(h.hist_date)")
      .orderBy(["h.lga_name", { column: "year" }, { column: "month" }]);

    res.json({ Error: false, Message: "success", Data: rows });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ Error: true, Message: "Error executing MySQL query" });
  }
});

// Get distinct LGA names from historical data
router.get("/distinct_lgas_historical", async (req, res, next) => {
  req.db
    .from("historical")
    .distinct("lga_name")
    .orderBy("lga_name")
    .then((rows) => {
      res.json({ Error: false, Message: "success", Data: rows });
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "Error executing MySQL query" });
    });
});

// Get monthly occupancy and ADR per LGA
router.get("/monthly_occupancy_ADR_per_LGA", async (req, res, next) => {
    req.db
    .from("historical")
    .select(
      "lga_name",
      req.db.raw("YEAR(hist_date) AS year"),
      req.db.raw("MONTH(hist_date) AS month"),
      req.db.raw("AVG(average_historical_occupancy) AS avg_occupancy"),
      req.db.raw("AVG(average_daily_rate) AS avg_adr")
    )
    .groupBy(
      "lga_name",
      req.db.raw("YEAR(hist_date)"),
      req.db.raw("MONTH(hist_date)")
    )
    .orderBy(["lga_name", "year", "month"])
    .then((rows) => {   
      res.json({ Error: false, Message: "success", Data: rows });
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "Error executing MySQL query" });
    });
});

// Get historical occupancy and length of stay for a single LGA
router.get("/single_LGA_histOcc_LOS", async (req, res, next) => {
  const  {lga_name}  = req.query;
  console.log("LGA selected", lga_name);

// const lga = "Gold Coast";  // For testing purpose
// frontend request URL example:
// http://localhost:3000/historical/single_LGA_histOcc_LOS?lga_name=Gold%20Coast

  if(!lga_name){
    return res.status(400).json({ Error: true, Message: "Missing lga_name" });
  }

  req.db
    .from("historical as h")
    .join("length_data as l", function () {
      this.on("h.lga_name", "=", "l.lga_name").andOn(
        "h.hist_date",
        "=",
        "l.date_length"
      );
    })
    .select(
      "h.lga_name",
      req.db.raw("YEAR(h.hist_date) AS year"),
      req.db.raw("MONTH(h.hist_date) AS month"),
      req.db.raw("AVG(h.average_historical_occupancy) AS avg_occupancy"),
      req.db.raw("AVG(h.average_daily_rate) AS avg_adr"),
      req.db.raw("AVG(l.average_length_of_stay) AS avg_length_of_stay"),
      req.db.raw("AVG(l.average_booking_window) AS avg_booking_window")
    )
    .where("h.lga_name", lga_name)
    .groupBy("h.lga_name")
    .groupByRaw("YEAR(h.hist_date), MONTH(h.hist_date)")
    .orderBy(["year", "month"])
    .then((rows) => {
      res.json({ Error: false, Message: "success", Data: rows });
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "Error executing MySQL query" });
    });
});


module.exports = router;
