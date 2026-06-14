const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/notifications - get all notifications for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await dbAll(
      `SELECT id, type, message, is_read as "read", created_at as time
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    // Format time as relative string
    const now = new Date();
    const formatted = notifications.map(n => {
      const diffMs = now - new Date(n.time);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      let timeStr;
      if (diffMins < 60) timeStr = `${diffMins}m ago`;
      else if (diffHours < 24) timeStr = `${diffHours}h ago`;
      else if (diffDays < 7) timeStr = `${diffDays}d ago`;
      else if (diffDays < 30) timeStr = `${Math.floor(diffDays / 7)}w ago`;
      else timeStr = `${Math.floor(diffDays / 30)}mo ago`;

      return { ...n, read: n.read === 1, time: timeStr };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/notifications/:id/read - mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notif = await dbGet(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!notif) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    await dbRun('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/notifications/read-all - mark all notifications as read
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    await dbRun('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/notifications/unread/count - get unread notification count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const row = await dbGet(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.json({ count: row.count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
