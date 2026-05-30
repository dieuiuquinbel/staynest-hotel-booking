# Cấu trúc `backend/src`

Thư mục này chứa Express app, cấu hình database, middleware xác thực và các module nghiệp vụ của backend DieuBel.

## File gốc

- `mayChu.js`  
  Điểm khởi động backend. File này nạp `.env`, chuẩn bị admin mặc định, mở HTTP server và khởi động scanner nền cho trạng thái booking.

- `ungDung.js`  
  Lắp Express app: CORS, JSON parser, static upload/invoice, route public, route khách hàng và route admin.

## Thư mục cấu hình

- `config/coSoDuLieu.js`  
  Tạo MySQL connection pool dùng chung. Service nào cần transaction sẽ lấy connection từ pool này.

## Middleware

- `middleware/xacThuc.middleware.js`  
  Kiểm tra JWT, gán `req.user`, bảo vệ route cần đăng nhập và route cần quyền admin.

## Modules

- `auth/`  
  Đăng ký, đăng nhập, OTP, JWT, hồ sơ người dùng và admin mặc định.

- `bookings/`  
  Tạo booking, xác nhận thanh toán, quản lý trạng thái, QR check-in, check-out, hoàn tiền, hỗ trợ và doanh thu.

- `rooms/`  
  Danh sách phòng, chi tiết phòng, phòng nổi bật, CRUD phòng admin và đánh giá phòng.

- `vouchers/`  
  Voucher công khai, voucher của người dùng và lưu voucher.

- `admin/`  
  Dashboard, khách hàng, audit, báo cáo và dữ liệu tổng hợp cho admin.

- `notifications/`  
  Gửi email OTP, xác nhận booking và các email nghiệp vụ.

- `invoices/`  
  Sinh, đọc và phục vụ hóa đơn HTML.

- `system/`  
  Đảm bảo cấu trúc vận hành bổ sung khi database cần cột mới.

## Quy ước sửa backend

- Route chỉ điều phối request/response; logic chi tiết đặt trong service.
- Nghiệp vụ cập nhật nhiều bảng phải dùng transaction.
- Trạng thái booking quan trọng phải ghi log.
- Không commit `.env`, upload, storage hoặc hóa đơn sinh tự động.
