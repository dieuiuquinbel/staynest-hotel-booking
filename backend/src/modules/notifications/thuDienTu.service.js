// Chức năng: Cấu hình và gửi email thông báo.
// Module email: cau hinh Nodemailer va ham gui thu dung chung.
const nodemailer = require('nodemailer');

let boGuiMail = null;

function daCauHinhGuiMail() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function taoBoGuiMail() {
  if (boGuiMail) return boGuiMail;

  boGuiMail = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 15000),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return boGuiMail;
}

async function guiMail({ to, subject, html, text, attachments = [] }) {
  if (!daCauHinhGuiMail()) {
    return {
      skipped: true,
      reason: 'SMTP is not configured',
    };
  }

  const transporter = taoBoGuiMail();
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
  daCauHinhGuiMail,
  guiMail,
};
