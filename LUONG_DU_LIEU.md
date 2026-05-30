# Luồng dữ liệu chính

Tài liệu này tóm tắt đường đi dữ liệu trong chương trình DieuBel.

## 1. Luồng frontend gọi backend

```text
Page/Component
   ↓
Hook hoặc service frontend
   ↓
ketNoiApi.js gắn token
   ↓
/api trên Vite proxy
   ↓
Express backend
   ↓
Service module
   ↓
MySQL
   ↓
Response JSON
   ↓
React render lại UI
```

## 2. Luồng tạo booking

```text
DatPhong.jsx
   ↓
taoDatPhong trong datPhongApi.js
   ↓
POST /api/bookings
   ↓
datPhong.service.js
   ↓
transaction + SELECT phòng FOR UPDATE
   ↓
insert bookings/payment/status log
   ↓
commit
   ↓
DatPhongCuaToi.jsx hiển thị đơn
```

## 3. Luồng thanh toán

```text
Khách/Admin xác nhận thanh toán
   ↓
/api/bookings/:id/payments/confirm
   ↓
quanLyDatPhong.service.js
   ↓
cập nhật payment_status, paid_amount, remaining_amount
   ↓
booking chuyển sang confirmed nếu đủ điều kiện
   ↓
frontend refetch danh sách booking
```

## 4. Luồng check-in QR LAN

```text
Khách mở QR trong DatPhongCuaToi.jsx
   ↓
Điện thoại LAN mở QuetCheckIn.jsx với token
   ↓
POST /api/bookings/public-checkin
   ↓
backend kiểm tra token và ngày nhận phòng
   ↓
Nếu chưa đến ngày: trả early, không đổi trạng thái
   ↓
Nếu đã đến ngày: ghi frontdesk_verified_at
   ↓
frontend báo nhận phòng thành công
```

## 5. Luồng scanner nền

```text
backend khởi động
   ↓
khoiDongQuetTrangThaiDatPhongNen()
   ↓
mỗi BOOKING_STATUS_SCANNER_INTERVAL_MS
   ↓
đơn holding quá hạn thanh toán -> expired
đơn confirmed + paid đến ngày nhận -> checked_in
đơn checked_in hết ngày trả -> checked_out
```

## 6. Luồng admin

```text
Admin mở QuanLyDatPhong.jsx
   ↓
layTatCaDatPhongAdminApi
   ↓
GET /api/admin/bookings
   ↓
backend đồng bộ trạng thái theo thời gian
   ↓
trả danh sách booking
   ↓
bookingHelpers.js lọc theo tab
   ↓
BookingQueueItem + BookingDetail render UI
```

## 7. Luồng hóa đơn

```text
Booking đủ dữ liệu
   ↓
hoaDon.service.js sinh HTML
   ↓
lưu vào Hóa đơn admin/
   ↓
Express phục vụ static file
   ↓
frontend mở hóa đơn
```

## 8. Luồng thông báo

```text
Page gọi khoThongBao.js
   ↓
BoThongBaoToanCuc.jsx nhận state
   ↓
toast hiển thị toàn app
```

## 9. Điểm cần kiểm tra khi sửa dữ liệu

- Sửa booking status: kiểm tra backend constant, frontend constant/helper, admin tab, progress UI.
- Sửa payment: kiểm tra API confirm payment, booking mapper, UI thanh toán.
- Sửa database: cập nhật `final_database.sql` và service đảm bảo cấu trúc nếu cần.
- Sửa route: kiểm tra `services/` frontend tương ứng.
