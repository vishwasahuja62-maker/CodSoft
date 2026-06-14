const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

// POST /api/applications - Candidate applies for a job
router.post('/', authenticateToken, requireRole('candidate'), async (req, res) => {
  const { job_id, cover_letter, resume_url } = req.body;

  if (!job_id) {
    return res.status(400).json({ error: 'Job ID is required.' });
  }

  try {
    // 1. Verify job exists
    const job = await dbGet(
      `SELECT j.*, u.email as employer_email, u.name as employer_name 
       FROM jobs j
       JOIN users u ON j.employer_id = u.id 
       WHERE j.id = ?`,
      [job_id]
    );

    if (!job) {
      return res.status(404).json({ error: 'Job listing not found.' });
    }

    // 2. Check if already applied
    const existingApp = await dbGet(
      'SELECT id FROM applications WHERE job_id = ? AND candidate_id = ?',
      [job_id, req.user.id]
    );

    if (existingApp) {
      return res.status(400).json({ error: 'You have already applied for this job opening.' });
    }

    // 3. Get resume url (either passed or from profile)
    let finalResumeUrl = resume_url;
    if (!finalResumeUrl) {
      const profile = await dbGet('SELECT resume_url FROM profiles WHERE user_id = ?', [
        req.user.id,
      ]);
      if (profile && profile.resume_url) {
        finalResumeUrl = profile.resume_url;
      }
    }

    if (!finalResumeUrl) {
      return res.status(400).json({
        error: 'Please upload a resume on your dashboard before applying, or attach a resume in the form.',
      });
    }

    // 4. Create application
    const result = await dbRun(
      `INSERT INTO applications (job_id, candidate_id, cover_letter, resume_url, status)
       VALUES (?, ?, ?, ?, 'applied')`,
      [job_id, req.user.id, cover_letter || '', finalResumeUrl]
    );

    // 5. Send Email Notifications
    // Notification for Candidate
    sendEmail({
      to: req.user.email,
      subject: `Application Submitted: ${job.title} at ${job.company_name}`,
      bodyTitle: `Application Received!`,
      bodyContent: `Hello ${req.user.name},<br/><br/>Your application for the <strong>${job.title}</strong> position at <strong>${job.company_name}</strong> has been successfully submitted. The hiring manager has been notified and will review your profile.`,
      actionText: 'View Applications Dashboard',
      actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
    });

    // Notification for Employer
    sendEmail({
      to: job.employer_email,
      subject: `New Application: ${job.title} by ${req.user.name}`,
      bodyTitle: `New Applicant alert!`,
      bodyContent: `Hello ${job.employer_name},<br/><br/>A new candidate, <strong>${req.user.name}</strong>, has applied for your job opening: <strong>${job.title}</strong>.<br/><br/>Please review their profile and cover letter from your employer dashboard.`,
      actionText: 'Review Applicants',
      actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
    });

    // Create notification for employer
    dbRun(
      `INSERT INTO notifications (user_id, type, message) VALUES (?, 'status', ?)`,
      [job.employer_id, `${req.user.name} applied for ${job.title}`]
    );

    res.status(201).json({
      message: 'Application submitted successfully.',
      applicationId: result.lastID,
    });
  } catch (error) {
    console.error('Job application error:', error);
    res.status(500).json({ error: 'Internal server error while applying for job.' });
  }
});

