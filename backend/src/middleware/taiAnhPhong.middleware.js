// Chức năng: Middleware xử lý upload file ảnh cho phòng (ảnh bìa và thư viện ảnh) bằng Multer.
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsRoot = path.join(__dirname, "..", "uploads");
const roomUploadsDir = path.join(uploadsRoot, "rooms");

if (!fs.existsSync(roomUploadsDir)) {
  fs.mkdirSync(roomUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, roomUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeBase =
      path
        .basename(file.originalname || "room")
        .replace(path.extname(file.originalname || ""), "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "room";

    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

const taiAnhPhong = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 8,
  },
  fileFilter: (req, file, cb) => {
    if (!String(file.mimetype || "").startsWith("image/")) {
      cb(new Error("Chi chap nhan file anh."));
      return;
    }

    cb(null, true);
  },
}).fields([
  { name: "cover_image", maxCount: 1 },
  { name: "gallery_images", maxCount: 7 },
]);

module.exports = {
  uploadsRoot,
  taiAnhPhong,
};
