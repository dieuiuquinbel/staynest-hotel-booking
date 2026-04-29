const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const { requireAuth } = require("./middleware/auth.middleware");
const { loginUser, registerUser } = require("./services/auth.service");
const {
  getRooms,
  getFeaturedRooms,
  getRoomById,
} = require("./services/room.service");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
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

app.post("/api/auth/register", async (req, res) => {
  try {
    const session = await registerUser(req.body);
    res.status(201).json({
      message: "Tạo tài khoản thành công",
      data: session,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Không thể tạo tài khoản",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const session = await loginUser(req.body);
    res.json({
      message: "Đăng nhập thành công",
      data: session,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Không thể đăng nhập",
    });
  }
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  res.json({
    data: req.user,
  });
});

app.get("/api/rooms", async (req, res) => {
  try {
    const payload = await getRooms(req.query);
    res.json(payload);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch rooms",
      error: error.message,
    });
  }
});

app.get("/api/rooms/featured", async (req, res) => {
  try {
    const data = await getFeaturedRooms(req.query.limit);
    res.json({ data });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch featured rooms",
      error: error.message,
    });
  }
});

app.get("/api/rooms/:id", async (req, res) => {
  try {
    const room = await getRoomById(req.params.id);

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

module.exports = app;
