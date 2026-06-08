// Chức năng: Định nghĩa các API đặt phòng, xem đơn của tôi, xác nhận thanh toán, check-in QR, hoàn tiền, phản hồi và đánh giá.
const express = require("express");
const { yeuCauDangNhap } = require("../middleware/xacThuc.middleware");
const { taoLoiHttp } = require("../middleware/xuLyLoi.middleware");
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

router.post("/", yeuCauDangNhap, async (req, res, next) => {
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
    return next(error);
  }
});

router.post("/public-checkin", async (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return next(taoLoiHttp(400, "Thiếu mã token check-in."));
  }

  try {
    const result = await xacMinhCheckInCongKhai({ token });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

router.get("/my", yeuCauDangNhap, async (req, res, next) => {
  try {
    const data = await layDatPhongCuaNguoiDung(req.user.id);
    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/feedbacks", yeuCauDangNhap, async (req, res, next) => {
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
    return next(error);
  }
});

router.post("/:id/reviews", yeuCauDangNhap, async (req, res, next) => {
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
    return next(error);
  }
});

router.post("/:id/refund-requests", yeuCauDangNhap, async (req, res, next) => {
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
    return next(error);
  }
});

router.patch("/:id/status", yeuCauDangNhap, async (req, res, next) => {
  try {
    const trangThaiKhachDuocTuCapNhat = [
      TRANG_THAI_DAT_PHONG.CANCELLED,
      TRANG_THAI_DAT_PHONG.CHECKED_OUT,
    ];
    if (!trangThaiKhachDuocTuCapNhat.includes(req.body.status)) {
      return next(taoLoiHttp(403, "Bạn không có quyền cập nhật trạng thái này."));
    }

    const data = await capNhatTrangThaiDatPhong({
      bookingCode: req.params.id,
      status: req.body.status,
      note: req.body.note,
      userId: req.user.id,
    });

    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/payments/confirm", yeuCauDangNhap, async (req, res, next) => {
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
    return next(error);
  }
});

module.exports = router;
