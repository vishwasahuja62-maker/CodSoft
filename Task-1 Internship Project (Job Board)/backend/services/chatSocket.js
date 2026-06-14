const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { dbRun, dbGet } = require('../database');

module.exports = function (server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    const room = `user_${userId}`;
    socket.join(room);

    socket.on('private_message', async (data) => {
      const { to: recipientId, text } = data;
      if (!recipientId || !text) return;

      try {
        const result = await dbRun(
          'INSERT INTO messages (sender_id, recipient_id, subject, body, is_read) VALUES ($1, $2, $3, $4, 0) RETURNING *',
          [userId, recipientId, text.substring(0, 100), text]
        );

        const newMessage = result.lastID
          ? await dbGet('SELECT * FROM messages WHERE id = $1', [result.lastID])
          : { id: result.lastID, sender_id: userId, recipient_id: recipientId, subject: text.substring(0, 100), body: text, is_read: 0 };

        io.to(`user_${userId}`).to(`user_${recipientId}`).emit('new_message', newMessage);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('mark_read', async (data) => {
      const { contactId } = data;
      if (!contactId) return;

      try {
        await dbRun(
          'UPDATE messages SET is_read = 1 WHERE sender_id = $1 AND recipient_id = $2 AND is_read = 0',
          [contactId, userId]
        );

        io.to(`user_${contactId}`).emit('messages_read', { readBy: userId });
      } catch (err) {
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    socket.on('disconnect', () => {
      // no cleanup needed
    });
  });
};
