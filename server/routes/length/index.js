const express = require("express");
const router = express.Router();

// Get all length data
router.get("/", async (req, res, next) => {
  req.db
    .from("length_data")
    .select(
      "id",
      "date_length",
      "lga_name",
      "average_length_of_stay",
      "average_booking_window"
    )
    .then((rows) => {
      res.json({ Error: false, Message: "success", Data: rows });
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "Error executing MySQL query" });
    });
});

// Get distinct LGA names from length data
router.get("/distinct_lgas_length", async (req, res, next) => {
    req.db
        .from("length_data")
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

// Get data range for length data
router.get("/data_range", async (req, res, next) => {
  req.db
    .from("length_data")
    .min("date_length as min_date")
    .max("date_length as max_date")
    .then((rows) => {
      res.json({ Error: false, Message: "success", Data: rows });
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "Error executing MySQL query" });
    });
});

// Get average LOS and BW per LGA
// LOS = Length of Stay, BW = Booking Window
router.get("/ave_LOS_BW_LGA", async (req, res, next) => {
    req.db
      .from("length_data")
      .select(
        "lga_name",
        req.db.raw("AVG(average_length_of_stay) AS avg_length_of_stay"),
        req.db.raw("AVG(average_booking_window) AS avg_booking_window")
      )
      .groupBy("lga_name")
      .orderBy("lga_name")
      .then((rows) => {
        res.json({ Error: false, Message: "success", Data: rows });
      })
      .catch((err) => {
        console.log(err);
        res.json({ Error: true, Message: "Error executing MySQL query" });
      });
});

// Get average LOS for a given period
router.get("/ave_LOS_period", async (req, res, next) => {
    const start = req.query.start;
    const end = req.query.end;
    console.log(`Start: ${start}, End: ${end}`);

    // frontend request URL example:
    // https://localis-demo.onrender.com/length_data/ave_LOS_period?start=2023-01-01&end=2023-12-31

    // for testing
    // const start = "2023-01-01";
    // const end = "2023-12-31";

    // check for missing parameters
    if(!start || !end) {
        return res.status(400).json({ Error: true, Message: "Missing start or end date" });
    };

    req.db
      .from("length_data")
      .select(
        "lga_name",
        req.db.raw("AVG(average_length_of_stay) AS avg_length_of_stay")
      )
      .whereBetween("date_length", [start, end])
      .groupBy("lga_name")
      .orderBy("avg_length_of_stay", "desc")
      .then((rows) => {
        res.json({ Error: false, Message: "success", Data: rows });
      })
      .catch((err) => {
        console.log(err);
        res.json({ Error: true, Message: "Error executing MySQL query" });
      });
});

// Get average LOS and BW by LGA over time
router.get("/ave_LOS_by_LGA", async (req, res, next) => {
    const lga = req.query.lga_name;
    console.log(`LGA: ${lga}`);

    // frontend request URL example:
    // https://localis-demo.onrender.com/length_data/ave_LOS_by_LGA?lga_name=Gold%20Coast;

    // const lga = "Gold Coast"; // for testing

    if(!lga) {
        return res.status(400).json({ Error: true, Message: "Missing lga_name parameter" });
    };

    req.db
      .from("length_data")
      .select(
        req.db.raw("YEAR(date_length) AS year"),
        req.db.raw("MONTH(date_length) AS month"),
        req.db.raw("AVG(average_length_of_stay) AS avg_length_of_stay"),
        req.db.raw("AVG(average_booking_window) AS avg_booking_window")
      )
      .where("lga_name", lga)
      .groupByRaw("YEAR(date_length), MONTH(date_length)")
      .orderBy(["year", "month"])
      .then((rows) => {
        res.json({ Error: false, Message: "success", Data: rows });
      })
      .catch((err) => {
        console.log(err);
        res.json({ Error: true, Message: "Error executing MySQL query" });
      });
});


// Get average rates, historical occupancy, length of stay, and booking window
router.get("/ave_rates_histOcc_LOS", async (req, res) => {
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
        req.db.raw("AVG(h.average_daily_rate) AS avg_adr"),
        req.db.raw("AVG(l.average_length_of_stay) AS avg_length_of_stay"),
        req.db.raw("AVG(l.average_booking_window) AS avg_booking_window")
      )
      .groupBy("h.lga_name")
      .groupByRaw("YEAR(h.hist_date), MONTH(h.hist_date)")
      .orderBy([
        { column: "h.lga_name", order: "asc" },
        { column: "year", order: "asc" },
        { column: "month", order: "asc" },
      ]);

    res.json({ Error: false, Message: "success", Data: rows });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ Error: true, Message: "Error executing MySQL query" });
  }
});


// Get monthly LOS and BW per LGA
router.get("/monthly_LOS_BW_LGA", async (req, res, next) => {
    req.db
      .from("length_data")
      .select(
        "lga_name",
        req.db.raw("YEAR(date_length) AS year"),
        req.db.raw("MONTH(date_length) AS month"),
        req.db.raw("AVG(average_length_of_stay) AS avg_length_of_stay"),
        req.db.raw("AVG(average_booking_window) AS avg_booking_window")
      )
      .groupBy("lga_name")
      .groupByRaw("YEAR(date_length), MONTH(date_length)")
      .orderBy(["lga_name", { column: "year" }, { column: "month" }])
      .then((rows) => {
        res.json({ Error: false, Message: "success", Data: rows });
      })
      .catch((err) => {
        console.log(err);
        res.json({ Error: true, Message: "Error executing MySQL query" });
      });
});

module.exports = router;