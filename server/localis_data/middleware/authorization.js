const jwt = require("jsonwebtoken");

// header method for JWT authentication get token from Authorization header
module.exports = function (req, res, next) {
  if (
    !("authorization" in req.headers) ||
    !req.headers.authorization.match(/^Bearer /)
  ) {
    res
      .status(401)
      .json({
        error: true,
        message: "Authorization header ('Bearer token') not found",
      });
    return;
  }
  const token = req.headers.authorization.replace(/^Bearer /, "");
  try {
    jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      res.status(401).json({ error: true, message: "JWT token has expired" });
    } else {
      res.status(401).json({ error: true, message: "Invalid JWT token" });
    }
    return;
  }

  next();
};



// cookie method for JWT authentication get token from cookies
module.exports = function (req, res, next) {
  // Get the JWT token from cookies
  if (!req.cookies || !req.cookies.token) {
    return res.status(401).json({
      error: true,
      message: "JWT token not found in cookies",
    });
  }
  const token = req.cookies.token;

  console.log("Received token from cookie:", token);

  if (!token) {
    return res.status(401).json({
      error: true,
      message: "JWT token not found in cookies",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user info to the request object
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      res.status(401).json({ error: true, message: "JWT token has expired" });
    } else {
      res.status(401).json({ error: true, message: "Invalid JWT token" });
    }
  }
};
