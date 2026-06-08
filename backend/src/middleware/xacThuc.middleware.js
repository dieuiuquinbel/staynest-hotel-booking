// Chức năng: Middleware kiểm tra JWT và gắn user vào request.
const jwt = require("jsonwebtoken");
const { timNguoiDungTheoId } = require("../modules/auth/xacThuc.service");
const { layJwtSecret } = require("../config/baoMat");
const { taoLoiHttp } = require("./xuLyLoi.middleware");

async function yeuCauDangNhap(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return next(taoLoiHttp(401, "Thiếu access token."));
    }

    const token = authorization.slice(7);
    const payload = jwt.verify(token, layJwtSecret());
    const user = await timNguoiDungTheoId(payload.sub);

    if (!user || user.status !== "active") {
      return next(taoLoiHttp(401, "Phiên đăng nhập không còn hợp lệ."));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(taoLoiHttp(401, "Token không hợp lệ hoặc đã hết hạn."));
  }
}

module.exports = {
  yeuCauDangNhap,
};
