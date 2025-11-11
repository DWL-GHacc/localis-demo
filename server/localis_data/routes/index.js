var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});


// middleware routes
router.use("/historical", require("./historical/index.js"));
router.use("/length_data", require("./length/index.js"));
router.use("/spend_data", require("./spend/index.js"));


module.exports = router;
