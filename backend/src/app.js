const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const { requireAuth } = require('./middleware/auth.middleware');
const { loginUser, registerUser, resendEmailOtp, verifyEmailOtp } = require('./services/auth.service');
const { createBooking, getInvoiceById, listInvoices } = require('./services/booking.service');
const {
  getRooms,
  getFeaturedRooms,
  getRoomById,
} = require('./services/room.service');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      message: 'Chi admin moi co quyen xem hoa don.',
    });
  }

  return next();
}

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({
      message: 'Backend is running',
      database: 'connected',
      result: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: 'Backend is running, but database connection failed',
      error: error.message,
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const session = await registerUser(req.body);
    res.status(201).json({
      message: 'Tao tai khoan thanh cong. Vui long xac minh email bang ma OTP.',
      data: session,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the tao tai khoan',
    });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const session = await verifyEmailOtp(req.body);
    res.json({
      message: 'Xac minh email thanh cong',
      data: session,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the xac minh email',
    });
  }
});

app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const result = await resendEmailOtp(req.body);
    res.json({
      message: 'Da gui lai ma OTP',
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the gui lai OTP',
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const session = await loginUser(req.body);
    res.json({
      message: 'Dang nhap thanh cong',
      data: session,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the dang nhap',
    });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  res.json({
    data: req.user,
  });
});

app.get('/api/rooms', async (req, res) => {
  try {
    const payload = await getRooms(req.query);
    res.json(payload);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch rooms',
      error: error.message,
    });
  }
});

app.get('/api/rooms/featured', async (req, res) => {
  try {
    const data = await getFeaturedRooms(req.query.limit);
    res.json({ data });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch featured rooms',
      error: error.message,
    });
  }
});

app.get('/api/rooms/:id', async (req, res) => {
  try {
    const room = await getRoomById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: 'Room not found',
      });
    }

    return res.json({ data: room });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch room detail',
      error: error.message,
    });
  }
});

app.post('/api/bookings', requireAuth, async (req, res) => {
  try {
    const result = await createBooking({
      user: req.user,
      payload: req.body,
    });

    res.status(201).json({
      message: 'Dat phong thanh cong',
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the dat phong',
    });
  }
});

app.get('/api/admin/invoices', requireAuth, requireAdmin, async (req, res) => {
  try {
    const invoices = await listInvoices();
    res.json({ data: invoices });
  } catch (error) {
    res.status(500).json({
      message: 'Khong the tai danh sach hoa don',
      error: error.message,
    });
  }
});

app.get('/api/admin/invoices/:id/download', requireAuth, requireAdmin, async (req, res) => {
  try {
    const invoice = await getInvoiceById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: 'Khong tim thay hoa don',
      });
    }

    return res.download(invoice.file_path, `${invoice.invoice_code}.html`);
  } catch (error) {
    return res.status(500).json({
      message: 'Khong the tai hoa don',
      error: error.message,
    });
  }
});

module.exports = app;
