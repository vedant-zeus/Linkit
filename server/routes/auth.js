const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db/connection');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ?', [username]
    );
    if (!rows.length)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];

    // For seeded demo users, allow plain-text password "admin123" / "user123"
    // In production these would be bcrypt hashes
    const demoPasswords = { admin: 'admin123', user: 'user123', priya: 'user123', amit: 'user123' };
    const isValid =
      demoPasswords[username] === password ||
      (await bcrypt.compare(password, user.password_hash).catch(() => false));

    if (!isValid)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.user_id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'linkit_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id:       user.user_id,
        name:     user.name,
        username: user.username,
        role:     user.role,
        email:    user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me  (verify token)
router.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'linkit_secret');
    res.json({ user: decoded });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
