/**
 * email.js — Compatibility shim over emailService.js (Resend)
 * All routes (auth, password, verification) import from here.
 * This keeps their call signatures intact while sending via Resend.
 */
const { sendEmail } = require('./emailService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Verification Email ──────────────────────────────────────
function verificationEmail(name, token) {
  const link = `${FRONTEND_URL}/verify-email?token=${token}`;
  return {
    subject: 'Verify your email - Antigravity Careers',
    bodyTitle: 'Verify Your Email Address',
    bodyContent: `Hi ${name},<br><br>Thank you for joining Antigravity Careers! Please verify your email address by clicking the button below. This link expires in <strong>24 hours</strong>.`,
    actionText: 'Verify Email',
    actionUrl: link,
  };
}

// ── Password Reset Email ────────────────────────────────────
function resetPasswordEmail(name, token) {
  const link = `${FRONTEND_URL}/reset-password?token=${token}`;
  return {
    subject: 'Reset your password - Antigravity Careers',
    bodyTitle: 'Reset Your Password',
    bodyContent: `Hi ${name},<br><br>We received a request to reset your password. Click the button below to proceed. This link expires in <strong>1 hour</strong>.<br><br>If you didn't request this, you can safely ignore this email.`,
    actionText: 'Reset Password',
    actionUrl: link,
  };
}

// ── Offer Letter Email ──────────────────────────────────────
function offerLetterEmail(name, company) {
  return {
    subject: `You've received an offer letter from ${company}!`,
    bodyTitle: '🎉 Congratulations! You Have an Offer!',
    bodyContent: `Hi ${name},<br><br>Congratulations! You've received an offer letter from <strong>${company}</strong>. Log in to your dashboard to review and respond to the offer.`,
    actionText: 'View Offer',
    actionUrl: `${FRONTEND_URL}/dashboard`,
  };
}

/**
 * Unified sendEmail wrapper — accepts both old-style { to, subject, html }
 * and new-style { to, subject, bodyTitle, bodyContent, actionText, actionUrl }.
 * Old callers pass { subject, html } from verificationEmail/resetPasswordEmail
 * but now those return bodyTitle/bodyContent etc., so this just forwards to Resend.
 */
async function sendEmailCompat({ to, subject, html, bodyTitle, bodyContent, actionText, actionUrl }) {
  // If called with the new structured format (from this module's helpers)
  if (bodyTitle) {
    return sendEmail({ to, subject, bodyTitle, bodyContent, actionText, actionUrl });
  }
  // Fallback for any direct html calls
  return sendEmail({ to, subject, bodyTitle: subject, bodyContent: html || '' });
}

module.exports = {
  sendEmail: sendEmailCompat,
  verificationEmail,
  resetPasswordEmail,
  offerLetterEmail,
};
