// Chức năng: Định nghĩa các API quản trị cho dashboard, khách hàng, đặt phòng, phòng, hoàn tiền, hỗ trợ và doanh thu.
const express = require("express");
const { yeuCauDangNhap } = require("../middleware/xacThuc.middleware");
const { taiAnhPhong } = require("../middleware/taiAnhPhong.middleware");
const { taoLoiHttp } = require("../middleware/xuLyLoi.middleware");
const {
  layTongQuanQuanTri,
  layDanhSachKhachHang,
  layChiTietKhachHang,
  taoKhachHang,
  capNhatKhachHang,
  capNhatTrangThaiKhachHang,
  xoaKhachHang,
} = require("../modules/admin/quanTri.service");
const { taoPhongAdmin } = require("../modules/rooms/phong.service");
const {
  layTatCaYeuCauHoanTien,
  capNhatYeuCauHoanTien,
} = require("../modules/bookings/hoanTien.service");
const {
  layTatCaYeuCauHoTro,
  capNhatYeuCauHoTro,
} = require("../modules/bookings/hoTro.service");
const { layBaoCaoDoanhThu } = require("../modules/bookings/baoCao.service");
const {
  capNhatTrangThaiDatPhong,
  luuGhiChuAdmin,
  layTatCaDatPhong,
} = require("../modules/bookings/quanLyDatPhong.service");

const router = express.Router();

function yeuCauQuanTri(req, res, next) {
  if (req.user?.role !== "admin") {
    return next(taoLoiHttp(403, "Bạn không có quyền hạn này."));
  }
  return next();
}

router.use(yeuCauDangNhap);
router.use(yeuCauQuanTri);

router.get("/overview", async (req, res, next) => {
  try {
    const data = await layTongQuanQuanTri();
    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.get("/customers", async (req, res, next) => {
  try {
    const data = await layDanhSachKhachHang(req.query);
    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.post("/customers", async (req, res, next) => {
  try {
    const data = await taoKhachHang({
      payload: req.body,
      adminId: req.user.id,
    });
    res.status(201).json({ data });
  } catch (error) {
    return next(error);
  }
});

router.get("/customers/:id", async (req, res, next) => {
  try {
    const data = await layChiTietKhachHang(req.params.id);
    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.patch("/customers/:id", async (req, res, next) => {
  try {
    const data = await capNhatKhachHang({
      userId: req.params.id,
      payload: req.body,
      adminId: req.user.id,
    });
    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.patch("/customers/:id/status", async (req, res, next) => {
  try {
    const data = await capNhatTrangThaiKhachHang({
      userId: req.params.id,
      status: req.body.status,
      adminId: req.user.id,
    });
    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.delete("/customers/:id", async (req, res, next) => {
  try {
    const data = await xoaKhachHang({
      userId: req.params.id,
      adminId: req.user.id,
    });
    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.get("/bookings", async (req, res, next) => {
  try {
    const data = await layTatCaDatPhong();
    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.patch("/bookings/:id/status", async (req, res, next) => {
  try {
    const data = await capNhatTrangThaiDatPhong({
      bookingCode: req.params.id,
      status: req.body.status,
      note: req.body.note,
      adminId: req.user.id,
    });
    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.patch("/bookings/:id/note", async (req, res, next) => {
  try {
    const data = await luuGhiChuAdmin({
      bookingCode: req.params.id,
      note: req.body.note,
      adminId: req.user.id,
    });
    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.post("/rooms", async (req, res, next) => {
  taiAnhPhong(req, res, async (uploadError) => {
    if (uploadError) {
      return next(taoLoiHttp(400, uploadError.message || "Không tải lên được ảnh phòng."));
    }

    try {
      const coverImage = req.files?.cover_image?.[0];
      const galleryImages = req.files?.gallery_images || [];
      const data = await taoPhongAdmin({
        ...req.body,
        image_url: coverImage
          ? `/uploads/rooms/${coverImage.filename}`
          : req.body.image_url,
        gallery: galleryImages.length
          ? galleryImages.map((file) => `/uploads/rooms/${file.filename}`)
          : req.body.gallery,
      });
      res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  });
});

router.get("/refund-requests", async (req, res, next) => {
  try {
    const data = await layTatCaYeuCauHoanTien();
    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.patch("/refund-requests/:id", async (req, res, next) => {
  try {
    const data = await capNhatYeuCauHoanTien({
      refundId: req.params.id,
      status: req.body.status,
      note: req.body.note,
      adminId: req.user.id,
    });

    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.get("/support-tickets", async (req, res, next) => {
  try {
    const data = await layTatCaYeuCauHoTro();
    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.patch("/support-tickets/:id", async (req, res, next) => {
  try {
    const data = await capNhatYeuCauHoTro({
      ticketId: req.params.id,
      status: req.body.status,
      reply: req.body.reply,
      adminId: req.user.id,
    });

    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.get("/revenue-report", async (req, res, next) => {
  try {
    const data = await layBaoCaoDoanhThu({
      dateFrom: req.query.date_from,
      dateTo: req.query.date_to,
    });
    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
