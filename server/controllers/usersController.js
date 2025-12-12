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
    // Make sure lga_scope is in your users table
    const user = await knex("users")
      .select(
        "id",
        "email",
        "password_hash",
        "full_name",
        "role",
        "is_active",
        "lga_scope"          // <- NEW
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
// --------------------------------------------------------
    // Fetch LGA access for this user
    // --------------------------------------------------------
    let lgaAccess;
if (user.lga_scope === "restricted") {
      // Only specific LGAs for this user
      const rows = await knex("user_lga_access")
        .select("lga_name")          // or "lga_code"/whatever your column is
        .where({ user_id: user.id });
lgaAccess = rows.map((r) => r.lga_name);
    } else {
      
      lgaAccess = "all";


    }
// Build token payload (include lga_scope if you want it in the JWT)
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      lga_scope: user.lga_scope,
    });
// Don’t send password hash to the client
    const { password_hash, ...safeUser } = user;

return res.status(200).json({
      error: false,
      message: "Login successful",
      token,
      user: {
        ...safeUser,
        lgaAccess,   // <- NEW: either "all" or an array of LGA names
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
// UPDATE USER PASSWORD
// PATCH /api/users/:id/password
// Admin or the user themselves
// body: { password }
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
    // Permission check — allow admin OR same user
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({
        error: true,
        message: "You are not allowed to change this password",
      });
    }

    const user = await knex("users")
      .select("id")
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    await knex("users")
      .where({ id: userId })
      .update({ password_hash });

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
// Admin only — clears password so user cannot log in
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

    const user = await knex("users")
      .select("id")
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    await knex("users")
      .where({ id: userId })
      .update({ password_hash: null });

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
// ------------------------------------------------------------
async function getUserLgaAccess(req, res) {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({
      error: true,
      message: "Invalid user ID",
    });
  }

  try {
    const user = await knex("users")
      .select("id", "lga_scope")
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    // Default if column not populated for some older rows
    const scope = user.lga_scope || "all";

    if (scope === "all") {
      // No need to read the mapping table
      return res.json({
        error: false,
        scope: "all",
        lgas: [],
      });
    }

    const rows = await knex("user_lga_access")
      .select("lga_name")
      .where({ user_id: userId })
      .orderBy("lga_name", "asc");

    const lgas = rows.map((r) => r.lga_name);

    return res.json({
      error: false,
      scope: "restricted",
      lgas,
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
// body: { scope: 'all' | 'restricted', lgas: string[] }
// Admin only
// ------------------------------------------------------------
async function updateUserLgaAccess(req, res) {
  const userId = parseInt(req.params.id, 10);
  const { scope, lgas } = req.body || {};

  if (isNaN(userId)) {
    return res.status(400).json({
      error: true,
      message: "Invalid user ID",
    });
  }

  if (!["all", "restricted"].includes(scope)) {
    return res.status(400).json({
      error: true,
      message: "scope must be 'all' or 'restricted'",
    });
  }

  try {
    const user = await knex("users")
      .select("id")
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    // ---------------------------------------------
    // Fetch ALL available LGAs from dataset
    // ---------------------------------------------
    const availableRows = await knex("length_data")
      .distinct("lga_name")
      .whereNotNull("lga_name")
      .orderBy("lga_name");

    const allLgas = availableRows
      .map((r) => r.lga_name)
      .filter(Boolean);

    if (allLgas.length === 0) {
      return res.status(400).json({
        error: true,
        message: "No LGAs available in dataset",
      });
    }

    // ---------------------------------------------
    // Determine which LGAs to assign
    // ---------------------------------------------
    let lgasToAssign = [];

    if (scope === "all") {
      // ✅ FIX: assign EVERY available LGA
      lgasToAssign = allLgas;
    } else {
      // restricted
      if (!Array.isArray(lgas) || lgas.length === 0) {
        return res.status(400).json({
          error: true,
          message:
            "When scope is 'restricted', lgas must be a non-empty array",
        });
      }

      // Ensure LGAs are valid
      const validSet = new Set(allLgas);
      lgasToAssign = [...new Set(lgas)].filter(
        (name) => validSet.has(name)
      );

      if (lgasToAssign.length === 0) {
        return res.status(400).json({
          error: true,
          message: "No valid LGAs supplied",
        });
      }
    }

    // ---------------------------------------------
    // Transaction: update scope + replace mappings
    // ---------------------------------------------
    await knex.transaction(async (trx) => {
      // Update scope on users table
      await trx("users")
        .where({ id: userId })
        .update({ lga_scope: scope });

      // Clear existing mappings
      await trx("user_lga_access")
        .where({ user_id: userId })
        .del();

      // Insert new mappings (one row per LGA)
      await trx("user_lga_access").insert(
        lgasToAssign.map((lga) => ({
          user_id: userId,
          lga_name: lga,
        }))
      );
    });

    return res.json({
      error: false,
      message: "User LGA access updated successfully",
      scope,
      assignedCount: lgasToAssign.length,
    });
  } catch (err) {
    console.error("Error updating user LGA access:", err);
    return res.status(500).json({
      error: true,
      message: "Database error while updating user LGA access",
    });
  }
}


// ✅ GET /api/users/:id/lgas
async function getUserLgas(req, res) {
  const db = req.db;
  const userId = Number(req.params.id);

  try {
    const [available, assignedRows] = await Promise.all([
      getAllAvailableLgas(db),
      db("user_lga_access")
        .select("lga_name")
        .where({ user_id: userId })
        .orderBy("lga_name"),
    ]);

    const assigned = assignedRows.map((r) => r.lga_name).filter(Boolean);

    const scope =
      available.length > 0 && assigned.length === available.length
        ? "all"
        : "restricted";

    return res.json({
      error: false,
      scope,
      lgas: assigned,
      availableCount: available.length,
      assignedCount: assigned.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: true,
      message: "Failed to load user LGA access",
    });
  }
}

// ✅ PUT /api/users/:id/lgas
async function putUserLgas(req, res) {
  const db = req.db;
  const userId = Number(req.params.id);
  const { scope, lgas } = req.body || {};

  try {
    if (scope !== "all" && scope !== "restricted") {
      return res.status(400).json({
        error: true,
        message: "scope must be 'all' or 'restricted'",
      });
    }

    const available = await getAllAvailableLgas(db);

    const toAssign =
      scope === "all"
        ? available
        : (Array.isArray(lgas) ? lgas : []).filter(Boolean);

    if (scope === "restricted" && toAssign.length === 0) {
      return res.status(400).json({
        error: true,
        message: "Please select at least one LGA for restricted access",
      });
    }

    // Validate requested LGAs actually exist in dataset
    const availableSet = new Set(available);
    const invalid = toAssign.filter((x) => !availableSet.has(x));
    if (invalid.length > 0) {
      return res.status(400).json({
        error: true,
        message: `Invalid LGA(s): ${invalid.slice(0, 5).join(", ")}${
          invalid.length > 5 ? "…" : ""
        }`,
      });
    }

    // Replace all rows for the user in a transaction
    await db.transaction(async (trx) => {
      await trx("user_lga_access").where({ user_id: userId }).del();

      // Insert one row per LGA
      const unique = Array.from(new Set(toAssign));
      if (unique.length > 0) {
        await trx("user_lga_access").insert(
          unique.map((name) => ({ user_id: userId, lga_name: name }))
        );
      }
    });

    return res.json({
      error: false,
      message: "User LGA access updated",
      scope,
      assignedCount: toAssign.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: true,
      message: "Failed to update user LGA access",
    });
  }
}

// ✅ PATCH /api/users/:id/activate (modify your existing activateUser)
async function activateUser(req, res) {
  const db = req.db;
  const userId = Number(req.params.id);

  try {
    const row = await db("user_lga_access")
      .where({ user_id: userId })
      .first();

    if (!row) {
      return res.status(409).json({
        error: true,
        code: "LGA_REQUIRED",
        message:
          "Cannot activate user until LGA access has been assigned (All or Specific LGAs).",
      });
    }

    await db("users").where({ id: userId }).update({ is_active: 1 });

    return res.json({ error: false, message: "User activated" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: true,
      message: "Failed to activate user",
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
