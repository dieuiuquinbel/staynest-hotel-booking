# Cấu trúc `backend/src/modules`

Mỗi thư mục con là một nhóm nghiệp vụ tương đối độc lập. Các module được gọi từ route trong `backend/src/ungDung.js`.

## `auth/`

- `xacThuc.service.js`  
  Xử lý đăng ký, đăng nhập, OTP email, tài khoản admin mặc định, hồ sơ người dùng và ký JWT.

## `bookings/`

- `datPhong.service.js`  
  Tạo đơn đặt phòng, khóa tồn kho phòng, kiểm tra dữ liệu đầu vào, áp voucher, tạo payment/status log ban đầu và đọc hóa đơn theo booking.

- `quanLyDatPhong.service.js`  
  Quản lý vòng đời booking sau khi tạo: danh sách đơn, xác nhận thanh toán, cập nhật trạng thái, QR check-in công khai, scanner nền, check-out, hoàn tiền, hỗ trợ và báo cáo doanh thu.

## `rooms/`

- `phong.service.js`  
  Lấy danh sách phòng, chi tiết phòng, phòng nổi bật và thao tác phòng từ admin.

- `danhGia.service.js`  
  Tạo/lấy đánh giá phòng khi booking đủ điều kiện.

## `vouchers/`

- `voucher.service.js`  
  Lấy voucher công khai, voucher của người dùng và lưu voucher cho người dùng.

## `admin/`

- `quanTri.service.js`  
  Tổng quan admin, danh sách khách hàng, chi tiết khách hàng, tạo/sửa/xóa/khóa khách hàng, audit và số liệu vận hành.

## `notifications/`

- `thuDienTu.service.js`  
  Gửi email OTP, xác nhận booking và email nghiệp vụ khác. Nếu thiếu SMTP, module nên bỏ qua gửi mail thay vì làm backend dừng.

## `invoices/`

- `hoaDon.service.js`  
  Sinh và đọc hóa đơn HTML cho booking.

## `system/`

- `cauTrucVanHanh.service.js`  
  Các hàm đảm bảo cấu trúc database khi app cần cột mới để vận hành, ví dụ cột xác minh lễ tân qua LAN.

## Ghi chú

- Luồng thanh toán hiện nằm trong `bookings/quanLyDatPhong.service.js`.
- Không còn dùng module `payments/thanhToan.service.js` trong cấu trúc hiện tại.
