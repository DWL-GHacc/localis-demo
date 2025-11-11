const express = require("express");
const router = express.Router();

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

module.exports = router;
