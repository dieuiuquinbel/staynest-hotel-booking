// Chức năng: Định nghĩa các API public để lấy danh sách phòng, phòng nổi bật, chi tiết phòng và đánh giá phòng.
const express = require("express");
const { batLoiAsync, taoLoiHttp } = require("../middleware/xuLyLoi.middleware");
const {
  layDanhSachPhong,
  layPhongNoiBat,
  layPhongTheoId,
} = require("../modules/rooms/phong.service");
const { layDanhGiaCuaPhong } = require("../modules/rooms/danhGia.service");

const router = express.Router();

router.get(
  "/",
  batLoiAsync(async (req, res) => {
    const payload = await layDanhSachPhong(req.query);
    res.json(payload);
  }),
);

router.get(
  "/featured",
  batLoiAsync(async (req, res) => {
    const data = await layPhongNoiBat(req.query.limit);
    res.json({ data });
  }),
);

router.get(
  "/:id",
  batLoiAsync(async (req, res) => {
    const room = await layPhongTheoId(req.params.id);

    if (!room) {
      throw taoLoiHttp(404, "Không tìm thấy phòng.");
    }

    return res.json({ data: room });
  }),
);

router.get(
  "/:id/reviews",
  batLoiAsync(async (req, res) => {
    const roomId = req.params.id;
    const data = await layDanhGiaCuaPhong(roomId);
    res.json({ data });
  }),
);

module.exports = router;
