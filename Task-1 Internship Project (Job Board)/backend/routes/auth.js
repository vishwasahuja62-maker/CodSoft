const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const https = require('https');
const { dbGet, dbRun } = require('../database');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');


// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, role, name } = req.body;

  if (!email || !password || !role || !name) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (role !== 'employer' && role !== 'candidate') {
    return res.status(400).json({ error: 'Invalid user role specified.' });
  }

  try {
    // Check if user already exists
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email address already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await dbRun(
      'INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, role, name]
    );

    const userId = result.lastID;

    // Create default profile for the user
    if (role === 'candidate') {
      await dbRun(
        'INSERT INTO profiles (user_id, title, bio, skills, experience, education, resume_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, '', '', '', '', '', '']
      );
    } else if (role === 'employer') {
      await dbRun(
        'INSERT INTO profiles (user_id, company_name, company_website, company_bio) VALUES (?, ?, ?, ?)',
        [userId, name, '', '']
      );
    }



    // Generate JWT token
    const token = jwt.sign({ id: userId, email, role, name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      token,
      user: { id: userId, email, role, name },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find user
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, email, role, name, verified, created_at FROM users WHERE id = ?', [
      req.user.id,
    ]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Fetch profile info
    const profile = await dbGet('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);

    res.json({
      user,
      profile,
    });
  } catch (error) {
    console.error('Auth-me error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/google', async (req, res) => {
  const { credential, role } = req.body;
  if (!credential) return res.status(400).json({ error: 'Google credential is required.' });

  try {
    const payload = await new Promise((resolve, reject) => {
      https.get('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + credential, (resp) => {
        let data = '';
        resp.on('data', (chunk) => data += chunk);
        resp.on('end', () => {
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        });
      }).on('error', reject);
    });

    if (!payload || !payload.email || payload.error) {
      return res.status(400).json({ error: 'Invalid Google token: ' + (payload.error_description || 'verification failed') });
    }

    const email = payload.email;
    const name = payload.name || email.split('@')[0];
    let user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      const result = await dbRun(
        'INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)',
        [email, 'google_oauth_' + Math.random().toString(36).slice(2), role || 'candidate', name]
      );
      const userId = result.lastID;
      
      if (role === 'employer') {
        await dbRun(
          'INSERT INTO profiles (user_id, company_name, company_bio, avatar_url) VALUES (?, ?, ?, ?)',
          [userId, name, '', payload.picture || '']
        );
      } else {
        await dbRun(
          'INSERT INTO profiles (user_id, title, bio, skills, experience, education, resume_url, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [userId, '', '', '', '', '', '', payload.picture || '']
        );
      }
      
      user = { id: userId, email, role: role || 'candidate', name };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google sign-in successful.',
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed.' });
  }
});

module.exports = router;
