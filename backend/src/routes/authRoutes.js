// Chức năng: Định nghĩa các API xác thực như đăng ký, đăng nhập, xác minh OTP và lấy thông tin người dùng hiện tại.
const express = require("express");
const { yeuCauDangNhap } = require("../middleware/xacThuc.middleware");
const {
  dangNhapTaiKhoan,
  dangKyTaiKhoan,
  guiLaiOtpEmail,
  xacMinhOtpEmail,
} = require("../modules/auth/xacThuc.service");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const session = await dangKyTaiKhoan(req.body);
    res.status(201).json({
      message: "Tao tai khoan thanh cong. Vui long xac minh email bang ma OTP.",
      data: session,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the tao tai khoan",
    });
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    const session = await xacMinhOtpEmail(req.body);
    res.json({
      message: "Xac minh email thanh cong",
      data: session,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the xac minh email",
    });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const result = await guiLaiOtpEmail(req.body);
    res.json({
      message: "Da gui lai ma OTP",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the gui lai OTP",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const session = await dangNhapTaiKhoan(req.body);
    res.json({
      message: "Dang nhap thanh cong",
      data: session,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the dang nhap",
    });
  }
});

router.get("/me", yeuCauDangNhap, async (req, res) => {
  res.json({
    data: req.user,
  });
});

module.exports = router;
