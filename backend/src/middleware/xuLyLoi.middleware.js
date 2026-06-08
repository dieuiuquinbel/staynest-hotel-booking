function taoLoiHttp(status, message, details) {
  const error = new Error(message);
  error.status = status;
  if (details !== undefined) error.details = details;
  return error;
}

function batLoiAsync(handler) {
  return function xuLyAsyncRoute(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function layStatusCode(error) {
  const status = Number(error.status || error.statusCode);
  if (Number.isInteger(status) && status >= 400 && status <= 599) {
    return status;
  }
  return 500;
}

function middlewareKhongTimThay(req, res, next) {
  next(taoLoiHttp(404, "Không tìm thấy API."));
}

function middlewareXuLyLoi(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const status = layStatusCode(error);
  const isProduction = process.env.NODE_ENV === "production";
  const message =
    error.message ||
    (status >= 500 ? "Lỗi hệ thống. Vui lòng thử lại sau." : "Yêu cầu không hợp lệ.");

  if (status >= 500) {
    console.error("[ERROR]", {
      method: req.method,
      path: req.originalUrl,
      message: error.message,
      stack: error.stack,
    });
  }

  const payload = {
    message: status >= 500 && isProduction ? "Lỗi hệ thống. Vui lòng thử lại sau." : message,
  };

  if (error.details !== undefined) {
    payload.details = error.details;
  }

  if (!isProduction && status >= 500) {
    payload.error = error.message;
  }

  return res.status(status).json(payload);
}

module.exports = {
  taoLoiHttp,
  batLoiAsync,
  middlewareKhongTimThay,
  middlewareXuLyLoi,
};
