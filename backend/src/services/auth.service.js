const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

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

function mapUser(row) {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
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
    }
  );
}

async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  const [rows] = await pool.query(
    `SELECT
        id,
        full_name,
        email,
        password_hash,
        phone,
        role,
        status,
        created_at,
        updated_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [normalizedEmail]
  );

  return rows[0] || null;
}

async function findUserById(userId) {
  const [rows] = await pool.query(
    `SELECT
        id,
        full_name,
        email,
        phone,
        role,
        status,
        created_at,
        updated_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapUser(rows[0]);
}

async function registerUser({ fullName, email, password, phone }) {
  const normalizedEmail = normalizeEmail(email);
  const trimmedName = String(fullName || '').trim();
  const trimmedPhone = String(phone || '').trim() || null;

  if (!trimmedName || !normalizedEmail || !password) {
    throw createError(400, 'Thiếu thông tin bắt buộc để đăng ký.');
  }

  if (password.length < 6) {
    throw createError(400, 'Mật khẩu cần ít nhất 6 ký tự.');
  }

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw createError(409, 'Email này đã được sử dụng.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, phone, role, status)
     VALUES (?, ?, ?, ?, 'customer', 'active')`,
    [trimmedName, normalizedEmail, passwordHash, trimmedPhone]
  );

  const user = await findUserById(result.insertId);
  const token = signToken(user);

  return {
    token,
    user,
  };
}

async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    throw createError(400, 'Vui lòng nhập email và mật khẩu.');
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw createError(401, 'Email hoặc mật khẩu không đúng.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw createError(401, 'Email hoặc mật khẩu không đúng.');
  }

  if (user.status !== 'active') {
    throw createError(403, 'Tài khoản này hiện không hoạt động.');
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
};
