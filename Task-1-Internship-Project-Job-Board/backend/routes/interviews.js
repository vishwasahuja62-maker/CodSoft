const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const user = req.user;
    let interviews;
    if (user.role === 'employer') {
      interviews = await dbAll(
        `SELECT i.*, u.name AS candidate_name, u.email AS candidate_email, j.title AS job_title
         FROM interviews i
         JOIN users u ON u.id = i.candidate_id
         JOIN applications a ON a.id = i.application_id
         JOIN jobs j ON j.id = a.job_id
         WHERE i.employer_id = $1
         ORDER BY i.scheduled_at DESC`,
        [user.id]
      );
    } else {
      interviews = await dbAll(
        `SELECT i.*, u.name AS employer_name, u.email AS employer_email, j.title AS job_title
         FROM interviews i
         JOIN users u ON u.id = i.employer_id
         JOIN applications a ON a.id = i.application_id
         JOIN jobs j ON j.id = a.job_id
         WHERE i.candidate_id = $1
         ORDER BY i.scheduled_at DESC`,
        [user.id]
      );
    }
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { application_id, candidate_id, scheduled_at, duration_minutes, notes } = req.body;
    const result = await dbRun(
      'INSERT INTO interviews (application_id, employer_id, candidate_id, scheduled_at, duration_minutes, notes) VALUES ($1, $2, $3, $4, $5, $6)',
      [application_id, req.user.id, candidate_id, scheduled_at, duration_minutes || 60, notes || null]
    );
    const candidate = await dbGet('SELECT name, email FROM users WHERE id = $1', [candidate_id]);
    const job = await dbGet(
      'SELECT j.title FROM jobs j JOIN applications a ON a.job_id = j.id WHERE a.id = $1',
      [application_id]
    );
    await sendEmail({
      to: candidate.email,
      subject: `Interview Scheduled: ${job.title}`,
      html: `<h2>Interview Scheduled</h2>
             <p>You have an interview for <strong>${job.title}</strong> on ${new Date(scheduled_at).toLocaleString()}.</p>
             ${notes ? `<p>Notes: ${notes}</p>` : ''}`
    });
    res.status(201).json({ id: result.id, message: 'Interview scheduled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await dbRun('UPDATE interviews SET status = $1 WHERE id = $2 AND employer_id = $3', [status, req.params.id, req.user.id]);
    res.json({ message: 'Interview updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
