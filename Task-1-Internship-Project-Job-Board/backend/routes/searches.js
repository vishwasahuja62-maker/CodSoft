const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const searches = await dbAll(
      'SELECT * FROM saved_searches WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(searches.map(s => ({ ...s, filters: typeof s.filters === 'string' ? JSON.parse(s.filters) : s.filters })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, filters, notify } = req.body;
  if (!name || !filters) return res.status(400).json({ error: 'Name and filters are required' });
  try {
    const result = await dbRun(
      'INSERT INTO saved_searches (user_id, name, filters, notify) VALUES ($1, $2, $3, $4)',
      [req.user.id, name, JSON.stringify(filters), notify ? 1 : 0]
    );
    const search = await dbGet('SELECT * FROM saved_searches WHERE id = $1', [result.lastID]);
    if (search) search.filters = JSON.parse(search.filters);
    res.status(201).json(search);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, filters, notify } = req.body;
  try {
    await dbRun(
      'UPDATE saved_searches SET name = $1, filters = $2, notify = $3 WHERE id = $4 AND user_id = $5',
      [name, JSON.stringify(filters), notify ? 1 : 0, req.params.id, req.user.id]
    );
    res.json({ message: 'Search updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM saved_searches WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Search deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
