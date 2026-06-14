const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const alerts = await dbAll('SELECT * FROM saved_alerts WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { keywords, location, type, experience_level, frequency } = req.body;
    const result = await dbRun(
      'INSERT INTO saved_alerts (user_id, keywords, location, type, experience_level, frequency) VALUES ($1, $2, $3, $4, $5, $6)',
      [req.user.id, keywords || null, location || null, type || null, experience_level || null, frequency || 'daily']
    );
    res.status(201).json({ id: result.id, message: 'Alert created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM saved_alerts WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/check', async (req, res) => {
  try {
    const alerts = await dbAll('SELECT sa.*, u.email, u.name FROM saved_alerts sa JOIN users u ON u.id = sa.user_id WHERE sa.is_active = 1');
    let sent = 0;
    for (const alert of alerts) {
      let query = 'SELECT * FROM jobs WHERE is_active = 1';
      const params = [];
      const conditions = [];
      if (alert.keywords) {
        conditions.push(`(LOWER(title) LIKE $${params.length + 1} OR LOWER(description) LIKE $${params.length + 1})`);
        params.push(`%${alert.keywords.toLowerCase()}%`);
      }
      if (alert.location) {
        conditions.push(`LOWER(location) LIKE $${params.length + 1}`);
        params.push(`%${alert.location.toLowerCase()}%`);
      }
      if (alert.type) {
        conditions.push(`type = $${params.length + 1}`);
        params.push(alert.type);
      }
      if (alert.experience_level) {
        conditions.push(`experience_level = $${params.length + 1}`);
        params.push(alert.experience_level);
      }
      if (conditions.length) query += ' AND ' + conditions.join(' AND ');
      query += ' LIMIT 5';
      const jobs = await dbAll(query, params);
      if (jobs.length > 0) {
        const jobList = jobs.map(j => `- ${j.title} at ${j.company} (${j.location})`).join('\n');
        await sendEmail({
          to: alert.email,
          subject: 'Job Alert: New matching jobs found',
          html: `<h2>New Jobs For You</h2><pre>${jobList}</pre><p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/jobs">View all jobs</a></p>`
        });
        sent++;
      }
    }
    res.json({ checked: alerts.length, sent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
