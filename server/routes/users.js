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

    // INSERT user including full_name
    const [insertId] = await knex("users").insert({
      email,
      password_hash,
      full_name: full_name || null,  // 👈 ensure it's using correct DB field
      role: "user",
      is_active: 0
    });

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
// RENEW TOKEN (sliding session)
// POST /api/users/renew
// Requires valid existing token in Authorization header
// ------------------------------------------------------------
router.post(
  "/renew",
  authenticateToken,   // existing middleware, ensures token is valid & not expired
  async (req, res) => {
    try {
      const userId = req.user.sub;

      // Optional: re-check user in DB so deactivated/deleted users can't renew
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

      if (!user.is_active) {
        return res.status(403).json({
          error: true,
          message: "Account is inactive; token cannot be renewed"
        });
      }

      // Issue a fresh token with a new expiry
      const newToken = generateToken(user);

      return res.json({
        error: false,
        message: "Token renewed successfully",
        token: newToken,
        user // handy if frontend wants refreshed user info
      });
    } catch (err) {
      console.error("Error renewing token:", err);
      return res.status(500).json({
        error: true,
        message: "Error renewing token"
      });
    }
  }
);

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

// ------------------------------------------------------------
// ADMIN: CHANGE USER ROLE
// PATCH /api/users/:id/role
// Body: { "role": "admin" | "user" }
// ------------------------------------------------------------
router.patch(
  "/:id/role",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        error: true,
        message: "Invalid user ID"
      });
    }

    // Basic validation of allowed roles
    const allowedRoles = ["user", "admin"];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        error: true,
        message: `Invalid role. Allowed roles: ${allowedRoles.join(", ")}`
      });
    }

    // test to prevent admins changing their own role, if you want
     if (req.user.sub === userId) {
       return res.status(400).json({
         error: true,
         message: "Admins cannot change their own role"
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
        .update({ role });

      const updated = await knex("users")
        .select("id", "email", "full_name", "role", "is_active")
        .where({ id: userId })
        .first();

      return res.json({
        error: false,
        message: `User role updated to '${role}' successfully`,
        user: updated
      });
    } catch (err) {
      console.error("Error updating user role:", err);
      return res.status(500).json({
        error: true,
        message: "Database error while updating user role"
      });
    }
  }
);

// ------------------------------------------------------------
// ADMIN: DELETE USER
// DELETE /api/users/:id
// ------------------------------------------------------------
router.delete(
  "/:id",
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

      // Prevent admin from deleting themselves
       if (req.user.sub === userId) {
         return res.status(400).json({
           error: true,
           message: "Admins cannot delete their own account"
         });
       }

      await knex("users")
        .where({ id: userId })
        .del();

      return res.json({
        error: false,
        message: "User deleted successfully",
        deletedUser: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({
        error: true,
        message: "Database error during user deletion"
      });
    }
  }
);

// ------------------------------------------------------------
// ADMIN: LIST ACTIVE USERS
// GET /api/users/active
// ------------------------------------------------------------
router.get(
  "/active",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const activeUsers = await knex("users")
        .select("id", "email", "full_name", "role", "is_active")
        .where({ is_active: 1 })
        .orderBy("id", "asc");

      return res.json({
        error: false,
        count: activeUsers.length,
        users: activeUsers
      });
    } catch (err) {
      console.error("Error fetching active users:", err);
      return res.status(500).json({
        error: true,
        message: "Database error while fetching active users"
      });
    }
  }
);

module.exports = router;
