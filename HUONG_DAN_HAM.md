# Hướng Dẫn Hàm Và API

Tài liệu này tóm tắt các API backend, service backend và hàm frontend quan trọng.

## 1. Backend API

File khai báo route: `backend/src/ungDung.js`.

### Kiểm tra hệ thống

| Method | API | Mục đích |
| --- | --- | --- |
| `GET` | `/api/health` | Kiểm tra backend và kết nối MySQL |

### Xác thực

| Method | API | Mục đích |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản và tạo OTP email |
| `POST` | `/api/auth/verify-email` | Xác minh OTP và trả JWT |
| `POST` | `/api/auth/resend-otp` | Gửi lại OTP |
| `POST` | `/api/auth/login` | Đăng nhập bằng email hoặc username |
| `GET` | `/api/auth/me` | Lấy người dùng hiện tại từ JWT |

### Phòng

| Method | API | Mục đích |
| --- | --- | --- |
| `GET` | `/api/rooms` | Lấy danh sách phòng, có lọc theo query |
| `GET` | `/api/rooms/featured` | Lấy phòng nổi bật |
| `GET` | `/api/rooms/:id` | Lấy chi tiết một phòng |

### Voucher

| Method | API | Mục đích |
| --- | --- | --- |
| `GET` | `/api/vouchers` | Lấy danh sách voucher đang có |
| `GET` | `/api/me/vouchers` | Lấy kho voucher của người dùng |
| `POST` | `/api/me/vouchers` | Lưu voucher vào tài khoản |

### Đặt phòng và thanh toán

| Method | API | Mục đích |
| --- | --- | --- |
| `POST` | `/api/bookings` | Tạo đơn đặt phòng |
| `GET` | `/api/bookings/my` | Lấy đơn đặt phòng của người đang đăng nhập |
| `PATCH` | `/api/bookings/:id/status` | Khách hủy hoặc hoàn tất đơn theo quyền cho phép |
| `POST` | `/api/bookings/:id/payments/confirm` | Khách xác nhận thanh toán demo |
| `POST` | `/api/bookings/:id/feedbacks` | Khách gửi phản hồi cho đơn đặt phòng |
| `POST` | `/api/payments/demo-confirm` | Lưu lịch sử thanh toán demo và gửi email |

### Admin

Các API admin cần đăng nhập và có `role = admin`.

| Method | API | Mục đích |
| --- | --- | --- |
| `GET` | `/api/admin/overview` | Lấy số liệu tổng quan |
| `GET` | `/api/admin/customers` | Lấy danh sách khách hàng |
| `GET` | `/api/admin/customers/:id` | Lấy chi tiết khách hàng |
| `PATCH` | `/api/admin/customers/:id` | Cập nhật khách hàng |
| `PATCH` | `/api/admin/customers/:id/status` | Đổi trạng thái khách hàng |
| `DELETE` | `/api/admin/customers/:id` | Xóa khách hàng |
| `GET` | `/api/admin/bookings` | Lấy toàn bộ đơn đặt phòng |
| `PATCH` | `/api/admin/bookings/:id/status` | Admin đổi trạng thái đơn |
| `POST` | `/api/admin/bookings/:id/payments/confirm` | Admin xác nhận thanh toán |
| `PATCH` | `/api/admin/bookings/:id/note` | Lưu ghi chú admin |
| `GET` | `/api/admin/invoices` | Lấy danh sách hóa đơn |
| `GET` | `/api/admin/invoices/:id/download` | Tải file hóa đơn HTML |

## 2. Backend service chính

### `backend/src/services/xacThuc.service.js`

| Hàm | Mục đích |
| --- | --- |
| `dangKyTaiKhoan()` | Kiểm tra dữ liệu, hash mật khẩu, tạo user, tạo OTP |
| `xacMinhOtpEmail()` | Kiểm tra OTP, đánh dấu email đã xác minh, trả JWT |
| `guiLaiOtpEmail()` | Tạo OTP mới cho user chưa xác minh email |
| `dangNhapTaiKhoan()` | Kiểm tra mật khẩu, trạng thái tài khoản và trả JWT |
| `timNguoiDungTheoId()` | Lấy user an toàn theo ID |
| `taoHoacCapNhatQuanTriMacDinh()` | Tạo hoặc cập nhật tài khoản admin dev |

### `backend/src/services/phong.service.js`

| Hàm | Mục đích |
| --- | --- |
| `layDanhSachPhong()` | Lọc, sắp xếp và phân trang danh sách phòng |
| `layPhongNoiBat()` | Lấy phòng nổi bật để hiển thị trang chủ |
| `layPhongTheoId()` | Lấy chi tiết phòng theo ID |

### `backend/src/services/datPhong.service.js`

