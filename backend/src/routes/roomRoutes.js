// Chức năng: Định nghĩa các API public để lấy danh sách phòng, phòng nổi bật, chi tiết phòng và đánh giá phòng.
const express = require("express");
const {
  layDanhSachPhong,
  layPhongNoiBat,
  layPhongTheoId,
} = require("../modules/rooms/phong.service");
const { layDanhGiaCuaPhong } = require("../modules/rooms/danhGia.service");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const payload = await layDanhSachPhong(req.query);
    res.json(payload);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch rooms",
      error: error.message,
    });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const data = await layPhongNoiBat(req.query.limit);
    res.json({ data });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch featured rooms",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const room = await layPhongTheoId(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    return res.json({ data: room });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch room detail",
      error: error.message,
    });
  }
});

router.get("/:id/reviews", async (req, res) => {
  try {
    const roomId = req.params.id;
    const data = await layDanhGiaCuaPhong(roomId);
    res.json({ data });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch room reviews",
      error: error.message,
    });
  }
});

module.exports = router;