// GET /api/applications/candidate - Candidate views their applied jobs
router.get('/candidate', authenticateToken, requireRole('candidate'), async (req, res) => {
  try {
    const query = `
      SELECT a.id as application_id, a.cover_letter, a.resume_url, a.status, a.created_at as applied_at,
             j.id as job_id, j.title as job_title, j.company_name, j.location, j.type as job_type, j.salary_range
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.candidate_id = ?
      ORDER BY a.created_at DESC
    `;
    const applications = await dbAll(query, [req.user.id]);
    res.json(applications);
  } catch (error) {
    console.error('Fetch candidate applications error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/applications/employer/:jobId - Employer views applicants for a job
router.get('/employer/:jobId', authenticateToken, requireRole('employer'), async (req, res) => {
  const { jobId } = req.params;

  try {
    // Verify job belongs to employer
    const job = await dbGet('SELECT id FROM jobs WHERE id = ? AND employer_id = ?', [
      jobId,
      req.user.id,
    ]);

    if (!job) {
      return res.status(403).json({ error: 'Forbidden: You do not own this job opening.' });
    }

    const query = `
      SELECT a.id as application_id, a.cover_letter, a.resume_url, a.status, a.created_at as applied_at,
             u.id as candidate_id, u.name as candidate_name, u.email as candidate_email,
             p.title as candidate_title, p.bio as candidate_bio, p.skills as candidate_skills, p.experience, p.education
      FROM applications a
      JOIN users u ON a.candidate_id = u.id
      LEFT JOIN profiles p ON a.candidate_id = p.user_id
      WHERE a.job_id = ?
      ORDER BY a.created_at DESC
    `;

    const applicants = await dbAll(query, [jobId]);
    res.json(applicants);
  } catch (error) {
    console.error('Fetch employer applications error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/applications/:id/status - Update application status (Employer Only)
router.patch('/:id/status', authenticateToken, requireRole('employer'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['applied', 'reviewing', 'interviewing', 'accepted', 'rejected'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid application status.' });
  }

  try {
    // Verify application exists and job belongs to employer
    const application = await dbGet(
      `SELECT a.*, j.title as job_title, j.employer_id, u.email as candidate_email, u.name as candidate_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON a.candidate_id = u.id
       WHERE a.id = ?`,
      [id]
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (application.employer_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own the job posting for this application.' });
    }

    // Update status
    await dbRun('UPDATE applications SET status = ? WHERE id = ?', [status, id]);

    // Send status email notification
    let bodyTitle = '';
    let bodyContent = '';

    if (status === 'reviewing') {
      bodyTitle = 'Application Under Review';
      bodyContent = `Hello ${application.candidate_name},<br/><br/>Your application for the <strong>${application.job_title}</strong> role is currently being reviewed by the hiring team. We will contact you shortly if your credentials align with our needs.`;
    } else if (status === 'interviewing') {
      bodyTitle = 'Invitation to Interview!';
      bodyContent = `Congratulations ${application.candidate_name},<br/><br/>The hiring team is impressed with your profile and would like to schedule an interview for the <strong>${application.job_title}</strong> position.<br/><br/>Please check your inbox or reply to this message to coordinate convenient time slots.`;
    } else if (status === 'accepted') {
      bodyTitle = 'Offer Letter Update';
      bodyContent = `Amazing news ${application.candidate_name}!<br/><br/>We are excited to extend an offer for the <strong>${application.job_title}</strong> role. The hiring manager will follow up with complete offer documentation and onboarding requirements shortly. Welcome aboard!`;
    } else if (status === 'rejected') {
      bodyTitle = 'Application Update';
      bodyContent = `Hello ${application.candidate_name},<br/><br/>Thank you for your interest in the <strong>${application.job_title}</strong> position and for taking the time to apply.<br/><br/>Unfortunately, we have decided to move forward with other candidates whose experience more closely matches our immediate needs. We wish you the best of luck in your job search.`;
    } else {
      bodyTitle = 'Application Status Updated';
      bodyContent = `Hello ${application.candidate_name},<br/><br/>The status of your application for <strong>${application.job_title}</strong> has been updated to <strong>${status}</strong>.`;
    }

    sendEmail({
      to: application.candidate_email,
      subject: `Application Status Update: ${application.job_title}`,
      bodyTitle,
      bodyContent,
      actionText: 'View Dashboard',
      actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
    });

    // Create notification for candidate
    dbRun(
      `INSERT INTO notifications (user_id, type, message) VALUES (?, 'status', ?)`,
      [application.candidate_id, `Your application for ${application.job_title} is now: ${status}`]
    );

    res.json({
      message: 'Application status updated successfully.',
      status,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
