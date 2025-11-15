const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('../db');
const router = express.Router();

//Login Route
//POST /user/login  URL https://localhost:3000/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 400 - missing input
  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required"
    });
  }

  try {
    const user = await knex('users').where({ email }).first();

    // 401 - user not found or password mismatch
    if (!user || !(await bcrypt.compare(password, user.hash))) {
      return res.status(401).json({
        error: true,
        message: "Incorrect email or password"
      });
    }

    const expires_in = 60 * 60 * 24; // 24 hours
    const exp = Math.floor(Date.now() / 1000) + expires_in;
    const token = jwt.sign({ email, exp }, process.env.JWT_SECRET);

    res
      .cookie('token', token, {
        httpOnly: true,
        maxAge: expires_in * 1000,
        secure: true,
        sameSite: 'strict'
      })
      .status(200)
      .json({
        token,
        token_type: "Bearer",
        expires_in
      });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      error: true,
      message: "Login failed due to server error"
    });
  }
});

//Registration Route
//POST /user/register   URL-https://localhost:3000/users/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Registration attempt for email: ${email}`);

  if (!email || !password) {
    console.log('Registration failed: missing fields');
    return res.status(400).json({
      error: true,
      message: "Email and password required"
    });
  }

  try {
    const existingUser = await knex('users').where({ email }).first();
    if (existingUser) {
      console.log('Registration failed: user already exists');
      return res.status(409).json({
        error: true,
        message: "User already exists"
      });
    }

    const hash = await bcrypt.hash(password, 10);
    await knex('users').insert({ email, hash });

    console.log(`User created: ${email}`);
    res.status(201).json({
      success: true,
      message: "User created"
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      error: true,
      message: "Registration failed"
    });
  }
});

module.exports = router;
