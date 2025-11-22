const express = require("express");
const router = express.Router();
const knex = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

// Allowed types
const ALLOWED_TYPES = [
  "bug",
  "feature_request",
  "data_issue",
  "ui_ux",
  "general",
  "other",
];

// ------------------------------------------------------------
// ADD FEEDBACK
// POST /api/feedback
// Body: { user_email, user_name, feedback_type, message }
// ------------------------------------------------------------
router.post("/", authenticateToken, async (req, res) => {
  const { user_email, user_name, feedback_type, message } = req.body;

  if (!user_email || !user_name || !feedback_type || !message) {
    return res.status(400).json({
      error: true,
      message: "Missing required fields",
    });
  }

  if (!ALLOWED_TYPES.includes(feedback_type)) {
    return res.status(400).json({
      error: true,
      message: `Invalid feedback_type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
    });
  }

  try {
    const [id] = await knex("feedback").insert({
      user_email,
      user_name,
      feedback_type,
      message,
    });

    return res.status(201).json({
      error: false,
      message: "Feedback submitted successfully",
      feedback: {
        id,
        user_email,
        user_name,
        feedback_type,
        message,
      },
    });
  } catch (err) {
    console.error("Error adding feedback:", err);
    return res.status(500).json({
      error: true,
      message: "Database error while submitting feedback",
    });
  }
});
// ------------------------------------------------------------
// GET ALL FEEDBACK (ADMIN ONLY)
// GET /api/feedback/all
// ------------------------------------------------------------
const { requireAdmin } = require("../middleware/authMiddleware");

router.get("/all", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const items = await knex("feedback")
      .select(
        "id",
        "user_email",
        "user_name",
        "feedback_type",
        "message",
        "created_at"
      )
      .orderBy("created_at", "desc");

    return res.json({
      error: false,
      count: items.length,
      feedback: items,
    });
  } catch (err) {
    console.error("Error fetching feedback:", err);
    return res.status(500).json({
      error: true,
      message: "Database error retrieving feedback",
    });
  }
});


module.exports = router;
