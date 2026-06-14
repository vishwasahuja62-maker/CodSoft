const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Multer config for document uploads - memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|doc|docx|txt|rtf|png|jpg|jpeg)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, TXT, RTF, PNG, JPG'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// GET /api/documents - get all documents for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const documents = await dbAll(
      `SELECT id, name, type, size, file_path, created_at as updated
       FROM documents WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const formatted = documents.map(d => ({
      ...d,
      updated: timeAgo(new Date(d.updated)),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/documents/upload - upload a document
router.post('/upload', authenticateToken, (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided.' });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase storage is not configured properly.' });
  }

  try {
    const ext = path.extname(req.file.originalname).substring(1).toUpperCase();
    const rawExt = path.extname(req.file.originalname);
    const fileSizeKB = (req.file.size / 1024).toFixed(1);
    const sizeStr = fileSizeKB > 1024
      ? `${(fileSizeKB / 1024).toFixed(1)} MB`
      : `${fileSizeKB} KB`;

    const fileName = `documents/${req.user.id}-${Date.now()}${rawExt}`;

    // Upload new file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('resumes') // Reusing resumes bucket for now
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error('Storage error: ' + error.message);
    }

    const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    const result = await dbRun(
      `INSERT INTO documents (user_id, name, type, size, file_path)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, req.file.originalname, ext, sizeStr, publicUrl]
    );

    const doc = await dbGet('SELECT * FROM documents WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Document uploaded successfully.',
      document: { ...doc, updated: timeAgo(new Date(doc.created_at)) },
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/documents/:id - delete a document
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const doc = await dbGet(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (doc.file_path && doc.file_path.includes('supabase.co')) {
      const urlObj = new URL(doc.file_path);
      const pathSegments = urlObj.pathname.split('/');
      // It's under "documents/" so we need the last two segments
      const fileName = pathSegments.slice(-2).join('/');
      if (fileName) {
        await supabase.storage.from('resumes').remove([fileName]);
      }
    } else if (doc.file_path) {
      // Local cleanup fallback
      const fullPath = path.join(__dirname, '..', doc.file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await dbRun('DELETE FROM documents WHERE id = ?', [doc.id]);
    res.json({ message: 'Document deleted successfully.' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

function timeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

module.exports = router;
