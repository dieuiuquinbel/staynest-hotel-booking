// Chức năng: Định nghĩa các API cá nhân của người dùng đã đăng nhập như yêu thích, voucher, hoàn tiền và hỗ trợ.
const express = require("express");
const { yeuCauDangNhap } = require("../middleware/xacThuc.middleware");
const {
  layDanhSachYeuThich,
  toggleYeuThich,
} = require("../modules/rooms/yeuThich.service");
const {
  layVoucherCuaNguoiDung,
  luuVoucherChoNguoiDung,
} = require("../modules/vouchers/voucher.service");
const {
  layYeuCauHoanTienCuaToi,
} = require("../modules/bookings/hoanTien.service");
const {
  layYeuCauHoTroCuaToi,
  guiYeuCauHoTro,
} = require("../modules/bookings/hoTro.service");

const router = express.Router();

router.use(yeuCauDangNhap);

router.get("/favorites", async (req, res) => {
  try {
    const data = await layDanhSachYeuThich(req.user.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Không thể tải danh sách yêu thích",
    });
  }
});

router.post("/favorites", async (req, res) => {
  try {
    const roomId = req.body.roomId;
    if (!roomId) {
      return res.status(400).json({ message: "Thiếu ID phòng" });
    }
    const data = await toggleYeuThich(req.user.id, roomId);
    res.status(200).json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Không thể cập nhật yêu thích",
    });
  }
});

router.get("/vouchers", async (req, res) => {
  try {
    const data = await layVoucherCuaNguoiDung(req.user.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the tai kho voucher",
    });
  }
});

router.post("/vouchers", async (req, res) => {
  try {
    const data = await luuVoucherChoNguoiDung(req.user.id, req.body.code);
    res.status(201).json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the luu voucher",
    });
  }
});

router.get("/refund-requests", async (req, res) => {
  try {
    const data = await layYeuCauHoanTienCuaToi(req.user.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the tai danh sach yeu cau hoan tien",
    });
  }
});

router.get("/support-tickets", async (req, res) => {
  try {
    const data = await layYeuCauHoTroCuaToi(req.user.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the tai yeu cau ho tro",
    });
  }
});

router.post("/support-tickets", async (req, res) => {
  try {
    const data = await guiYeuCauHoTro({
      user: req.user,
      payload: req.body,
    });

    res.status(201).json({
      message: "Da gui yeu cau ho tro",
      data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the gui yeu cau ho tro",
    });
  }
});

module.exports = router;
