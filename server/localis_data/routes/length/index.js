const express = require("express");
const router = express.Router();

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

module.exports = router;
