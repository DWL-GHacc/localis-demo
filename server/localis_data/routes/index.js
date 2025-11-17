var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});


// middleware routes
router.use("/api/historical", require("./historical/index.js"));
router.use("/api/length_data", require("./length/index.js"));
router.use("/api/spend_data", require("./spend/index.js"));
router.use("/api/users", require("./users.js"));


module.exports = router;
