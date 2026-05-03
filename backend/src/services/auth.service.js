const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { isMailConfigured, sendMail } = require('./mail.service');

const JWT_SECRET = process.env.JWT_SECRET || 'staynest_dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function normalizeUsername(username = '') {
  return String(username).trim().toLowerCase();
}

function createUsernameFallback(fullName = '', email = '') {
  const base =
    normalizeUsername(fullName)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 24) || normalizeEmail(email).split('@')[0] || 'user';

  return `${base}${String(Date.now()).slice(-4)}`;
}

function mapUser(row) {
  return {
    id: row.id,
    full_name: row.full_name,
    username: row.username,
    email: row.email,
    phone: row.phone,
    email_verified: Boolean(row.email_verified),
    role: row.role,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    },
  );
}

async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  const [rows] = await pool.query(
    `SELECT
        id,
        full_name,
        username,
        email,
        password_hash,
        phone,
        email_verified,
        role,
        status,
        created_at,
        updated_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [normalizedEmail],
  );

  return rows[0] || null;
}

async function findUserByUsername(username) {
  const normalizedUsername = normalizeUsername(username);
  const [rows] = await pool.query(
    `SELECT
        id,
        full_name,
        username,
        email,
        password_hash,
        phone,
        email_verified,
        role,
        status,
        created_at,
        updated_at
     FROM users
     WHERE username = ?
     LIMIT 1`,
    [normalizedUsername],
  );

  return rows[0] || null;
}

async function findUserByIdentifier(identifier) {
  const value = String(identifier || '').trim().toLowerCase();
  if (!value) return null;

  const [rows] = await pool.query(
    `SELECT
        id,
        full_name,
        username,
        email,
        password_hash,
        phone,
        email_verified,
        role,
        status,
        created_at,
        updated_at
     FROM users
     WHERE email = ? OR username = ?
     LIMIT 1`,
    [value, value],
  );

  return rows[0] || null;
}

async function findUserById(userId) {
  const [rows] = await pool.query(
    `SELECT
        id,
        full_name,
        username,
        email,
        phone,
        email_verified,
        role,
        status,
        created_at,
        updated_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId],
  );

  if (rows.length === 0) {
    return null;
  }

  return mapUser(rows[0]);
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

async function sendEmailVerificationOtp(user) {
  const otp = generateOtp();
  const otpHash = hashOtp(otp);

  await pool.query(
    `INSERT INTO email_otps (user_id, email, otp_hash, expires_at)
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
    [user.id, user.email, otpHash],
  );

  const mailResult = await sendMail({
    to: user.email,
    subject: 'Ma xac minh tai khoan StayNest',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2>Xac minh tai khoan StayNest</h2>
        <p>Ma OTP cua ban la:</p>
        <p style="font-size:32px;font-weight:800;letter-spacing:6px;color:#1d4ed8">${otp}</p>
        <p>Ma co hieu luc trong 10 phut. Neu ban khong tao tai khoan, vui long bo qua email nay.</p>
      </div>
    `,
    text: `Ma OTP StayNest cua ban la ${otp}. Ma co hieu luc trong 10 phut.`,
  });

  return {
    mailSkipped: Boolean(mailResult?.skipped),
    devOtp: process.env.NODE_ENV === 'production' || isMailConfigured() ? undefined : otp,
  };
}

async function registerUser({ fullName, username, email, password, phone }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = normalizeUsername(username) || createUsernameFallback(fullName, email);
  const trimmedName = String(fullName || '').trim();
  const trimmedPhone = String(phone || '').trim() || null;

  if (!trimmedName || !normalizedEmail || !password) {
    throw createError(400, 'Thieu thong tin bat buoc de dang ky.');
  }

  if (password.length < 6) {
    throw createError(400, 'Mat khau can it nhat 6 ky tu.');
  }

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw createError(409, 'Email nay da duoc su dung.');
  }

  const existingUsername = await findUserByUsername(normalizedUsername);

  if (existingUsername) {
    throw createError(409, 'Ten tai khoan nay da duoc su dung.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    `INSERT INTO users (full_name, username, email, password_hash, phone, email_verified, role, status)
     VALUES (?, ?, ?, ?, ?, FALSE, 'customer', 'active')`,
    [trimmedName, normalizedUsername, normalizedEmail, passwordHash, trimmedPhone],
  );

  const user = await findUserById(result.insertId);
  const otpResult = await sendEmailVerificationOtp(user);

  return {
    otpRequired: true,
    email: user.email,
    user,
    ...otpResult,
  };
}

async function verifyEmailOtp({ email, otp }) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !otp) {
    throw createError(400, 'Vui long nhap email va ma OTP.');
  }

  const [rows] = await pool.query(
    `SELECT id, user_id
     FROM email_otps
     WHERE email = ?
       AND otp_hash = ?
       AND used_at IS NULL
       AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [normalizedEmail, hashOtp(otp)],
  );

  if (!rows.length) {
    throw createError(400, 'Ma OTP khong dung hoac da het han.');
  }

  await pool.query('UPDATE email_otps SET used_at = NOW() WHERE id = ?', [rows[0].id]);
  await pool.query('UPDATE users SET email_verified = TRUE WHERE id = ?', [rows[0].user_id]);

  const user = await findUserById(rows[0].user_id);

  return {
    token: signToken(user),
    user,
  };
}

async function resendEmailOtp({ email }) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw createError(404, 'Khong tim thay tai khoan voi email nay.');
  }

  if (user.email_verified) {
    throw createError(400, 'Email nay da duoc xac minh.');
  }

  return {
    email: user.email,
    ...(await sendEmailVerificationOtp(mapUser(user))),
  };
}

async function loginUser({ email, identifier, password }) {
  const loginIdentifier = String(identifier || email || '').trim();

  if (!loginIdentifier || !password) {
    throw createError(400, 'Vui long nhap email/ten tai khoan va mat khau.');
  }

  const user = await findUserByIdentifier(loginIdentifier);

  if (!user) {
    throw createError(401, 'Email/ten tai khoan hoac mat khau khong dung.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw createError(401, 'Email/ten tai khoan hoac mat khau khong dung.');
  }

  if (user.status !== 'active') {
    throw createError(403, 'Tai khoan nay hien khong hoat dong.');
  }

  const safeUser = mapUser(user);

  return {
    token: signToken(safeUser),
    user: safeUser,
  };
}

module.exports = {
  findUserById,
  loginUser,
  registerUser,
  resendEmailOtp,
  verifyEmailOtp,
};