| Hàm | Mục đích |
| --- | --- |
| `taoDatPhong()` | Tạo booking, tính tiền, tạo hóa đơn, gửi email |
| `layDanhSachHoaDon()` | Lấy danh sách hóa đơn cho admin |
| `layHoaDonTheoId()` | Lấy hóa đơn để tải file |

### `backend/src/services/quanLyDatPhong.service.js`

| Hàm | Mục đích |
| --- | --- |
| `layDatPhongCuaNguoiDung()` | Lấy đơn đặt phòng của một user |
| `layTatCaDatPhong()` | Lấy toàn bộ đơn cho admin |
| `capNhatTrangThaiDatPhong()` | Đổi trạng thái đơn và ghi log |
| `xacNhanThanhToan()` | Xác nhận thanh toán, áp voucher, tạo giao dịch |
| `luuGhiChuAdmin()` | Lưu ghi chú nội bộ của admin |
| `guiPhanHoiKhachHang()` | Lưu phản hồi hoặc khiếu nại của khách |

### `backend/src/services/quanTri.service.js`

| Hàm | Mục đích |
| --- | --- |
| `layTongQuanQuanTri()` | Tính số liệu dashboard admin |
| `layDanhSachKhachHang()` | Tìm và lọc khách hàng |
| `layChiTietKhachHang()` | Lấy hồ sơ khách hàng kèm lịch sử |
| `capNhatKhachHang()` | Sửa thông tin khách hàng |
| `capNhatTrangThaiKhachHang()` | Khóa hoặc mở tài khoản |
| `xoaKhachHang()` | Xóa khách hàng theo quyền admin |

### Service phụ

| File | Mục đích |
| --- | --- |
| `hoaDon.service.js` | Tạo file hóa đơn HTML |
| `thuDienTu.service.js` | Gửi email qua SMTP |
| `thanhToan.service.js` | Ghi lịch sử chuyển khoản demo và gửi email |
| `voucher.service.js` | Đọc và lưu voucher |

## 3. Middleware

| Hàm | File | Mục đích |
| --- | --- | --- |
| `yeuCauDangNhap()` | `backend/src/middleware/xacThuc.middleware.js` | Đọc JWT, kiểm tra user và gắn `req.user` |
| `yeuCauQuanTri()` | `backend/src/ungDung.js` | Chỉ cho phép user có `role = admin` |

## 4. Frontend API service

File kết nối chung: `frontend/src/services/ketNoiApi.js`.

`ketNoiApi` dùng Axios với `baseURL = /api`. Trước mỗi request, token trong Zustand store được gắn vào header:

```text
Authorization: Bearer <token>
```

Nếu API trả `401`, frontend tự xóa session.

| File | Hàm chính |
| --- | --- |
| `xacThucApi.js` | `dangKyTaiKhoan`, `dangNhapTaiKhoan`, `xacMinhOtpEmail`, `guiLaiOtpEmail`, `layNguoiDungHienTai` |
| `phongApi.js` | `layDanhSachPhong`, `layPhongNoiBat`, `layPhongTheoId` |
| `datPhongApi.js` | `taoDatPhong`, `layDatPhongCuaToiApi`, `layTatCaDatPhongAdminApi`, `capNhatTrangThaiDatPhongApi`, `xacNhanThanhToanDatPhongApi` |
| `voucherApi.js` | `layDanhSachVoucherApi`, `layKhoVoucherApi`, `luuVoucherApi` |
| `quanTriApi.js` | API dashboard, khách hàng và trạng thái khách hàng |

## 5. Frontend utility quan trọng

| File | Mục đích |
| --- | --- |
| `utils/vietQr.js` | Tạo mã thanh toán và URL ảnh VietQR |
| `utils/lichSuDatPhong.js` | Hỗ trợ dữ liệu booking demo trong localStorage |
| `utils/lichSuXemPhong.js` | Lưu phòng đã xem và phòng yêu thích |
| `utils/lichSuTimKiem.js` | Lưu lịch sử tìm kiếm |
| `utils/diemThuong.js` | Tính điểm thưởng, điều kiện voucher và quà |
| `utils/dinhDang.js` | Định dạng tiền |
| `utils/phanQuyen.js` | Kiểm tra quyền admin |
| `utils/tinhTrangPhong.js` | Đổi số lượng phòng còn lại thành trạng thái hiển thị |

## 6. Store xác thực

File: `frontend/src/store/khoXacThuc.js`.

Store lưu:

- `token`
- `user`
- `isAuthReady`

Các hàm chính:

- `setSession()`: lưu token và user sau đăng nhập hoặc xác minh OTP.
- `setUser()`: cập nhật thông tin user.
- `clearSession()`: đăng xuất hoặc xóa session khi token hết hạn.
- `markReady()` và `markPending()`: đánh dấu trạng thái khởi tạo xác thực.
