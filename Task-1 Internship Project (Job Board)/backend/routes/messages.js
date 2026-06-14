const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

// GET /api/messages - get all messages for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await dbAll(
      `SELECT m.id, m.subject, m.body, m.is_read, m.created_at,
              sender.id as sender_id, sender.name as sender_name, sender.email as sender_email, sender.role as sender_role,
              recipient.id as recipient_id, recipient.name as recipient_name, recipient.role as recipient_role,
              sp.title as sender_title, rp.title as recipient_title
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users recipient ON m.recipient_id = recipient.id
       LEFT JOIN profiles sp ON m.sender_id = sp.user_id
       LEFT JOIN profiles rp ON m.recipient_id = rp.user_id
       WHERE m.sender_id = ? OR m.recipient_id = ?
       ORDER BY m.created_at DESC`,
      [userId, userId]
    );

    // Group by conversation partner and return latest message per conversation
    const conversations = {};
    for (const msg of messages) {
      const otherId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
      const otherName = msg.sender_id === userId ? msg.recipient_name : msg.sender_name;
      const otherRole = msg.sender_id === userId ? msg.recipient_role : msg.sender_role;
      const otherTitle = msg.sender_id === userId ? msg.recipient_title : msg.sender_title;
      if (!conversations[otherId] || new Date(msg.created_at) > new Date(conversations[otherId].created_at)) {
        conversations[otherId] = {
          id: msg.id,
          contact_id: otherId,
          contact_name: otherName,
          company: otherRole === 'employer' ? otherName : otherName,
          role: otherTitle || (otherRole === 'employer' ? 'Employer' : 'Candidate'),
          subject: msg.subject,
          lastMsg: msg.body,
          time: msg.created_at,
          unread: msg.is_read === 0 && msg.recipient_id === userId,
          avatar: otherName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        };
      }
    }

    res.json(Object.values(conversations));
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/messages/:contactId - get full thread with a contact
router.get('/:contactId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const contactId = parseInt(req.params.contactId, 10);

    const messages = await dbAll(
      `SELECT m.*,
              sender.name as sender_name,
              recipient.name as recipient_name
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users recipient ON m.recipient_id = recipient.id
       WHERE (m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?)
       ORDER BY m.created_at ASC`,
      [userId, contactId, contactId, userId]
    );

    // Mark messages as read
    await dbRun(
      'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND recipient_id = ? AND is_read = 0',
      [contactId, userId]
    );

    res.json(messages);
  } catch (error) {
    console.error('Fetch message thread error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/messages - send a new message
router.post('/', authenticateToken, async (req, res) => {
  const { recipient_id, subject, body } = req.body;

  if (!recipient_id || !subject || !body) {
    return res.status(400).json({ error: 'recipient_id, subject, and body are required.' });
  }

  try {
    const result = await dbRun(
      'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
      [req.user.id, recipient_id, subject, body]
    );

    // Get recipient email for notification
    const recipient = await dbGet('SELECT email, name FROM users WHERE id = ?', [recipient_id]);

    // Send email notification
    await sendEmail({
      to: recipient.email,
      subject: `New message: ${subject}`,
      bodyTitle: 'New Message Received',
      bodyContent: `Hello ${recipient.name},<br/><br/>You have received a new message from <strong>${req.user.name}</strong> regarding: <strong>${subject}</strong><br/><br/>${body}`,
      actionText: 'View Messages',
      actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?tab=messages`,
    });

    // Create notification for recipient
    await dbRun(
      `INSERT INTO notifications (user_id, type, message) VALUES (?, 'message', ?)`,
      [recipient_id, `New message from ${req.user.name}: ${subject}`]
    );

    res.status(201).json({
      message: 'Message sent successfully.',
      messageId: result.lastID,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/messages/unread/count - get unread message count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const row = await dbGet(
      'SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.json({ count: row.count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
