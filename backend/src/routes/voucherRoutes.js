// Chức năng: Định nghĩa API public để lấy danh sách voucher đang hiển thị cho khách hàng.
const express = require("express");
const { batLoiAsync } = require("../middleware/xuLyLoi.middleware");
const { layDanhSachVoucher } = require("../modules/vouchers/voucher.service");

const router = express.Router();

router.get(
  "/",
  batLoiAsync(async (req, res) => {
    const data = await layDanhSachVoucher(req.user?.id);
    res.json({ data });
  }),
);

module.exports = router;
