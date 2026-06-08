// Chức năng: Định nghĩa các API đặt phòng, xem đơn của tôi, xác nhận thanh toán, check-in QR, hoàn tiền, phản hồi và đánh giá.
const express = require("express");
const { yeuCauDangNhap } = require("../middleware/xacThuc.middleware");
const { taoDatPhong } = require("../modules/bookings/datPhong.service");
const {
  TRANG_THAI_DAT_PHONG,
  layDatPhongCuaNguoiDung,
  capNhatTrangThaiDatPhong,
  xacNhanThanhToan,
  xacMinhCheckInCongKhai,
} = require("../modules/bookings/quanLyDatPhong.service");
const { taoYeuCauHoanTien } = require("../modules/bookings/hoanTien.service");
const { guiPhanHoiKhachHang } = require("../modules/bookings/hoTro.service");
const { taoDanhGiaPhong } = require("../modules/rooms/danhGia.service");

const router = express.Router();

router.post("/", yeuCauDangNhap, async (req, res) => {
  try {
    const result = await taoDatPhong({
      user: req.user,
      payload: req.body,
    });

    res.status(201).json({
      message: "Dat phong thanh cong",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the dat phong",
    });
  }
});

router.post("/public-checkin", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Thieu ma token check-in." });
  }

  try {
    const result = await xacMinhCheckInCongKhai({ token });
    return res.json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Loi he thong khi check-in.",
      error: error.message,
    });
  }
});

router.get("/my", yeuCauDangNhap, async (req, res) => {
  try {
    const data = await layDatPhongCuaNguoiDung(req.user.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the tai danh sach dat phong",
    });
  }
});

router.post("/:id/feedbacks", yeuCauDangNhap, async (req, res) => {
  try {
    const data = await guiPhanHoiKhachHang({
      user: req.user,
      bookingCode: req.params.id,
      payload: req.body,
    });

    res.status(201).json({
      message: "Da gui phan hoi",
      data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the gui phan hoi",
    });
  }
});

router.post("/:id/reviews", yeuCauDangNhap, async (req, res) => {
  try {
    const { rating, content } = req.body;
    const data = await taoDanhGiaPhong({
      user: req.user,
      bookingCode: req.params.id,
      rating,
      content,
    });

    res.status(201).json({
      message: "Đánh giá phòng thành công",
      data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Không thể gửi đánh giá phòng.",
    });
  }
});

router.post("/:id/refund-requests", yeuCauDangNhap, async (req, res) => {
  try {
    const data = await taoYeuCauHoanTien({
      user: req.user,
      bookingCode: req.params.id,
      payload: req.body,
    });

    res.status(201).json({
      message: "Da tao yeu cau huy/hoan tien",
      data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the tao yeu cau hoan tien",
    });
  }
});

router.patch("/:id/status", yeuCauDangNhap, async (req, res) => {
  try {
    const trangThaiKhachDuocTuCapNhat = [
      TRANG_THAI_DAT_PHONG.CANCELLED,
      TRANG_THAI_DAT_PHONG.CHECKED_OUT,
    ];
    if (!trangThaiKhachDuocTuCapNhat.includes(req.body.status)) {
      return res.status(403).json({
        message: "Ban khong co quyen cap nhat trang thai nay.",
      });
    }

    const data = await capNhatTrangThaiDatPhong({
      bookingCode: req.params.id,
      status: req.body.status,
      note: req.body.note,
      userId: req.user.id,
    });

    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the cap nhat trang thai",
    });
  }
});

router.post("/:id/payments/confirm", yeuCauDangNhap, async (req, res) => {
  try {
    const data = await xacNhanThanhToan({
      bookingCode: req.params.id,
      method: req.body.method,
      paymentCode: req.body.paymentCode,
      voucherCode: req.body.voucherCode,
      userId: req.user.id,
    });

    res.status(201).json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the xac nhan thanh toan",
    });
  }
});

module.exports = router;
