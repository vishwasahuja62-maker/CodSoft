const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { dbGet, dbAll, dbRun } = require('../database');

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

router.use(authenticateToken, requireAdmin);

router.get('/users', async (req, res) => {
  try {
    const users = await dbAll(`
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             p.company_name, p.title, p.bio, p.skills
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
    `);
    res.json(users);
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

router.patch('/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['employer', 'candidate', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be employer, candidate, or admin.' });
  }

  try {
    await dbRun('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    res.json({ message: 'Role updated successfully.' });
  } catch (error) {
    console.error('Admin update role error:', error);
    res.status(500).json({ error: 'Failed to update role.' });
  }
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

router.get('/jobs', async (req, res) => {
  try {
    const jobs = await dbAll(`
      SELECT j.*, u.name AS employer_name, u.email AS employer_email
      FROM jobs j
      LEFT JOIN users u ON j.employer_id = u.id
      ORDER BY j.created_at DESC
    `);
    res.json(jobs);
  } catch (error) {
    console.error('Admin list jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
});

router.delete('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM jobs WHERE id = $1', [id]);
    res.json({ message: 'Job deleted successfully.' });
  } catch (error) {
    console.error('Admin delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job.' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await dbGet('SELECT COUNT(*) as count FROM users');
    const usersByRole = await dbAll('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    const totalJobs = await dbGet('SELECT COUNT(*) as count FROM jobs');
    const totalApplications = await dbGet('SELECT COUNT(*) as count FROM applications');
    const totalMessages = await dbGet('SELECT COUNT(*) as count FROM messages');
    const applicationsByStatus = await dbAll('SELECT status, COUNT(*) as count FROM applications GROUP BY status');
    const jobsByType = await dbAll('SELECT type, COUNT(*) as count FROM jobs GROUP BY type');

    res.json({
      totalUsers: parseInt(totalUsers.count),
      usersByRole: usersByRole.map(r => ({ role: r.role, count: parseInt(r.count) })),
      totalJobs: parseInt(totalJobs.count),
      totalApplications: parseInt(totalApplications.count),
      totalMessages: parseInt(totalMessages.count),
      applicationsByStatus: applicationsByStatus.map(r => ({ status: r.status, count: parseInt(r.count) })),
      jobsByType: jobsByType.map(r => ({ type: r.type, count: parseInt(r.count) })),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

module.exports = router;
