const express = require('express');
const cors = require('cors');
const ketNoiDb = require('./config/coSoDuLieu');
const { yeuCauDangNhap } = require('./middleware/xacThuc.middleware');
const { dangNhapTaiKhoan, dangKyTaiKhoan, guiLaiOtpEmail, xacMinhOtpEmail } = require('./services/xacThuc.service');
const { taoDatPhong, layHoaDonTheoId, layDanhSachHoaDon } = require('./services/datPhong.service');
const { xacNhanThanhToanDemo } = require('./services/thanhToan.service');
const {
  TRANG_THAI_DAT_PHONG,
  layDatPhongCuaNguoiDung,
  layTatCaDatPhong,
  capNhatTrangThaiDatPhong,
  xacNhanThanhToan,
  luuGhiChuAdmin,
  guiPhanHoiKhachHang,
  taoYeuCauHoanTien,
  layYeuCauHoanTienCuaToi,
  layTatCaYeuCauHoanTien,
  capNhatYeuCauHoanTien,
  guiYeuCauHoTro,
  layYeuCauHoTroCuaToi,
  layTatCaYeuCauHoTro,
  capNhatYeuCauHoTro,
  layBaoCaoDoanhThu,
} = require('./services/quanLyDatPhong.service');
const {
  layDanhSachPhong,
  layPhongNoiBat,
  layPhongTheoId,
} = require('./services/phong.service');
const {
  layDanhSachVoucher,
  layVoucherCuaNguoiDung,
  luuVoucherChoNguoiDung,
} = require('./services/voucher.service');
const {
  layTongQuanQuanTri,
  layDanhSachKhachHang,
  layChiTietKhachHang,
  capNhatKhachHang,
  capNhatTrangThaiKhachHang,
  xoaKhachHang,
} = require('./services/quanTri.service');

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
      message: 'Ban khong co quyen han nay.',
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

ungDung.get('/api/vouchers', async (req, res) => {
  try {
    const data = await layDanhSachVoucher(req.user?.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the tai danh sach voucher',
    });
  }
});

ungDung.get('/api/me/vouchers', yeuCauDangNhap, async (req, res) => {
  try {
    const data = await layVoucherCuaNguoiDung(req.user.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the tai kho voucher',
    });
  }
});

ungDung.post('/api/me/vouchers', yeuCauDangNhap, async (req, res) => {
  try {
    const data = await luuVoucherChoNguoiDung(req.user.id, req.body.code);
    res.status(201).json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the luu voucher',
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

ungDung.get('/api/bookings/my', yeuCauDangNhap, async (req, res) => {
  try {
    const data = await layDatPhongCuaNguoiDung(req.user.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the tai danh sach dat phong',
    });
  }
});

ungDung.post('/api/bookings/:id/feedbacks', yeuCauDangNhap, async (req, res) => {
  try {
    const data = await guiPhanHoiKhachHang({
      user: req.user,
      bookingCode: req.params.id,
      payload: req.body,
    });

    res.status(201).json({
      message: 'Da gui phan hoi',
      data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the gui phan hoi',
    });
  }
});

ungDung.get('/api/me/refund-requests', yeuCauDangNhap, async (req, res) => {
  try {
    const data = await layYeuCauHoanTienCuaToi(req.user.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the tai danh sach yeu cau hoan tien',
    });
  }
});

ungDung.post('/api/bookings/:id/refund-requests', yeuCauDangNhap, async (req, res) => {
  try {
    const data = await taoYeuCauHoanTien({
      user: req.user,
      bookingCode: req.params.id,
      payload: req.body,
    });

    res.status(201).json({
      message: 'Da tao yeu cau huy/hoan tien',
      data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the tao yeu cau hoan tien',
    });
  }
});

ungDung.get('/api/me/support-tickets', yeuCauDangNhap, async (req, res) => {
  try {
    const data = await layYeuCauHoTroCuaToi(req.user.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the tai yeu cau ho tro',
    });
  }
});

ungDung.post('/api/me/support-tickets', yeuCauDangNhap, async (req, res) => {
  try {
    const data = await guiYeuCauHoTro({
      user: req.user,
      payload: req.body,
    });

    res.status(201).json({
      message: 'Da gui yeu cau ho tro',
      data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the gui yeu cau ho tro',
    });
  }
});

