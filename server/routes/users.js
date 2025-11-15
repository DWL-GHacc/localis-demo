// server/routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = 60 * 60 * 24;

// REGISTER
router.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: true, message: 'Email and password required' });

  try {
    const existing = await knex('users').where({ email }).first();
    if (existing) return res.status(409).json({ error: true, message: 'Email already exists' });

    const hash = await bcrypt.hash(password, 10);

    const [id] = await knex('users').insert({
      email,
      password_hash: hash,
      full_name,
      role: 'user'
    });

    const exp = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY;
    const token = jwt.sign({ id, email, exp }, JWT_SECRET);

    res.status(201).json({ error: false, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: true, message: 'Missing email or password' });

  try {
    const user = await knex('users').where({ email }).first();
    if (!user) return res.status(401).json({ error: true, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: true, message: 'Invalid credentials' });

    const exp = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY;
    const token = jwt.sign({ id: user.id, email, exp }, JWT_SECRET);

    res.json({ error: false, token });
  } catch (err) {
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// PROTECTED PROFILE
router.get('/profile', auth, async (req, res) => {
  const user = await knex('users')
    .select('email', 'full_name', 'role', 'is_active')
    .where({ id: req.user.id })
    .first();

  res.json({ user });
});

module.exports = router;
