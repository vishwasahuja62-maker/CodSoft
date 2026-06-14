const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/bookmarks - Get all saved jobs for current candidate
router.get('/', authenticateToken, requireRole('candidate'), async (req, res) => {
  try {
    const bookmarks = await dbAll(
      `SELECT j.*, b.id as bookmark_id, p.company_website 
       FROM bookmarks b
       JOIN jobs j ON b.job_id = j.id
       LEFT JOIN profiles p ON j.employer_id = p.user_id
       WHERE b.candidate_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(bookmarks);
  } catch (error) {
    console.error('Fetch bookmarks error:', error);
    res.status(500).json({ error: 'Internal server error while fetching bookmarks.' });
  }
});

// GET /api/bookmarks/ids - Get just an array of job IDs the user bookmarked
router.get('/ids', authenticateToken, requireRole('candidate'), async (req, res) => {
  try {
    const bookmarks = await dbAll(
      `SELECT job_id FROM bookmarks WHERE candidate_id = ?`,
      [req.user.id]
    );
    res.json(bookmarks.map(b => b.job_id));
  } catch (error) {
    console.error('Fetch bookmark ids error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/bookmarks/:jobId - Toggle a bookmark (add if missing, remove if present)
router.post('/:jobId', authenticateToken, requireRole('candidate'), async (req, res) => {
  const jobId = parseInt(req.params.jobId, 10);
  
  try {
    // Check if job exists
    const job = await dbGet('SELECT id FROM jobs WHERE id = ?', [jobId]);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Check if bookmark exists
    const existing = await dbGet('SELECT id FROM bookmarks WHERE candidate_id = ? AND job_id = ?', [req.user.id, jobId]);
    
    if (existing) {
      // Remove it
      await dbRun('DELETE FROM bookmarks WHERE id = ?', [existing.id]);
      res.json({ message: 'Bookmark removed successfully.', bookmarked: false });
    } else {
      // Add it
      await dbRun('INSERT INTO bookmarks (candidate_id, job_id) VALUES (?, ?)', [req.user.id, jobId]);
      res.status(201).json({ message: 'Bookmark added successfully.', bookmarked: true });
    }
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({ error: 'Internal server error while toggling bookmark.' });
  }
});

module.exports = router;
