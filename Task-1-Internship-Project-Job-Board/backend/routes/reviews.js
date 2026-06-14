const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/company/:companyId', async (req, res) => {
  try {
    const reviews = await dbAll(
      `SELECT r.*, u.name as user_name, u.email
       FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.company_id = $1 AND r.is_approved = 1
       ORDER BY r.created_at DESC`,
      [req.params.companyId]
    );
    const stats = await dbGet(
      'SELECT COUNT(*) as count, ROUND(AVG(rating), 1) as avg_rating FROM reviews WHERE company_id = $1 AND is_approved = 1',
      [req.params.companyId]
    );
    res.json({ reviews, stats: stats || { count: 0, avg_rating: 0 } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/company/:companyId', async (req, res) => {
  const { rating, title, review, pros, cons } = req.body;
  if (!rating || !review) return res.status(400).json({ error: 'Rating and review text are required' });
  try {
    const existing = await dbGet(
      'SELECT id FROM reviews WHERE company_id = $1 AND user_id = $2',
      [req.params.companyId, req.user.id]
    );
    if (existing) return res.status(400).json({ error: 'You have already reviewed this company' });
    await dbRun(
      'INSERT INTO reviews (company_id, user_id, rating, title, review, pros, cons) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [req.params.companyId, req.user.id, rating, title || '', review, pros || '', cons || '']
    );
    res.status(201).json({ message: 'Review submitted for approval.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', async (req, res) => {
  try {
    const reviews = await dbAll(
      `SELECT r.*, u.name as company_name FROM reviews r JOIN users u ON r.company_id = u.id WHERE r.user_id = $1 ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM reviews WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
