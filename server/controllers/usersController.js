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
      is_active: 0,
      // lga_scope: null,  // optional if column exists
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
      .select(
        "id",
        "email",
        "password_hash",
        "full_name",
        "role",
        "is_active",
        "lga_scope"
      )
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

    // ------------------------------------------------------------
    // Fetch LGA access for this user
    // ------------------------------------------------------------
    let lgaAccess;
    if (user.lga_scope === "restricted") {
      const rows = await knex("user_lga_access")
        .select("lga_name")
        .where({ user_id: user.id });

      lgaAccess = rows.map((r) => r.lga_name);
    } else {
      // "all" (default / admin)
      lgaAccess = "all";
    }

    // ------------------------------------------------------------
    // Generate JWT (NO email, NO lga_scope)
    // ------------------------------------------------------------
    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    // ------------------------------------------------------------
    // Strip sensitive / unused fields from response
    // ------------------------------------------------------------
    const {
      password_hash,
      email: _email,
      lga_scope: _lga_scope,
      ...safeUser
    } = user;

    return res.status(200).json({
      error: false,
      message: "Login successful",
      token,
      user: {
        ...safeUser, // id, full_name, role, is_active
        lgaAccess,   // ✅ source of truth for permissions
      },
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
// RENEW TOKEN
// POST /api/users/renew
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
// LIST PENDING USERS
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
// LIST ACTIVE USERS
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
// UPDATE USER DETAILS
// PATCH /api/users/:id/update
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
    if (typeof full_name === "string") updateData.full_name = full_name;
    if (role) updateData.role = role;

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
// UPDATE USER PASSWORD
// PATCH /api/users/:id/password
// Admin or same user
// ------------------------------------------------------------
async function updateUserPassword(req, res) {
  const userId = parseInt(req.params.id, 10);
  const { password } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({
      error: true,
      message: "Invalid user ID",
    });
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      error: true,
      message: "Password must be at least 8 characters long",
    });
  }

  try {
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({
        error: true,
        message: "You are not allowed to change this password",
      });
    }

    const user = await knex("users").select("id").where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    await knex("users").where({ id: userId }).update({ password_hash });

    return res.json({
      error: false,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Error updating password:", err);
    return res.status(500).json({
      error: true,
      message: "Database error while updating password",
    });
  }
}

// ------------------------------------------------------------
// CLEAR USER PASSWORD
// DELETE /api/users/:id/password
// Admin only
// ------------------------------------------------------------
async function clearUserPassword(req, res) {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({
      error: true,
      message: "Invalid user ID",
    });
  }

  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: true,
        message: "Only admins can clear a password",
      });
    }

    const user = await knex("users").select("id").where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    await knex("users").where({ id: userId }).update({ password_hash: null });

    return res.json({
      error: false,
      message: "Password cleared successfully",
    });
  } catch (err) {
    console.error("Error clearing password:", err);
    return res.status(500).json({
      error: true,
      message: "Database error while clearing password",
    });
  }
}

// ------------------------------------------------------------
// GET USER LGA ACCESS
// GET /api/users/:id/lgas
// Admin only
// Returns: { lgas: string[] }
// ------------------------------------------------------------
async function getUserLgaAccess(req, res) {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: true, message: "Invalid user ID" });
  }

  try {
    const user = await knex("users").select("id").where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const rows = await knex("user_lga_access")
      .select("lga_name")
      .where({ user_id: userId })
      .orderBy("lga_name", "asc");

    return res.json({
      error: false,
      lgas: rows.map((r) => r.lga_name).filter(Boolean),
    });
  } catch (err) {
    console.error("Error getting user LGA access:", err);
    return res.status(500).json({
      error: true,
      message: "Database error while fetching user LGA access",
    });
  }
}

// ------------------------------------------------------------
// UPDATE USER LGA ACCESS 
// PUT /api/users/:id/lgas
// body: { lgas: string[] }
// Admin only
// Behavior:
// - deletes all rows for user
// - inserts one row per selected LGA
// ------------------------------------------------------------
async function updateUserLgaAccess(req, res) {
  const userId = parseInt(req.params.id, 10);
  const { lgas } = req.body || {};

  if (isNaN(userId)) {
    return res.status(400).json({ error: true, message: "Invalid user ID" });
  }

  if (!Array.isArray(lgas)) {
    return res.status(400).json({
      error: true,
      message: "lgas must be an array (can be empty)",
    });
  }

  try {
    const user = await knex("users").select("id").where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    // load all available LGAs from dataset (server-side validation)
    const availableRows = await knex("length_data")
      .distinct("lga_name")
      .whereNotNull("lga_name")
      .orderBy("lga_name");

    const available = availableRows.map((r) => r.lga_name).filter(Boolean);
    const availableSet = new Set(available);

    // keep only valid + unique
    const selectedUnique = Array.from(new Set(lgas))
      .filter(Boolean)
      .filter((name) => availableSet.has(name));

    await knex.transaction(async (trx) => {
      await trx("user_lga_access").where({ user_id: userId }).del();

      if (selectedUnique.length > 0) {
        // batch insert to avoid large SQL packet issues
        const rowsToInsert = selectedUnique.map((name) => ({
          user_id: userId,
          lga_name: name,
        }));

        await knex
          .batchInsert("user_lga_access", rowsToInsert, 500)
          .transacting(trx);
      }
    });

    return res.json({
      error: false,
      message: "User LGA access updated",
      assignedCount: selectedUnique.length,
    });
  } catch (err) {
    console.error("Error updating user LGA access:", err);
    return res.status(500).json({
      error: true,
      message: "Database error while updating user LGA access",
    });
  }
}

// ------------------------------------------------------------
// ACTIVATE USER (requires LGA access rows)
// PATCH /api/users/:id/activate
// Admin only
// ------------------------------------------------------------
async function activateUser(req, res) {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: true, message: "Invalid user ID" });
  }

  try {
    const user = await knex("users")
      .select("id", "email", "full_name", "role", "is_active")
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const hasLga = await knex("user_lga_access")
      .where({ user_id: userId })
      .first();

    if (!hasLga) {
      return res.status(409).json({
        error: true,
        code: "LGA_REQUIRED",
        message:
          "Cannot activate user until LGA access is assigned. Click 'LGAs' and select at least one.",
      });
    }

    await knex("users").where({ id: userId }).update({ is_active: 1 });

    return res.json({
      error: false,
      message: "User activated successfully",
      user: { ...user, is_active: 1 },
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
  updateUserPassword,
  clearUserPassword,
  getUserLgaAccess,
  updateUserLgaAccess,
};
