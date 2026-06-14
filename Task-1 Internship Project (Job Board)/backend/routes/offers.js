const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

router.use(authenticateToken);

router.get('/candidate', async (req, res) => {
  try {
    const offers = await dbAll(
      `SELECT o.*, j.title as job_title, u.name as company_name
       FROM offer_letters o
       JOIN applications a ON o.application_id = a.id
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON o.employer_id = u.id
       WHERE o.candidate_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/employer', authenticateToken, requireRole('employer'), async (req, res) => {
  try {
    const offers = await dbAll(
      `SELECT o.*, j.title as job_title, u.name as candidate_name, a.candidate_id
       FROM offer_letters o
       JOIN applications a ON o.application_id = a.id
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON o.candidate_id = u.id
       WHERE o.employer_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, requireRole('employer'), async (req, res) => {
  const { application_id, title, content, salary } = req.body;
  if (!application_id || !title || !content) return res.status(400).json({ error: 'Application ID, title, and content are required' });
  try {
    const app = await dbGet('SELECT * FROM applications WHERE id = $1', [application_id]);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    if (app.status !== 'accepted') return res.status(400).json({ error: 'Application must be in accepted status' });
    const result = await dbRun(
      'INSERT INTO offer_letters (application_id, employer_id, candidate_id, title, content, salary) VALUES ($1, $2, $3, $4, $5, $6)',
      [application_id, req.user.id, app.candidate_id, title, content, salary || '']
    );
    const candidate = await dbGet('SELECT * FROM users WHERE id = $1', [app.candidate_id]);
    const employer = await dbGet('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (candidate && employer) {
      await sendEmail({
        to: candidate.email,
        subject: `You have received an offer letter from ${employer.name}`,
        bodyTitle: 'Congratulations! You have an offer! 🎉',
        bodyContent: `${employer.name} has sent you an offer letter for the position: <strong>${title}</strong>. Please log in to review and respond to the offer.`,
        actionText: 'View Offer Letter',
        actionUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      });
    }
    await dbRun(
      "INSERT INTO notifications (user_id, type, message) VALUES ($1, 'status', $2)",
      [app.candidate_id, `You received an offer letter for ${title} from ${employer.name}`]
    );
    res.status(201).json({ message: 'Offer letter sent', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/respond', async (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'declined'].includes(status)) return res.status(400).json({ error: 'Status must be accepted or declined' });
  try {
    const offer = await dbGet('SELECT * FROM offer_letters WHERE id = $1 AND candidate_id = $2', [req.params.id, req.user.id]);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    await dbRun('UPDATE offer_letters SET status = $1, signed_at = NOW() WHERE id = $2', [status, req.params.id]);
    res.json({ message: `Offer ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
