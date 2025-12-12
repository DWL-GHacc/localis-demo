// server/routes/users.js
const express = require("express");
const router = express.Router();

const {
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
  getUserLgas,
  putUserLgas,
} = require("../controllers/usersController");

const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/authMiddleware");

// ------------------------------------------------------------
// PUBLIC AUTH ROUTES
// ------------------------------------------------------------

// POST /api/users/register
router.post("/register", registerUser);

// POST /api/users/login
router.post("/login", loginUser);

// POST /api/users/renew
// Requires valid token (checked by authenticateToken)
router.post("/renew", authenticateToken, renewToken);


// ------------------------------------------------------------
// ADMIN-ONLY USER MANAGEMENT ROUTES
// (authenticateToken + requireAdmin)
// ------------------------------------------------------------

// GET /api/users/:id/lgas
router.get("/:id/lgas", authenticateToken, requireAdmin, getUserLgaAccess);

// PUT /api/users/:id/lgas
router.put("/:id/lgas", authenticateToken, requireAdmin, updateUserLgaAccess);


// PATCH /api/users/:id/activate
router.patch("/:id/activate", authenticateToken, requireAdmin, activateUser);

// PATCH /api/users/:id/deactivate
router.patch("/:id/deactivate", authenticateToken, requireAdmin, deactivateUser);

// GET /api/users/pending
router.get("/pending", authenticateToken, requireAdmin, listPendingUsers);

// GET /api/users/active
router.get("/active", authenticateToken, requireAdmin, listActiveUsers);

// PATCH /api/users/:id/role
router.patch("/:id/role", authenticateToken, requireAdmin, changeUserRole);

// PATCH /api/users/:id/update
// body: { full_name, role }
router.patch(
  "/:id/update",
  authenticateToken,
  requireAdmin,
  updateUserDetails
);

// DELETE /api/users/:id
router.delete("/:id", authenticateToken, requireAdmin, deleteUser);

// Manage user passwords
router.patch("/:id/password", authenticateToken, updateUserPassword);
router.delete("/:id/password", authenticateToken, clearUserPassword);
// Manage user passwords (admin only from admin UI)
router.patch("/:id/password", authenticateToken, requireAdmin, updateUserPassword);
router.delete("/:id/password", authenticateToken, requireAdmin, clearUserPassword);

// LGA access management
// GET /api/users/:id/lgas
router.get("/:id/lgas", authenticateToken, requireAdmin, getUserLgas);

// PUT /api/users/:id/lgas
// body: { scope: "all" | "restricted", lgas: string[] }
router.put("/:id/lgas", authenticateToken, requireAdmin, putUserLgas);

module.exports = router;

