// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET is not set in the environment variables");
}

// -------------------------------
// Authenticate all logged-in users
// -------------------------------
function authenticateToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: true,
      message: "No token provided"
    });
  }

  const token = header.split(" ")[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({
      error: true,
      message: "Invalid or expired token"
    });
  }
}

// -------------------------------
// Admin-only access control
// -------------------------------
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      error: true,
      message: "Admin privileges required"
    });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin
};
