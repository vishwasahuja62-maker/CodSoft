const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function buildEmailHtml({ subject, bodyTitle, bodyContent, actionText, actionUrl }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #0b0f19;
          color: #f3f4f6;
          margin: 0;
          padding: 40px 15px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #111827;
          border-radius: 12px;
          border: 1px solid #1f2937;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          padding: 30px;
          text-align: center;
        }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .content h2 { color: #ffffff; margin-top: 0; font-size: 20px; font-weight: 700; }
        .content p { color: #9ca3af; font-size: 16px; }
        .btn-wrapper { margin: 30px 0 10px 0; text-align: center; }
        .btn {
          display: inline-block; background: #6366f1; color: #ffffff !important;
          text-decoration: none; padding: 12px 28px; font-weight: 600;
          border-radius: 8px; transition: background 0.2s;
        }
        .footer { background-color: #0d121f; padding: 20px 30px; text-align: center; border-top: 1px solid #1f2937; }
        .footer p { margin: 0; font-size: 12px; color: #4b5563; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Antigravity Careers</h1></div>
        <div class="content">
          <h2>${bodyTitle}</h2>
          <p>${bodyContent}</p>
          ${actionText && actionUrl ? `<div class="btn-wrapper"><a href="${actionUrl}" class="btn" target="_blank">${actionText}</a></div>` : ''}
        </div>
        <div class="footer">
          <p>You received this email because you are registered on Antigravity Careers.</p>
          <p>&copy; 2026 Antigravity Careers. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendEmail({ to, subject, bodyTitle, bodyContent, actionText, actionUrl }) {
  if (!resend) {
    console.warn(`\n[WARN] Email not sent. RESEND_API_KEY is not configured in .env`);
    console.warn(`To: ${to} | Subject: ${subject}\n`);
    return;
  }

  const html = buildEmailHtml({ subject, bodyTitle, bodyContent, actionText, actionUrl });
  const fromEmail = process.env.SMTP_FROM || 'onboarding@resend.dev';

  try {
    const { data, error } = await resend.emails.send({
      from: `Antigravity Careers <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Failed to send email via Resend:', error);
    } else {
      console.log(`\n✉️ REAL EMAIL SENT via RESEND`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`ID: ${data.id}`);
      console.log(`==================================================\n`);
    }
  } catch (err) {
    console.error(`Exception while sending email via Resend: ${err.message}`);
  }
}

module.exports = { sendEmail };
