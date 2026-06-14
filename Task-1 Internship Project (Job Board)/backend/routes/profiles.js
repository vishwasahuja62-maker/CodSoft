const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { dbGet, dbRun } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Multer storage configuration - memory storage for Supabase
const storage = multer.memoryStorage();

// File filter to restrict uploads to document files
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word Documents, and Text files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// GET /api/profiles/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const profile = await dbGet('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/profiles/me
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const role = req.user.role;

    if (role === 'candidate') {
      const { title, bio, skills, experience, education, linkedin_url, github_url } = req.body;

      await dbRun(
        `UPDATE profiles 
         SET title = ?, bio = ?, skills = ?, experience = ?, education = ?, linkedin_url = ?, github_url = ?
         WHERE user_id = ?`,
        [title || '', bio || '', skills || '', experience || '', education || '', linkedin_url || '', github_url || '', req.user.id]
      );

      // Also update the name in users table if passed
      if (req.body.name) {
        await dbRun('UPDATE users SET name = ? WHERE id = ?', [req.body.name, req.user.id]);
      }
    } else if (role === 'employer') {
      const { company_name, company_website, company_bio } = req.body;

      await dbRun(
        `UPDATE profiles 
         SET company_name = ?, company_website = ?, company_bio = ? 
         WHERE user_id = ?`,
        [company_name || '', company_website || '', company_bio || '', req.user.id]
      );

      // Also update company name in users table
      if (company_name) {
        await dbRun('UPDATE users SET name = ? WHERE id = ?', [company_name, req.user.id]);
      }
    }

    const updatedProfile = await dbGet('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    const updatedUser = await dbGet('SELECT id, email, name, role FROM users WHERE id = ?', [
      req.user.id,
    ]);

    res.json({
      message: 'Profile updated successfully.',
      profile: updatedProfile,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/profiles/employer/:id (public)
router.get('/employer/:id', async (req, res) => {
  try {
    const user = await dbGet('SELECT id, name, email FROM users WHERE id = $1 AND role = $2', [req.params.id, 'employer']);
    if (!user) return res.status(404).json({ error: 'Employer not found' });
    const profile = await dbGet('SELECT * FROM profiles WHERE user_id = $1', [req.params.id]);
    const jobs = await require('../database').dbAll(
      'SELECT id, title, location, type, salary_min, salary_max, created_at FROM jobs WHERE employer_id = $1 AND is_active = 1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json({ ...user, profile, jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/profiles/upload-resume (Candidate Only)
router.post(
  '/upload-resume',
  authenticateToken,
  requireRole('candidate'),
  (req, res, next) => {
    upload.single('resume')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a resume file.' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase storage is not configured properly on the server.' });
    }

    try {
      const ext = path.extname(req.file.originalname);
      const fileName = `${req.user.id}-${Date.now()}${ext}`;

      // Retrieve old resume URL to clean up if exists
      const oldProfile = await dbGet('SELECT resume_url FROM profiles WHERE user_id = ?', [req.user.id]);

      if (oldProfile && oldProfile.resume_url && oldProfile.resume_url.includes('supabase.co')) {
        const urlObj = new URL(oldProfile.resume_url);
        const pathSegments = urlObj.pathname.split('/');
        const oldFileName = pathSegments[pathSegments.length - 1];
        if (oldFileName) {
          await supabase.storage.from('resumes').remove([oldFileName]);
        }
      } else if (oldProfile && oldProfile.resume_url) {
        // Cleanup old local file if migrating
        const oldFilePath = path.join(__dirname, '..', oldProfile.resume_url);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Upload new file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error('Storage error: ' + error.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      // Update db
      await dbRun('UPDATE profiles SET resume_url = ? WHERE user_id = ?', [
        publicUrl,
        req.user.id,
      ]);

      res.json({
        message: 'Resume uploaded successfully.',
        resume_url: publicUrl,
      });
    } catch (error) {
      console.error('Resume upload error:', error);
      res.status(500).json({ error: 'Failed to update resume path in database.' });
    }
  }
);

module.exports = router;
