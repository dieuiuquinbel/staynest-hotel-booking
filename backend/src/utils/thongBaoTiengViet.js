// Chức năng: Tiện ích chuẩn hóa các thông báo lỗi từ hệ thống sang tiếng Việt thân thiện với người dùng.
const THONG_BAO_API = new Map([
  ["Ban khong co quyen han nay.", "Bạn không có quyền thực hiện thao tác này."],
  ["Tao tai khoan thanh cong. Vui long xac minh email bang ma OTP.", "Tạo tài khoản thành công. Vui lòng xác minh email bằng mã OTP."],
  ["Khong the tao tai khoan", "Không thể tạo tài khoản."],
  ["Xac minh email thanh cong", "Xác minh email thành công."],
  ["Khong the xac minh email", "Không thể xác minh email."],
  ["Da gui lai ma OTP", "Đã gửi lại mã OTP."],
  ["Khong the gui lai OTP", "Không thể gửi lại mã OTP."],
  ["Dang nhap thanh cong", "Đăng nhập thành công."],
  ["Khong the dang nhap", "Không thể đăng nhập."],
  ["Failed to fetch rooms", "Không tải được danh sách phòng."],
  ["Failed to fetch featured rooms", "Không tải được danh sách phòng nổi bật."],
  ["Room not found", "Không tìm thấy phòng."],
  ["Failed to fetch room detail", "Không tải được chi tiết phòng."],
  ["Failed to fetch room reviews", "Không tải được đánh giá phòng."],
  ["Dat phong thanh cong", "Đặt phòng thành công."],
  ["Khong the dat phong", "Không thể đặt phòng."],
  ["Thieu ma token check-in.", "Thiếu mã token check-in."],
  ["Loi he thong khi check-in.", "Lỗi hệ thống khi check-in."],
  ["Khong the tai danh sach dat phong", "Không tải được danh sách đặt phòng."],
  ["Da gui phan hoi", "Đã gửi phản hồi."],
  ["Khong the gui phan hoi", "Không thể gửi phản hồi."],
  ["Khong the tai danh sach yeu cau hoan tien", "Không tải được danh sách yêu cầu hoàn tiền."],
  ["Da tao yeu cau huy/hoan tien", "Đã tạo yêu cầu hủy/hoàn tiền."],
  ["Khong the tao yeu cau hoan tien", "Không thể tạo yêu cầu hoàn tiền."],
  ["Khong the tai yeu cau ho tro", "Không tải được yêu cầu hỗ trợ."],
  ["Da gui yeu cau ho tro", "Đã gửi yêu cầu hỗ trợ."],
  ["Khong the gui yeu cau ho tro", "Không thể gửi yêu cầu hỗ trợ."],
  ["Khong the cap nhat trang thai", "Không thể cập nhật trạng thái."],
  ["Khong the xac nhan thanh toan", "Không thể xác nhận thanh toán."],
  ["Khong the tai danh sach hoa don", "Không tải được danh sách hóa đơn."],
  ["Khong tim thay hoa don", "Không tìm thấy hóa đơn."],
  ["Khong the tai hoa don", "Không thể tải hóa đơn."],
  ["Khong the tai tong quan quan tri", "Không tải được tổng quan quản trị."],
  ["Khong the tai danh sach khach hang", "Không tải được danh sách khách hàng."],
  ["Khong the tao khach hang", "Không thể tạo khách hàng."],
  ["Khong the tai thong tin khach hang", "Không tải được thông tin khách hàng."],
  ["Khong the cap nhat khach hang", "Không thể cập nhật khách hàng."],
  ["Khong the cap nhat trang thai khach hang", "Không thể cập nhật trạng thái khách hàng."],
  ["Khong the xoa khach hang", "Không thể xóa khách hàng."],
  ["Khong tai len duoc anh phong", "Không tải lên được ảnh phòng."],
  ["Khong the tao phong", "Không thể tạo phòng."],
  ["Khong the tai yeu cau hoan tien", "Không tải được yêu cầu hoàn tiền."],
  ["Khong the cap nhat yeu cau hoan tien", "Không thể cập nhật yêu cầu hoàn tiền."],
  ["Khong the cap nhat yeu cau ho tro", "Không thể cập nhật yêu cầu hỗ trợ."],
  ["Khong the tai bao cao doanh thu", "Không tải được báo cáo doanh thu."],
  ["Khong the luu ghi chu", "Không thể lưu ghi chú."],
  ["Backend is running", "Backend đang hoạt động."],
  ["Backend is running, but database connection failed", "Backend đang hoạt động nhưng không kết nối được database."],
]);

function boDauTiengViet(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function chuanHoaThongBaoApi(message) {
  if (!message || typeof message !== "string") return message;
  if (THONG_BAO_API.has(message)) return THONG_BAO_API.get(message);

  const normalized = boDauTiengViet(message);
  if (THONG_BAO_API.has(normalized)) return THONG_BAO_API.get(normalized);

  return message
    .replaceAll("Khong", "Không")
    .replaceAll("khong", "không")
    .replaceAll("Don", "Đơn")
    .replaceAll("don", "đơn")
    .replaceAll("Ma", "Mã")
    .replaceAll("ma", "mã")
    .replaceAll("thanh toan", "thanh toán")
    .replaceAll("dat phong", "đặt phòng")
    .replaceAll("hoan tien", "hoàn tiền")
    .replaceAll("huy", "hủy")
    .replaceAll("hop le", "hợp lệ")
    .replaceAll("het han", "hết hạn")
    .replaceAll("toi thieu", "tối thiểu")
    .replaceAll("Vui long", "Vui lòng")
    .replaceAll("vui long", "vui lòng");
}

function taoMiddlewareChuanHoaThongBao() {
  return (req, res, next) => {
    const json = res.json.bind(res);

    res.json = (body) => {
      if (body && typeof body === "object" && typeof body.message === "string") {
        body.message = chuanHoaThongBaoApi(body.message);
      }

      return json(body);
    };

    next();
  };
}

module.exports = {
  chuanHoaThongBaoApi,
  taoMiddlewareChuanHoaThongBao,
};
