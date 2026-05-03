const nodemailer = require('nodemailer');

function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMail({ to, subject, html, text, attachments = [] }) {
  if (!isMailConfigured()) {
    return {
      skipped: true,
      reason: 'SMTP is not configured',
    };
  }

  const transporter = createTransporter();
  const from = process.env.MAIL_FROM || `"StayNest" <${process.env.SMTP_USER}>`;

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
    attachments,
  });
}

module.exports = {
  isMailConfigured,
  sendMail,
};
