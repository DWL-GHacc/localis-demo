var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
// const authorization = require("../middleware/authorization");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login',  (req, res) => {
  const expires_in = 60*60*24; // 24 hours
  const exp = Math.floor(Date.now() / 1000) + expires_in;
  const token = jwt.sign({exp},
    process.env.JWT_SECRET_KEY
  );
  res.status(200).json({
    token,
    token_type: 'Bearer',
    expires_in
  });
})

// test
module.exports = router;
