# Hướng dẫn hàm và module chính

Tài liệu này liệt kê các nhóm hàm quan trọng để dễ tìm đúng nơi khi sửa code.

## Backend

### Khởi động và app

- `backend/src/mayChu.js`
  - `khoiDongMayChu()`: chuẩn bị admin mặc định, mở server và khởi động scanner nền booking.
  - `xuLyLoiKhoiDong(error)`: xử lý lỗi cổng đã bị chiếm.

- `backend/src/ungDung.js`
  - Khai báo route `/api/health`, auth, rooms, bookings, admin, invoices.
  - Route chỉ nên điều phối request/response, không nhồi nghiệp vụ dài.

### Xác thực

- `backend/src/modules/auth/xacThuc.service.js`
  - Đăng ký, đăng nhập, OTP, JWT, tài khoản admin mặc định.

- `backend/src/middleware/xacThuc.middleware.js`
  - Kiểm tra token và quyền truy cập.

### Đặt phòng

- `backend/src/modules/bookings/datPhong.service.js`
  - Tạo booking mới.
  - Kiểm tra phòng, ngày, số khách, voucher.
  - Dùng transaction và khóa dòng phòng khi trừ tồn kho.

- `backend/src/modules/bookings/quanLyDatPhong.service.js`
  - `layDatPhongCuaNguoiDung`: danh sách booking của khách.
  - `layTatCaDatPhong`: danh sách booking cho admin.
  - `xacNhanThanhToan`: xác nhận thanh toán demo.
  - `capNhatTrangThaiDatPhong`: đổi trạng thái booking có kiểm tra điều kiện.
  - `xacMinhCheckInCongKhai`: xử lý QR LAN nhận phòng.
  - `khoiDongQuetTrangThaiDatPhongNen`: scanner nền tự check-in/check-out theo thời gian.

### Phòng và đánh giá

- `backend/src/modules/rooms/phong.service.js`
  - Lấy danh sách phòng, chi tiết phòng, phòng nổi bật, thao tác phòng admin.

- `backend/src/modules/rooms/danhGia.service.js`
  - Tạo và lấy đánh giá phòng.

### Voucher, hóa đơn, email

- `backend/src/modules/vouchers/voucher.service.js`
  - Voucher công khai, voucher của tôi, lưu voucher.

- `backend/src/modules/invoices/hoaDon.service.js`
  - Sinh và đọc hóa đơn HTML.

- `backend/src/modules/notifications/thuDienTu.service.js`
  - Gửi OTP và email nghiệp vụ.

## Frontend

### App và route

- `frontend/src/app/UngDung.jsx`
  - Khai báo route, layout, provider và route bảo vệ.

### Trang đặt phòng

- `frontend/src/pages/bookings/DatPhong.jsx`
  - Form tạo booking, chọn ngày/phòng/dịch vụ/voucher.

- `frontend/src/pages/bookings/DatPhongCuaToi.jsx`
  - Danh sách booking của khách, tiến trình 5 bước, QR nhận phòng, thanh toán, hỗ trợ, trả phòng.

- `frontend/src/pages/bookings/QuetCheckIn.jsx`
  - Trang công khai cho điện thoại LAN quét QR.

### Admin booking

- `frontend/src/pages/admin/QuanLyDatPhong.jsx`
  - Màn hình quản lý booking admin.

- `frontend/src/components/admin/bookings/bookingHelpers.js`
  - Lọc tab, tính nhãn hành động, phân loại đơn.

- `frontend/src/components/admin/bookings/BookingDetail.jsx`
  - Chi tiết booking và nút thao tác.

### API client

- `frontend/src/services/ketNoiApi.js`
  - Axios instance, token interceptor, xử lý lỗi phiên.

- `frontend/src/services/datPhongApi.js`
  - API booking, thanh toán, hoàn tiền, hỗ trợ.

- `frontend/src/services/phongApi.js`
  - API phòng.

- `frontend/src/services/xacThucApi.js`
  - API đăng nhập/đăng ký/OTP.

## Nguyên tắc thêm hàm mới

- Hàm nghiệp vụ backend đặt trong service module đúng domain.
- Hàm UI dùng riêng một page thì để trong page hoặc file helper cạnh page.
- Hàm thuần dùng nhiều nơi thì đặt trong `utils`.
- Không trộn gọi API, format dữ liệu và render JSX vào cùng một hàm dài.
