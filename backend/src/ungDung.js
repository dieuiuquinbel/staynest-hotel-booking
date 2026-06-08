// Chức năng: Lắp middleware, route public, route user và route admin.
// Bộ lắp route và middleware cho backend.
// File này gắn middleware, route công khai, route khách hàng và route quản trị.
const express = require("express");
const cors = require("cors");
const ketNoiDb = require("./config/coSoDuLieu");
const { uploadsRoot } = require("./middleware/taiAnhPhong.middleware");
const { taoMiddlewareChuanHoaThongBao } = require("./utils/thongBaoTiengViet");

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const adminRoutes = require("./routes/adminRoutes");

const ungDung = express();
const frontendOrigins = String(process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function laOriginNoiBo(origin) {
  if (!origin) return true;

  try {
    const { hostname } = new URL(origin);
    if (frontendOrigins.length > 0) {
      return frontendOrigins.includes(origin);
    }

    if (process.env.NODE_ENV === "production") {
      return false;
    }

    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    );
  } catch {
    return false;
  }
}

ungDung.use(
  cors({
    origin(origin, callback) {
      callback(null, laOriginNoiBo(origin));
    },
    credentials: true,
  }),
);

ungDung.use(express.json());
ungDung.use(taoMiddlewareChuanHoaThongBao());
ungDung.use("/uploads", express.static(uploadsRoot));

ungDung.get("/api/health", async (req, res) => {
  try {
    const [rows] = await ketNoiDb.query("SELECT 1 AS ok");
    res.json({
      message: "Backend is running",
      database: "connected",
      result: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Backend is running, but database connection failed",
      error: error.message,
    });
  }
});

// Gắn các routes
ungDung.use("/api/auth", authRoutes);
ungDung.use("/api/rooms", roomRoutes);
ungDung.use("/api/me", userRoutes);
ungDung.use("/api/vouchers", voucherRoutes);
ungDung.use("/api/bookings", bookingRoutes);
ungDung.use("/api/admin/invoices", invoiceRoutes);
ungDung.use("/api/admin", adminRoutes);

module.exports = ungDung;
