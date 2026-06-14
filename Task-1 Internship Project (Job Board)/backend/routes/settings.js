const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/settings/notifications - get notification preferences
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    let settings = await dbGet(
      'SELECT * FROM notification_settings WHERE user_id = ?',
      [req.user.id]
    );

    if (!settings) {
      // Create default settings
      await dbRun(
        `INSERT INTO notification_settings (user_id) VALUES (?)`,
        [req.user.id]
      );
      settings = await dbGet(
        'SELECT * FROM notification_settings WHERE user_id = ?',
        [req.user.id]
      );
    }

    res.json({
      application_updates: settings.application_updates === 1,
      job_alerts: settings.job_alerts === 1,
      message_notifications: settings.message_notifications === 1,
      weekly_digest: settings.weekly_digest === 1,
      marketing_emails: settings.marketing_emails === 1,
    });
  } catch (error) {
    console.error('Fetch notification settings error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/settings/notifications - update notification preferences
router.put('/notifications', authenticateToken, async (req, res) => {
  const { application_updates, job_alerts, message_notifications, weekly_digest, marketing_emails } = req.body;

  try {
    // Ensure settings row exists
    let settings = await dbGet(
      'SELECT id FROM notification_settings WHERE user_id = ?',
      [req.user.id]
    );

    if (!settings) {
      await dbRun(
        `INSERT INTO notification_settings (user_id) VALUES (?)`,
        [req.user.id]
      );
    }

    await dbRun(
      `UPDATE notification_settings SET
        application_updates = ?,
        job_alerts = ?,
        message_notifications = ?,
        weekly_digest = ?,
        marketing_emails = ?
       WHERE user_id = ?`,
      [
        application_updates ? 1 : 0,
        job_alerts ? 1 : 0,
        message_notifications ? 1 : 0,
        weekly_digest ? 1 : 0,
        marketing_emails ? 1 : 0,
        req.user.id,
      ]
    );

    res.json({ message: 'Notification settings updated.' });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/settings/newsletter - subscribe to newsletter
router.post('/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  try {
    await dbRun(
      'INSERT OR IGNORE INTO newsletter_subscriptions (email) VALUES (?)',
      [email]
    );
    res.json({ message: 'Successfully subscribed to the newsletter!' });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
