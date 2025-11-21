// server/routes/users.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const knex = require("../db");
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment variables");
}

// Helper - ONLY used for login
function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

// ------------------------------------------------------------
// REGISTER - no token issued, user starts inactive
// ------------------------------------------------------------
router.post("/register", async (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Email and password are required"
    });
  }

  try {
    const existing = await knex("users").where({ email }).first();
    if (existing) {
      return res.status(409).json({
        error: true,
        message: "User with this email already exists"
      });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const [insertId] = await knex("users").insert(
      {
        email,
        password_hash,
        full_name: full_name || null,
        role: "user",
        is_active: 0
      }
    );

    return res.status(201).json({
      error: false,
      message:
        "Registration successful. An administrator must activate this account before login.",
      user: {
        id: insertId,
        email,
        full_name: full_name || null,
        role: "user",
        is_active: 0
      }
    });
  } catch (err) {
    console.error("Error during registration:", err);
    return res.status(500).json({
      error: true,
      message: "Database error during registration"
    });
  }
});

// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Email and password are required"
    });
  }

  try {
    const user = await knex("users")
      .select("id", "email", "password_hash", "full_name", "role", "is_active")
      .where({ email })
      .first();

    if (!user) {
      return res.status(401).json({
        error: true,
        message: "Incorrect email or password"
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: true,
        message: "Your account is not yet activated by an administrator"
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        error: true,
        message: "Incorrect email or password"
      });
    }

    const token = generateToken(user);

    delete user.password_hash;

    return res.status(200).json({
      error: false,
      message: "Login successful",
      token,
      user
    });
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({
      error: true,
      message: "Database error during login"
    });
  }
});

// ------------------------------------------------------------
// ADMIN: ACTIVATE USER
// PATCH /api/users/:id/activate
// ------------------------------------------------------------
router.patch("/:id/activate",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        error: true,
        message: "Invalid user ID"
      });
    }

    try {
      const user = await knex("users")
        .select("id", "email", "full_name", "role", "is_active")
        .where({ id: userId })
        .first();

      if (!user) {
        return res.status(404).json({
          error: true,
          message: "User not found"
        });
      }

      await knex("users")
        .where({ id: userId })
        .update({ is_active: 1 });

      const updated = await knex("users")
        .select("id", "email", "full_name", "role", "is_active")
        .where({ id: userId })
        .first();

      return res.json({
        error: false,
        message: "User activated successfully",
        user: updated
      });
    } catch (err) {
      console.error("Error activating user:", err);
      return res.status(500).json({
        error: true,
        message: "Database error during activation"
      });
    }
  }
);
// ------------------------------------------------------------
// ADMIN: DEACTIVATE USER
// PATCH /api/users/:id/deactivate
// ------------------------------------------------------------
router.patch(
  "/:id/deactivate",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        error: true,
        message: "Invalid user ID"
      });
    }

    try {
      const user = await knex("users")
        .select("id", "email", "full_name", "role", "is_active")
        .where({ id: userId })
        .first();

      if (!user) {
        return res.status(404).json({
          error: true,
          message: "User not found"
        });
      }

      await knex("users")
        .where({ id: userId })
        .update({ is_active: 0 });

      const updated = await knex("users")
        .select("id", "email", "full_name", "role", "is_active")
        .where({ id: userId })
        .first();

      return res.json({
        error: false,
        message: "User deactivated successfully",
        user: updated
      });
    } catch (err) {
      console.error("Error deactivating user:", err);
      return res.status(500).json({
        error: true,
        message: "Database error during deactivation"
      });
    }
  }
);
// ------------------------------------------------------------
// ADMIN: LIST INACTIVE USERS (Pending Approval)
// GET /api/users/pending
// ------------------------------------------------------------
router.get(
  "/pending",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const pendingUsers = await knex("users")
        .select("id", "email", "full_name", "role", "is_active")
        .where({ is_active: 0 })
        .orderBy("id", "asc");

      return res.json({
        error: false,
        count: pendingUsers.length,
        users: pendingUsers
      });
    } catch (err) {
      console.error("Error fetching pending users:", err);
      return res.status(500).json({
        error: true,
        message: "Database error while fetching pending users"
      });
    }
  }
);

module.exports = router;
