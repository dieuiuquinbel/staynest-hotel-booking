const jwt = require('jsonwebtoken');
const { findUserById } = require('../services/auth.service');

const JWT_SECRET = process.env.JWT_SECRET || 'staynest_dev_secret_change_me';

async function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';

    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Thiếu access token.',
      });
    }

    const token = authorization.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(payload.sub);

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        message: 'Phiên đăng nhập không còn hợp lệ.',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token không hợp lệ hoặc đã hết hạn.',
    });
  }
}

module.exports = {
  requireAuth,
};
