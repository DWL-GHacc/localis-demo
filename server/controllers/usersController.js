// server/controllers/usersController.js
const bcrypt = require("bcrypt");
const knex = require("../db");
const { generateToken } = require("../utils/jwt");

const SALT_ROUNDS = 10;

// ------------------------------------------------------------
// REGISTER
// POST /api/users/register
// ------------------------------------------------------------
async function registerUser(req, res) {
  const { email, password, full_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Email and password are required",
    });
  }

  try {
    // Check if user already exists
    const existing = await knex("users").where({ email }).first();
    if (existing) {
      return res.status(409).json({
        error: true,
        message: "User with this email already exists",
      });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const [insertId] = await knex("users").insert({
      email,
      password_hash,
      full_name: full_name || null,
      role: "user",
      is_active: 0, // must be activated by admin
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
        is_active: 0,
      },
    });
  } catch (err) {
    console.error("Error during registration:", err);
    return res.status(500).json({
      error: true,
      message: "Database error during registration",
    });
  }
}

// ------------------------------------------------------------
// LOGIN
// POST /api/users/login
// ------------------------------------------------------------
async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Email and password are required",
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
        message: "Incorrect email or password",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: true,
        message: "Your account is not yet activated by an administrator",
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        error: true,
        message: "Incorrect email or password",
      });
    }

    const token = generateToken(user);
    delete user.password_hash;

    return res.status(200).json({
      error: false,
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({
      error: true,
      message: "Database error during login",
    });
  }
}

// ------------------------------------------------------------
// RENEW TOKEN (sliding session)
// POST /api/users/renew
// Requires valid existing token in Authorization header
// ------------------------------------------------------------
async function renewToken(req, res) {
  try {
    const userId = req.user.sub;

    const user = await knex("users")
      .select("id", "email", "full_name", "role", "is_active")
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: true,
        message: "Account is inactive; token cannot be renewed",
      });
    }

    const newToken = generateToken(user);

    return res.json({
      error: false,
      message: "Token renewed successfully",
      token: newToken,
      user,
    });
  } catch (err) {
    console.error("Error renewing token:", err);
    return res.status(500).json({
      error: true,
      message: "Error renewing token",
    });
  }
}

// ------------------------------------------------------------
// ACTIVATE USER
// PATCH /api/users/:id/activate
// Admin only (checked by middleware)
// ------------------------------------------------------------
async function activateUser(req, res) {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({
      error: true,
      message: "Invalid user ID",
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
        message: "User not found",
      });
    }

    await knex("users").where({ id: userId }).update({ is_active: 1 });

    const updated = { ...user, is_active: 1 };

    return res.json({
      error: false,
      message: "User activated successfully",
      user: updated,
    });
  } catch (err) {
    console.error("Error activating user:", err);
    return res.status(500).json({
      error: true,
      message: "Database error while activating user",
    });
  }
}

// ------------------------------------------------------------
// DEACTIVATE USER
// PATCH /api/users/:id/deactivate
// Admin only
// ------------------------------------------------------------
async function deactivateUser(req, res) {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({
      error: true,
      message: "Invalid user ID",
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
        message: "User not found",
      });
    }

    await knex("users").where({ id: userId }).update({ is_active: 0 });

    const updated = { ...user, is_active: 0 };

    return res.json({
      error: false,
      message: "User deactivated successfully",
      user: updated,
    });
  } catch (err) {
    console.error("Error deactivating user:", err);
    return res.status(500).json({
      error: true,
      message: "Database error while deactivating user",
    });
  }
}

// ------------------------------------------------------------
// LIST PENDING USERS (is_active = 0)
// GET /api/users/pending
// Admin only
// ------------------------------------------------------------
async function listPendingUsers(req, res) {
  try {
    const users = await knex("users")
      .select("id", "email", "full_name", "role", "is_active")
      .where({ is_active: 0 })
      .orderBy("id", "asc");

    return res.json({
      error: false,
      users,
    });
  } catch (err) {
    console.error("Error listing pending users:", err);
    return res.status(500).json({
      error: true,
      message: "Database error while listing pending users",
    });
  }
}

// ------------------------------------------------------------
// LIST ACTIVE USERS (is_active = 1)
// GET /api/users/active
// Admin only
// ------------------------------------------------------------
async function listActiveUsers(req, res) {
  try {
    const users = await knex("users")
      .select("id", "email", "full_name", "role", "is_active")
      .where({ is_active: 1 })
      .orderBy("id", "asc");

    return res.json({
      error: false,
      users,
    });
  } catch (err) {
    console.error("Error listing active users:", err);
    return res.status(500).json({
      error: true,
      message: "Database error while listing active users",
    });
  }
}

// ------------------------------------------------------------
// CHANGE USER ROLE
// PATCH /api/users/:id/role
// body: { role: "user" | "admin" }
// Admin only
// ------------------------------------------------------------
async function changeUserRole(req, res) {
  const userId = parseInt(req.params.id, 10);
  const { role } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({
      error: true,
      message: "Invalid user ID",
    });
  }

  if (!role || !["user", "admin"].includes(role)) {
    return res.status(400).json({
      error: true,
      message: "Invalid or missing role (must be 'user' or 'admin')",
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
        message: "User not found",
      });
    }

    await knex("users").where({ id: userId }).update({ role });

    const updated = { ...user, role };

    return res.json({
      error: false,
      message: "User role updated successfully",
      user: updated,
    });
  } catch (err) {
    console.error("Error changing user role:", err);
    return res.status(500).json({
      error: true,
      message: "Database error while updating user role",
    });
  }
}

// ------------------------------------------------------------
// DELETE USER
// DELETE /api/users/:id
// Admin only
// ------------------------------------------------------------
async function deleteUser(req, res) {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({
      error: true,
      message: "Invalid user ID",
    });
  }

  try {
    const existing = await knex("users").where({ id: userId }).first();

    if (!existing) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    await knex("users").where({ id: userId }).del();

    return res.json({
      error: false,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({
      error: true,
      message: "Database error while deleting user",
    });
  }
}

// ------------------------------------------------------------
// UPDATE USER DETAILS (full_name and role)
// PATCH /api/users/:id/update
// body: { full_name, role }
// Admin only
// ------------------------------------------------------------
async function updateUserDetails(req, res) {
  const userId = parseInt(req.params.id, 10);
  const { full_name, role } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({
      error: true,
      message: "Invalid user ID",
    });
  }

  if (!full_name && !role) {
    return res.status(400).json({
      error: true,
      message: "At least one of full_name or role must be provided",
    });
  }

  if (role && !["user", "admin"].includes(role)) {
    return res.status(400).json({
      error: true,
      message: "Invalid role (must be 'user' or 'admin')",
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
        message: "User not found",
      });
    }

    const updateData = {};
    if (typeof full_name === "string") {
      updateData.full_name = full_name;
    }
    if (role) {
      updateData.role = role;
    }

    await knex("users").where({ id: userId }).update(updateData);

    const updated = { ...user, ...updateData };

    return res.json({
      error: false,
      message: "User details updated successfully",
      user: updated,
    });
  } catch (err) {
    console.error("Error updating user details:", err);
    return res.status(500).json({
      error: true,
      message: "Database error while updating user",
    });
  }
}

// ------------------------------------------------------------
// EXPORTS
// ------------------------------------------------------------
module.exports = {
  registerUser,
  loginUser,
  renewToken,
  activateUser,
  deactivateUser,
  listPendingUsers,
  listActiveUsers,
  changeUserRole,
  deleteUser,
  updateUserDetails,
};
