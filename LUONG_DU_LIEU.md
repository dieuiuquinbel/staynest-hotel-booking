# Luồng Dữ Liệu

Tài liệu này mô tả cách dữ liệu đi qua frontend, backend và database.

## 1. Sơ đồ tổng quan

```text
Người dùng
  -> React page/component
  -> frontend service dùng Axios
  -> Express route trong backend/src/ungDung.js
  -> backend service xử lý nghiệp vụ
  -> MySQL
  -> trả JSON về frontend
```

Các phần phụ:

```text
Backend service
  -> Nodemailer SMTP để gửi OTP/email
  -> storage/invoices để lưu hóa đơn HTML
  -> storage/lich-su-ck để lưu lịch sử chuyển khoản demo
```

## 2. Luồng đăng ký và xác minh OTP

```text
Trang đăng ký
  -> POST /api/auth/register
  -> dangKyTaiKhoan()
  -> kiểm tra email/username/mật khẩu
  -> bcrypt hash mật khẩu
  -> INSERT users với email_verified = false
  -> tạo OTP 6 số
  -> hash OTP bằng SHA-256
  -> INSERT email_otps
  -> gửi email qua SMTP
  -> frontend hiển thị form nhập OTP
```

Khi nhập OTP:

```text
Form OTP
  -> POST /api/auth/verify-email
  -> xacMinhOtpEmail()
  -> tìm OTP chưa dùng và chưa hết hạn
  -> UPDATE email_otps.used_at
  -> UPDATE users.email_verified = true
  -> ký JWT
  -> frontend lưu token và user vào Zustand
```

Nếu chưa cấu hình SMTP ở môi trường dev:

```text
Backend bỏ qua gửi email
  -> trả devOtp
  -> dùng devOtp để test local
```

## 3. Luồng đăng nhập

```text
Form đăng nhập
  -> POST /api/auth/login
  -> dangNhapTaiKhoan()
  -> tìm user bằng email hoặc username
  -> bcrypt.compare mật khẩu
  -> kiểm tra status = active
  -> ký JWT
  -> frontend lưu session vào Zustand persist
```

Khi gọi API cần đăng nhập:

```text
ketNoiApi interceptor
  -> đọc token từ khoXacThuc
  -> gắn Authorization: Bearer <token>
  -> backend yeuCauDangNhap()
  -> jwt.verify()
  -> tìm user trong DB
  -> gắn req.user
```

## 4. Luồng xem và tìm phòng

```text
Trang chủ hoặc danh sách phòng
  -> layDanhSachPhong(query)
  -> GET /api/rooms
  -> layDanhSachPhong()
  -> tạo bộ lọc từ query
  -> SELECT rooms
  -> chuẩn hóa JSON amenities/gallery
  -> trả danh sách phòng cho frontend
```

Chi tiết phòng:

```text
Trang chi tiết phòng
  -> layPhongTheoId(roomId)
  -> GET /api/rooms/:id
  -> backend đọc rooms và room_images nếu có
  -> frontend hiển thị thông tin phòng
```

## 5. Luồng đặt phòng

```text
Trang đặt phòng
  -> người dùng chọn phòng, ngày, số khách, số phòng, dịch vụ
  -> POST /api/bookings
  -> yeuCauDangNhap()
  -> taoDatPhong()
```

Trong `taoDatPhong()`:

```text
Kiểm tra user đã xác minh email
  -> lấy thông tin phòng
  -> tính số đêm
  -> chuẩn hóa dịch vụ đã chọn
  -> tính tiền phòng
  -> tính tiền dịch vụ
  -> tính tổng tiền
  -> tạo booking_code
  -> bắt đầu transaction MySQL
  -> INSERT bookings
  -> tạo file hóa đơn HTML
  -> INSERT invoices
  -> commit transaction
  -> gửi email xác nhận đặt phòng kèm hóa đơn
  -> trả booking, room, invoice
```

Trạng thái ban đầu:

- `booking_status = holding`
- `payment_status = unpaid`
- `deposit_amount = 10% tổng tiền`
- `remaining_amount = tổng tiền`
- `payment_deadline = 15 phút sau khi đặt`

## 6. Luồng xem đơn của khách

```text
Trang Đặt phòng của tôi
  -> GET /api/bookings/my
  -> layDatPhongCuaNguoiDung(userId)
  -> SELECT bookings + users + rooms
  -> gom thêm status_logs, payment_transactions, feedbacks
  -> mapBooking()
  -> frontend render danh sách và tiến trình
```

Frontend vẫn có một số helper localStorage trong `utils/lichSuDatPhong.js` để hỗ trợ dữ liệu demo. Dữ liệu chính của đơn đặt phòng hiện nằm trong MySQL.

