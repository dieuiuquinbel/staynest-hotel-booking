// Chức năng: Định nghĩa các API xác thực như đăng ký, đăng nhập, xác minh OTP và lấy thông tin người dùng hiện tại.
const express = require("express");
const { yeuCauDangNhap } = require("../middleware/xacThuc.middleware");
const { batLoiAsync } = require("../middleware/xuLyLoi.middleware");
const {
  dangNhapTaiKhoan,
  dangKyTaiKhoan,
  guiLaiOtpEmail,
  xacMinhOtpEmail,
} = require("../modules/auth/xacThuc.service");

const router = express.Router();

router.post(
  "/register",
  batLoiAsync(async (req, res) => {
    const session = await dangKyTaiKhoan(req.body);
    res.status(201).json({
      message: "Tao tai khoan thanh cong. Vui long xac minh email bang ma OTP.",
      data: session,
    });
  }),
);

router.post(
  "/verify-email",
  batLoiAsync(async (req, res) => {
    const session = await xacMinhOtpEmail(req.body);
    res.json({
      message: "Xac minh email thanh cong",
      data: session,
    });
  }),
);

router.post(
  "/resend-otp",
  batLoiAsync(async (req, res) => {
    const result = await guiLaiOtpEmail(req.body);
    res.json({
      message: "Da gui lai ma OTP",
      data: result,
    });
  }),
);

router.post(
  "/login",
  batLoiAsync(async (req, res) => {
    const session = await dangNhapTaiKhoan(req.body);
    res.json({
      message: "Dang nhap thanh cong",
      data: session,
    });
  }),
);

router.get("/me", yeuCauDangNhap, async (req, res) => {
  res.json({
    data: req.user,
  });
});

module.exports = router;
