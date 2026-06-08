// Chức năng: Định nghĩa API public để lấy danh sách voucher đang hiển thị cho khách hàng.
const express = require("express");
const { layDanhSachVoucher } = require("../modules/vouchers/voucher.service");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await layDanhSachVoucher(req.user?.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the tai danh sach voucher",
    });
  }
});

module.exports = router;