ungDung.patch('/api/bookings/:id/status', yeuCauDangNhap, async (req, res) => {
  try {
    const trangThaiKhachDuocTuCapNhat = [TRANG_THAI_DAT_PHONG.CANCELLED, TRANG_THAI_DAT_PHONG.CHECKED_OUT];
    if (!trangThaiKhachDuocTuCapNhat.includes(req.body.status)) {
      return res.status(403).json({
        message: 'Ban khong co quyen cap nhat trang thai nay.',
      });
    }

    const data = await capNhatTrangThaiDatPhong({
      bookingCode: req.params.id,
      status: req.body.status,
      note: req.body.note,
      adminId: req.user.role === 'admin' ? req.user.id : null,
    });

    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the cap nhat trang thai',
    });
  }
});

ungDung.post('/api/bookings/:id/payments/confirm', yeuCauDangNhap, async (req, res) => {
  try {
    // Ban demo cho phep khach bam xac nhan thanh toan de cap nhat ngay.
    // Khi trien khai that, nen doi sang trang thai "cho xac nhan" va de admin duyet.
    const data = await xacNhanThanhToan({
      bookingCode: req.params.id,
      method: req.body.method,
      paymentCode: req.body.paymentCode,
      voucherCode: req.body.voucherCode,
      adminId: req.user.role === 'admin' ? req.user.id : null,
    });

    res.status(201).json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the xac nhan thanh toan',
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

ungDung.get('/api/admin/overview', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const data = await layTongQuanQuanTri();
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the tai tong quan quan tri',
    });
  }
});

ungDung.get('/api/admin/customers', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const data = await layDanhSachKhachHang(req.query);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the tai danh sach khach hang',
    });
  }
});

ungDung.get('/api/admin/customers/:id', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const data = await layChiTietKhachHang(req.params.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the tai thong tin khach hang',
    });
  }
});

ungDung.patch('/api/admin/customers/:id', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const data = await capNhatKhachHang({
      userId: req.params.id,
      payload: req.body,
      adminId: req.user.id,
    });
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the cap nhat khach hang',
    });
  }
});

ungDung.patch('/api/admin/customers/:id/status', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const data = await capNhatTrangThaiKhachHang({
      userId: req.params.id,
      status: req.body.status,
      adminId: req.user.id,
    });
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the cap nhat trang thai khach hang',
    });
  }
});

ungDung.delete('/api/admin/customers/:id', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const data = await xoaKhachHang({
      userId: req.params.id,
      adminId: req.user.id,
    });
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the xoa khach hang',
    });
  }
});

ungDung.get('/api/admin/bookings', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const data = await layTatCaDatPhong();
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the tai danh sach dat phong',
    });
  }
});

ungDung.get('/api/admin/refund-requests', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const data = await layTatCaYeuCauHoanTien();
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the tai yeu cau hoan tien',
    });
  }
});

ungDung.patch('/api/admin/refund-requests/:id', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const data = await capNhatYeuCauHoanTien({
      refundId: req.params.id,
      status: req.body.status,
      note: req.body.note,
      adminId: req.user.id,
    });

    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the cap nhat yeu cau hoan tien',
    });
  }
});

ungDung.get('/api/admin/support-tickets', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const data = await layTatCaYeuCauHoTro();
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the tai yeu cau ho tro',
    });
  }
});

ungDung.patch('/api/admin/support-tickets/:id', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const data = await capNhatYeuCauHoTro({
      ticketId: req.params.id,
      status: req.body.status,
      reply: req.body.reply,
      adminId: req.user.id,
    });

    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the cap nhat yeu cau ho tro',
    });
  }
});

ungDung.get('/api/admin/revenue-report', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const data = await layBaoCaoDoanhThu();
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the tai bao cao doanh thu',
    });
  }
});

ungDung.patch('/api/admin/bookings/:id/status', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const data = await capNhatTrangThaiDatPhong({
      bookingCode: req.params.id,
      status: req.body.status,
      note: req.body.note,
      adminId: req.user.id,
    });
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the cap nhat trang thai',
    });
  }
});

ungDung.post('/api/admin/bookings/:id/payments/confirm', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const data = await xacNhanThanhToan({
      bookingCode: req.params.id,
      method: req.body.method,
      paymentCode: req.body.paymentCode,
      voucherCode: req.body.voucherCode,
      adminId: req.user.id,
    });
    res.status(201).json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the xac nhan thanh toan',
    });
  }
});

ungDung.patch('/api/admin/bookings/:id/note', yeuCauDangNhap, yeuCauQuanTri, async (req, res) => {
  try {
    const data = await luuGhiChuAdmin({
      bookingCode: req.params.id,
      note: req.body.note,
      adminId: req.user.id,
    });
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Khong the luu ghi chu',
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
