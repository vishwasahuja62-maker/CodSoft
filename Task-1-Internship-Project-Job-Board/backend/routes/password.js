const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { dbGet, dbRun } = require('../database');

// POST /api/password/reset-direct
// Direct password reset: email + new password, no token or email required
router.post('/reset-direct', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ error: 'Email and new password are required.' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  try {
    const user = await dbGet('SELECT * FROM users WHERE email = $1', [email]);
    if (!user) return res.status(404).json({ error: 'No account found with that email address.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await dbRun('UPDATE users SET password = $1 WHERE id = $2', [hashed, user.id]);

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    console.error('Direct password reset error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
