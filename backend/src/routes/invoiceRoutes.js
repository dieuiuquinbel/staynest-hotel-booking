// Chức năng: Định nghĩa các API quản trị để xem danh sách hóa đơn và tải file hóa đơn HTML.
const express = require("express");
const { yeuCauDangNhap } = require("../middleware/xacThuc.middleware");
const {
  THU_MUC_HOA_DON,
  damBaoHoaDonTrongThuMucAdmin,
  taoHtmlHoaDon,
} = require("../modules/invoices/hoaDon.service");
const {
  layDanhSachHoaDon,
  layHoaDonTheoId,
} = require("../modules/bookings/datPhong.service");
const ketNoiDb = require("../config/coSoDuLieu");

const router = express.Router();

function yeuCauQuanTri(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Ban khong co quyen han nay.",
    });
  }
  return next();
}

router.use(yeuCauDangNhap);
router.use(yeuCauQuanTri);

router.get("/", async (req, res) => {
  try {
    const invoices = await layDanhSachHoaDon();
    res.json({
      data: {
        invoices,
        directory: THU_MUC_HOA_DON,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Khong the tai danh sach hoa don",
      error: error.message,
    });
  }
});

// Preview: render HTML trực tiếp từ database, không phụ thuộc file trên ổ cứng
router.get("/:id/preview", async (req, res) => {
  try {
    const [rows] = await ketNoiDb.query(
      `SELECT
         i.id,
         i.invoice_code,
         i.total_amount,
         i.created_at AS invoice_date,
         b.booking_code,
         b.check_in_date,
         b.check_out_date,
         b.nights,
         b.rooms_count,
         b.room_price,
         b.service_price,
         b.total_price,
         b.guests,
         b.note,
         b.booking_status,
         b.payment_status,
         b.payment_method,
         u.full_name,
         u.email,
         u.phone AS user_phone,
         r.room_name,
         r.room_type
       FROM invoices i
       JOIN bookings b ON b.id = i.booking_id
       JOIN users u ON u.id = b.user_id
       JOIN rooms r ON r.id = b.room_id
       WHERE i.id = ?
       LIMIT 1`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Khong tim thay hoa don." });
    }

    const row = rows[0];
    const html = taoHtmlHoaDon({
      invoiceCode: row.invoice_code,
      booking: {
        booking_code: row.booking_code,
        check_in_date: row.check_in_date,
        check_out_date: row.check_out_date,
        nights: row.nights,
        rooms_count: row.rooms_count,
        room_price: row.room_price,
        service_price: row.service_price,
        total_price: row.total_price,
        phone: row.user_phone,
      },
      room: {
        room_name: row.room_name,
        room_type: row.room_type,
      },
      user: {
        full_name: row.full_name,
        email: row.email,
        phone: row.user_phone,
      },
      servicesText: row.note || "",
    });

    return res.type("html").send(html);
  } catch (error) {
    return res.status(500).json({
      message: "Khong the tai hoa don",
      error: error.message,
    });
  }
});

router.get("/:id/download", async (req, res) => {
  try {
    const invoice = await layHoaDonTheoId(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: "Khong tim thay hoa don",
      });
    }

    const duongDanDaLuu = await damBaoHoaDonTrongThuMucAdmin(invoice);
    res.setHeader("X-Invoice-Admin-Path", duongDanDaLuu);
    return res.download(duongDanDaLuu, `${invoice.invoice_code}.html`);
  } catch (error) {
    return res.status(500).json({
      message: "Khong the tai hoa don",
      error: error.message,
    });
  }
});

module.exports = router;
