const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const resumes = await dbAll(
      'SELECT id, title, data, created_at, updated_at FROM resumes WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.id]
    );
    res.json(resumes.map(r => ({ ...r, data: typeof r.data === 'string' ? JSON.parse(r.data) : r.data })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/latest', async (req, res) => {
  try {
    const resume = await dbGet(
      'SELECT id, title, data, created_at, updated_at FROM resumes WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [req.user.id]
    );
    if (!resume) return res.json(null);
    resume.data = typeof resume.data === 'string' ? JSON.parse(resume.data) : resume.data;
    res.json(resume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { title, data } = req.body;
  if (!data) return res.status(400).json({ error: 'Resume data is required' });
  try {
    const result = await dbRun(
      'INSERT INTO resumes (user_id, title, data) VALUES ($1, $2, $3) RETURNING id',
      [req.user.id, title || 'My Resume', JSON.stringify(data)]
    );
    const resume = await dbGet('SELECT * FROM resumes WHERE id = $1', [result.lastID || result.id]);
    resume.data = JSON.parse(resume.data);
    res.status(201).json(resume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { title, data } = req.body;
  try {
    const existing = await dbGet(
      'SELECT id FROM resumes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!existing) return res.status(404).json({ error: 'Resume not found' });

    await dbRun(
      "UPDATE resumes SET title = $1, data = $2, updated_at = NOW() WHERE id = $3",
      [title || 'My Resume', JSON.stringify(data), req.params.id]
    );
    const resume = await dbGet('SELECT * FROM resumes WHERE id = $1', [req.params.id]);
    resume.data = JSON.parse(resume.data);
    res.json(resume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existing = await dbGet(
      'SELECT id FROM resumes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!existing) return res.status(404).json({ error: 'Resume not found' });
    await dbRun('DELETE FROM resumes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
