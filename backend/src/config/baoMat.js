// Chức năng: Đọc và cung cấp cấu hình bảo mật (JWT secret) và tài khoản admin mặc định.
const JWT_DEV_SECRET = "staynest_dev_secret_change_me";

function laMoiTruongProduction() {
  return process.env.NODE_ENV === "production";
}

function layJwtSecret() {
  const configuredSecret = String(process.env.JWT_SECRET || "").trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  if (laMoiTruongProduction()) {
    throw new Error(
      "JWT_SECRET bat buoc phai duoc cau hinh khi NODE_ENV=production.",
    );
  }

  return JWT_DEV_SECRET;
}

function layCauHinhAdminMacDinh() {
  return {
    enabled:
      process.env.DEFAULT_ADMIN_ENABLED === "true" ||
      (!laMoiTruongProduction() && process.env.DEFAULT_ADMIN_ENABLED !== "false"),
    forceResetPassword: process.env.DEFAULT_ADMIN_FORCE_RESET === "true",
    fullName: process.env.DEFAULT_ADMIN_FULL_NAME || "Quan tri DieuBel",
    username: process.env.DEFAULT_ADMIN_USERNAME || "admin",
    email: process.env.DEFAULT_ADMIN_EMAIL || "admin@dieubel.local",
    password: process.env.DEFAULT_ADMIN_PASSWORD || "admin123",
  };
}

module.exports = {
  layJwtSecret,
  layCauHinhAdminMacDinh,
};
