const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/jobs - Fetch jobs with filters
router.get('/', async (req, res) => {
  const { search, location, type, experience_level, featured } = req.query;

  let query = `
    SELECT j.*, p.company_website, p.company_bio 
    FROM jobs j
    LEFT JOIN profiles p ON j.employer_id = p.user_id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ` AND (j.title LIKE ? OR j.company_name LIKE ? OR j.description LIKE ?)`;
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  if (location) {
    query += ` AND j.location LIKE ?`;
    params.push(`%${location}%`);
  }

  if (type) {
    query += ` AND j.type = ?`;
    params.push(type);
  }

  if (experience_level) {
    query += ` AND j.experience_level = ?`;
    params.push(experience_level);
  }

  if (featured === 'true' || featured === '1') {
    query += ` AND j.is_featured = 1`;
  }

  query += ` ORDER BY j.created_at DESC`;

  try {
    const jobs = await dbAll(query, params);
    res.json(jobs);
  } catch (error) {
    console.error('Fetch jobs error:', error);
    res.status(500).json({ error: 'Internal server error while fetching jobs.' });
  }
});

// GET /api/jobs/my-jobs - Fetch employer's own jobs (Employer Only)
router.get('/my-jobs', authenticateToken, requireRole('employer'), async (req, res) => {
  try {
    const jobs = await dbAll('SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC', [
      req.user.id,
    ]);
    res.json(jobs);
  } catch (error) {
    console.error('Fetch my-jobs error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/jobs/:id - Fetch job details
router.get('/:id', async (req, res) => {
  try {
    const job = await dbGet(
      `SELECT j.*, p.company_website, p.company_bio, u.email as employer_email
       FROM jobs j
       LEFT JOIN users u ON j.employer_id = u.id
       LEFT JOIN profiles p ON j.employer_id = p.user_id
       WHERE j.id = ?`,
      [req.params.id]
    );

    if (!job) {
      return res.status(404).json({ error: 'Job opening not found.' });
    }

    res.json(job);
  } catch (error) {
    console.error('Fetch job detail error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/jobs - Post a job (Employer Only)
router.post('/', authenticateToken, requireRole('employer'), async (req, res) => {
  const { title, company_name, location, type, experience_level, salary_range, description, requirements, benefits, is_featured } = req.body;

  if (!title || !company_name || !location || !type || !salary_range || !description || !requirements) {
    return res.status(400).json({ error: 'All fields except benefits are required.' });
  }

  try {
    const result = await dbRun(
      `INSERT INTO jobs (employer_id, title, company_name, location, type, experience_level, salary_range, description, requirements, benefits, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title,
        company_name,
        location,
        type,
        experience_level || 'Mid-Level',
        salary_range,
        description,
        requirements,
        benefits || '',
        is_featured ? 1 : 0,
      ]
    );

    const newJob = await dbGet('SELECT * FROM jobs WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Job posting published successfully.', job: newJob });
  } catch (error) {
    console.error('Post job error:', error);
    res.status(500).json({ error: 'Internal server error while publishing job.' });
  }
});

// PUT /api/jobs/:id - Update job (Employer Only)
router.put('/:id', authenticateToken, requireRole('employer'), async (req, res) => {
  const { title, company_name, location, type, experience_level, salary_range, description, requirements, benefits, is_featured } = req.body;

  if (!title || !company_name || !location || !type || !salary_range || !description || !requirements) {
    return res.status(400).json({ error: 'All fields except benefits are required.' });
  }

  try {
    const job = await dbGet('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    if (job.employer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden: You do not own this job posting.' });

    await dbRun(
      `UPDATE jobs 
       SET title = ?, company_name = ?, location = ?, type = ?, experience_level = ?, salary_range = ?, description = ?, requirements = ?, benefits = ?, is_featured = ?
       WHERE id = ?`,
      [
        title, company_name, location, type, experience_level || 'Mid-Level', salary_range, description, requirements, benefits || '', is_featured ? 1 : 0, req.params.id
      ]
    );

    const updatedJob = await dbGet('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Job posting updated successfully.', job: updatedJob });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/jobs/:id - Delete job (Employer Only)
router.delete('/:id', authenticateToken, requireRole('employer'), async (req, res) => {
  try {
    const job = await dbGet('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    if (job.employer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });

    await dbRun('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Job posting deleted successfully.' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
