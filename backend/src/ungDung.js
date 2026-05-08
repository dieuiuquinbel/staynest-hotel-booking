const express = require('express');
const cors = require('cors');
const ketNoiDb = require('./config/coSoDuLieu');
const { yeuCauDangNhap } = require('./middleware/xacThuc.middleware');
const { dangNhapTaiKhoan, dangKyTaiKhoan, guiLaiOtpEmail, xacMinhOtpEmail } = require('./services/xacThuc.service');
const { taoDatPhong, layHoaDonTheoId, layDanhSachHoaDon } = require('./services/datPhong.service');
const { xacNhanThanhToanDemo } = require('./services/thanhToan.service');
const {
  layDanhSachPhong,
  layPhongNoiBat,
  layPhongTheoId,
} = require('./services/phong.service');

const ungDung = express();

ungDung.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);

ungDung.use(express.json());

function yeuCauQuanTri(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      message: 'Chi admin moi co quyen xem hoa don.',
    });
  }

  return next();
}

ungDung.get('/api/health', async (req, res) => {
  try {
    const [rows] = await ketNoiDb.query('SELECT 1 AS ok');
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

ungDung.post('/api/auth/register', async (req, res) => {
  try {
    const session = await dangKyTaiKhoan(req.body);
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

ungDung.post('/api/auth/verify-email', async (req, res) => {
  try {
    const session = await xacMinhOtpEmail(req.body);
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

ungDung.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const result = await guiLaiOtpEmail(req.body);
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

ungDung.post('/api/auth/login', async (req, res) => {
  try {
    const session = await dangNhapTaiKhoan(req.body);
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

ungDung.get('/api/auth/me', yeuCauDangNhap, async (req, res) => {
  res.json({
    data: req.user,
  });
});

ungDung.get('/api/rooms', async (req, res) => {
  try {
    const payload = await layDanhSachPhong(req.query);
    res.json(payload);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch rooms',
      error: error.message,
    });
  }
});

ungDung.get('/api/rooms/featured', async (req, res) => {
  try {
    const data = await layPhongNoiBat(req.query.limit);
    res.json({ data });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch featured rooms',
      error: error.message,
    });
  }
});

ungDung.get('/api/rooms/:id', async (req, res) => {
  try {
    const room = await layPhongTheoId(req.params.id);

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

ungDung.post('/api/bookings', yeuCauDangNhap, async (req, res) => {
  try {
    const result = await taoDatPhong({
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

ungDung.post('/api/payments/demo-confirm', yeuCauDangNhap, async (req, res) => {
  try {
    const result = await xacNhanThanhToanDemo({
      user: req.user,
      payload: req.body,
    });

    res.status(201).json({
      message: 'Da ghi nhan thanh toan demo',
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the ghi nhan thanh toan demo',
    });
  }
});

ungDung.get('/api/admin/invoices', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const invoices = await layDanhSachHoaDon();
    res.json({ data: invoices });
  } catch (error) {
    res.status(500).json({
      message: 'Khong the tai danh sach hoa don',
      error: error.message,
    });
  }
});

ungDung.get('/api/admin/invoices/:id/download', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const invoice = await layHoaDonTheoId(req.params.id);

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

module.exports = ungDung;
