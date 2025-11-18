// server/routes/users.js
// import express from "express";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import knex from "../db.js";

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const knex = require("../db");

const router = express.Router();
const SALT_ROUNDS = 10;

// Generate a signed JWT token
function generateToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

/**
 * POST /api/users/register
 */
router.post("/register", async (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required",
    });
  }

  try {
    // Check if user already exists
    const existing = await knex("users").where({ email }).first();
    if (existing) {
      return res.status(409).json({
        error: true,
        message: "User already exists",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user (role defaults to 'user', is_active defaults to 1)
    const insertData = {
      email,
      password_hash,
      full_name: full_name || null,
    };

    const result = await knex("users").insert(insertData);
    const userId = Array.isArray(result) ? result[0] : result;

    const user = {
      id: userId,
      email,
      full_name: full_name || null,
      role: "user",
      is_active: 0,
    };

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered",
      token,
      user
    });

  } catch (err) {
    console.error("Error in /api/users/register:", err);
    res.status(500).json({
      error: true,
      message: "Failed to register user",
    });
  }
});

/**
 * POST /api/users/login
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Email and password required",
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
        message: "User account is inactive",
      });
    }

    // Validate password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        error: true,
        message: "Incorrect email or password",
      });
    }

    const token = generateToken(user);

    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser
    });

  } catch (err) {
    console.error("Error in /api/users/login:", err);
    res.status(500).json({
      error: true,
      message: "Login failed",
    });
  }
});

// export default router;
module.exports = router;
