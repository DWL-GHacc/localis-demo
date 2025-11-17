// routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24; // 24 hours

// POST /users/register
router.post('/register', async (req, res) => {
  const { email, password, full_name, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: 'Request body incomplete, both email and password are required'
    });
  }

  try {
    // Check if user already exists
    const existingUser = await knex('users').where({ email }).first();
    if (existingUser) {
      return res.status(409).json({
        error: true,
        message: 'User already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user – role & is_active will use DB defaults if not provided
    const [newUserId] = await knex('users').insert({
      email,
      password_hash,
      full_name: full_name || null,
      role: role || 'user',
      is_active: 0
      // is_active, created_at, updated_at all use defaults
    });

    // Create JWT
    const exp = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS;
    const token = jwt.sign(
      { id: newUserId, email, role: role || 'user', exp },
      JWT_SECRET
    );

    return res.status(201).json({
      error: false,
      message: 'User registered successfully',
      user: {
        id: newUserId,
        email,
        full_name: full_name || null,
        role: role || 'user'
      },
      token,
      token_expires_in: TOKEN_EXPIRY_SECONDS
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});
