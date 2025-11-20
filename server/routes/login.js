// POST /users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: 'Request body incomplete, both email and password are required'
    });
  }

  try {
    const user = await knex('users').where({ email }).first();

    // User not found
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Incorrect email or password'
      });
    }

    // Optional: block inactive users
    if (user.is_active === 0) {
      return res.status(403).json({
        error: true,
        message: 'User account is inactive. Contact an administrator.'
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        error: true,
        message: 'Incorrect email or password'
      });
    }

    const exp = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, exp },
      JWT_SECRET
    );

    return res.status(200).json({
      error: false,
      message: 'Login successful',
      token,
      token_expires_in: TOKEN_EXPIRY_SECONDS,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});