## 7. Luồng xác nhận thanh toán

Khách hoặc admin xác nhận thanh toán:

```text
POST /api/bookings/:id/payments/confirm
hoặc
POST /api/admin/bookings/:id/payments/confirm
  -> xacNhanThanhToan()
```

Trong `xacNhanThanhToan()`:

```text
Tìm booking
  -> nếu có voucher thì kiểm tra điều kiện
  -> tính discount_amount
  -> tính total_price mới
  -> xác định thanh toán cọc hay toàn bộ
  -> tạo payment_code nếu chưa có
  -> tạo checkin_qr_token nếu chưa có
  -> UPDATE bookings thành confirmed
  -> UPDATE user_vouchers nếu voucher được dùng
  -> INSERT payment_transactions
  -> INSERT booking_status_logs
  -> trả lại danh sách booking mới nhất
```

Trạng thái thanh toán:

- `deposit_paid`: đã thanh toán cọc.
- `paid`: đã thanh toán đủ.
- `unpaid`: chưa thanh toán.

## 8. Luồng đổi trạng thái đơn

Admin có thể đổi nhiều trạng thái. Khách chỉ được tự cập nhật một số trạng thái được cho phép.

```text
PATCH /api/admin/bookings/:id/status
hoặc
PATCH /api/bookings/:id/status
  -> capNhatTrangThaiDatPhong()
  -> UPDATE bookings
  -> INSERT booking_status_logs
```

Các trạng thái chính:

- `holding`: đang giữ chỗ.
- `confirmed`: đã xác nhận.
- `checked_in`: đã nhận phòng.
- `checked_out`: đã trả phòng.
- `cancelled`: đã hủy.
- `no_show`: khách không đến.

## 9. Luồng hóa đơn

Khi tạo booking:

```text
taoDatPhong()
  -> taoFileHoaDon()
  -> tạo HTML trong backend/storage/invoices
  -> INSERT invoices
```

Admin xem và tải hóa đơn:

```text
GET /api/admin/invoices
  -> layDanhSachHoaDon()

GET /api/admin/invoices/:id/download
  -> layHoaDonTheoId()
  -> res.download(file_path)
```

## 10. Luồng phản hồi khách hàng

```text
Khách gửi phản hồi từ đơn đặt phòng
  -> POST /api/bookings/:id/feedbacks
  -> guiPhanHoiKhachHang()
  -> kiểm tra booking thuộc user hiện tại
  -> INSERT customer_feedbacks
  -> trả lại danh sách booking của user
```

## 11. Luồng quản trị khách hàng

```text
Admin dashboard
  -> GET /api/admin/overview
  -> layTongQuanQuanTri()
  -> tính doanh thu, đơn, khách hàng, phòng
```

Quản lý khách hàng:

```text
GET /api/admin/customers
  -> layDanhSachKhachHang()

GET /api/admin/customers/:id
  -> layChiTietKhachHang()

PATCH /api/admin/customers/:id
  -> capNhatKhachHang()

PATCH /api/admin/customers/:id/status
  -> capNhatTrangThaiKhachHang()

DELETE /api/admin/customers/:id
  -> xoaKhachHang()
```

## 12. Bảng dữ liệu chính

| Bảng | Chứa dữ liệu |
| --- | --- |
| `users` | Tài khoản khách hàng và admin |
| `email_otps` | OTP xác minh email |
| `rooms` | Thông tin phòng/khách sạn |
| `room_images` | Ảnh phụ của phòng |
| `bookings` | Đơn đặt phòng |
| `invoices` | Hóa đơn của booking |
| `services` | Dịch vụ cộng thêm |
| `booking_services` | Dịch vụ gắn với booking |
| `vouchers` | Mã ưu đãi |
| `user_vouchers` | Voucher đã lưu hoặc đã dùng của user |
| `payment_transactions` | Giao dịch thanh toán |
| `booking_status_logs` | Lịch sử đổi trạng thái đơn |
| `customer_feedbacks` | Phản hồi/khiếu nại của khách |
| `room_reviews` | Đánh giá phòng |
| `favorite_rooms` | Phòng yêu thích |
| `admin_audit_logs` | Lịch sử thao tác admin |

## 13. Nguyên tắc đọc code

Khi cần hiểu một chức năng, đọc theo thứ tự:

```text
frontend/src/pages
  -> frontend/src/services
  -> backend/src/ungDung.js
  -> backend/src/services
  -> database/*.sql
```

Ví dụ muốn hiểu đặt phòng:

```text
frontend/src/pages/DatPhong.jsx
  -> frontend/src/services/datPhongApi.js
  -> POST /api/bookings trong backend/src/ungDung.js
  -> backend/src/services/datPhong.service.js
  -> bảng bookings và invoices
```
