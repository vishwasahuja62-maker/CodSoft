const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { dbGet, dbRun } = require('../database');

const { authenticateToken } = require('../middleware/auth');

router.get('/verify', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Verification token is required' });
  try {
    const vt = await dbGet('SELECT * FROM verification_tokens WHERE token = $1 AND expires_at > NOW()', [token]);
    if (!vt) return res.status(400).json({ error: 'Invalid or expired verification token' });
    await dbRun('UPDATE users SET verified = 1 WHERE id = $1', [vt.user_id]);
    await dbRun('DELETE FROM verification_tokens WHERE id = $1', [vt.id]);
    res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/resend', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.verified) return res.json({ message: 'Email already verified' });
    await dbRun('DELETE FROM verification_tokens WHERE user_id = $1', [user.id]);
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 86400000).toISOString();
    await dbRun('INSERT INTO verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)', [user.id, token, expiresAt]);
    res.json({ message: 'Verification email resent. Check your inbox.' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/status', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT verified FROM users WHERE id = $1', [req.user.id]);
    res.json({ verified: user?.verified === 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
