var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/api/historical", async (req, res, next) => {
  req.db
    .from("historical")
    .select("id", "hist_date","lga_name", "average_historical_occupancy", "average_daily_rate")
    .then((rows) => {
      res.json({ Error: false, Message: "success", Data: rows });
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "Error executing MySQL query" });
    });
});

router.get("/api/length_data", async (req, res, next) => {
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

router.get("/api/spend_data", async (req, res, next) => {
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

module.exports = router;
