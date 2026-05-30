# Ghi chú dự án và luồng vận hành

Tài liệu này ghi lại các luồng quan trọng của DieuBel để khi sửa code không làm lệch nghiệp vụ. Phần trọng tâm là đặt phòng, thanh toán, check-in/check-out, QR LAN và quản trị admin.

## 1. Mục tiêu hệ thống

DieuBel phục vụ hai nhóm người dùng:

- Khách hàng: tìm phòng, xem chi tiết, đặt phòng, thanh toán demo, dùng voucher, nhận phòng bằng QR, trả phòng, gửi hỗ trợ và đánh giá.
- Admin: quản lý đặt phòng, phòng, khách hàng, hóa đơn, doanh thu, voucher/marketing, hỗ trợ và vận hành.

Yêu cầu kỹ thuật chính:

- Dữ liệu booking phải nhất quán giữa frontend, backend và database.
- Backend phải kiểm tra trạng thái trước khi cho đổi trạng thái booking.
- Các thao tác quan trọng nên có log để truy vết.
- Giao diện phải giải thích rõ cho người dùng vì đây là demo không có khách/lễ tân thật.

## 2. Luồng khởi động

```text
npm run dev trong backend
   ↓
backend/src/mayChu.js nạp .env
   ↓
tạo/cập nhật admin mặc định
   ↓
Express listen tại PORT/HOST
   ↓
khởi động booking status scanner nền
```

```text
npm run dev trong frontend
   ↓
Vite chạy tại port 5714
   ↓
React mount UngDung.jsx
   ↓
React Router chọn page
   ↓
page dùng service/hook gọi /api
   ↓
Vite proxy request sang backend :5000
```

## 3. Luồng đăng nhập và phân quyền

```text
Form đăng nhập/đăng ký
   ↓
xacThucApi.js
   ↓
ketNoiApi.js gắn base URL và interceptor
   ↓
backend auth service kiểm tra dữ liệu
   ↓
JWT được trả về frontend
   ↓
khoXacThuc.js lưu user/token
   ↓
TuyenDuongBaoVe.jsx cho phép vào route phù hợp
```

Khi API trả `401`, interceptor trong `ketNoiApi.js` xóa phiên và đưa người dùng về trạng thái cần đăng nhập lại.

## 4. Luồng tìm và xem phòng

```text
Trang chủ hoặc danh sách phòng
   ↓
ThanhTimKiem.jsx / BoLocBenTrai.jsx
   ↓
phongApi.js
   ↓
backend rooms/phong.service.js
   ↓
MySQL trả danh sách phòng
   ↓
ThePhong.jsx render card phòng
```

Chi tiết phòng:

```text
Người dùng bấm xem chi tiết
   ↓
ChiTietPhong.jsx
   ↓
phongApi.js lấy thông tin phòng
   ↓
backend trả ảnh, giá, tiện nghi, sức chứa, đánh giá
   ↓
frontend hiển thị CTA đặt phòng
```

## 5. Luồng tạo đặt phòng

```text
DatPhong.jsx
   ↓
khách chọn ngày, số khách, số phòng, dịch vụ, voucher
   ↓
datPhongApi.js gửi POST /api/bookings
   ↓
datPhong.service.js mở transaction
   ↓
SELECT phòng FOR UPDATE
   ↓
kiểm tra tồn kho, ngày, voucher, giá
   ↓
trừ inventory_count
   ↓
tạo booking, payment transaction, status log
   ↓
commit
   ↓
frontend refetch và hiển thị đơn
```

Điểm không được bỏ:

- Backend luôn kiểm tra ngày nhận/trả và số lượng phòng.
- Tạo booking phải có transaction.
- Nếu lỗi giữa chừng phải rollback.
- Không chuyển booking tương lai sang `checked_in` ngay sau thanh toán.

## 6. Luồng thanh toán demo

```text
Booking được tạo
   ↓
khách chọn thanh toán toàn bộ hoặc cọc
   ↓
frontend hiển thị VietQR/demo payment
   ↓
xác nhận thanh toán gọi /api/bookings/:id/payments/confirm
   ↓
quanLyDatPhong.service.js cập nhật payment_status, paid_amount, remaining_amount
   ↓
booking chuyển sang confirmed khi đủ điều kiện
   ↓
frontend hiển thị tiến trình booking
```

Ghi chú:

- Thanh toán hiện là demo, không xác thực giao dịch ngân hàng thật.
- Dữ liệu VietQR dùng để trình bày trải nghiệm.
- Logic thanh toán hiện nằm trong `bookings/quanLyDatPhong.service.js`, không còn module `payments/thanhToan.service.js`.

## 7. Luồng check-in/check-out qua đêm

Đây là luồng đã được chuẩn hóa cho demo.

### 7.1. Đơn đặt trong tương lai

Ví dụ hôm nay là `31/05/2026`, khách đặt từ `13/06/2026` đến `14/06/2026`.

```text
Thanh toán thành công
   ↓
booking_status = confirmed
payment_status = paid
   ↓
Admin thấy đơn trong "Tất cả" và "Chờ ngày nhận phòng"
   ↓
Khách mở QR thấy thông báo:
"Mã nhận phòng sẵn sàng, chỉ có hiệu lực từ 00:00 ngày 13/06/2026"
```

Nếu quét QR trước ngày 13/06:

```text
QuetCheckIn.jsx gọi /api/bookings/public-checkin
   ↓
backend kiểm tra check_in_date > hôm nay
   ↓
trả verificationStatus = early
   ↓
frontend báo "Mã Chưa Có Hiệu Lực"
   ↓
không đổi booking_status
```

### 7.2. Đến ngày nhận phòng

```text
00:00 ngày check-in
   ↓
booking status scanner nền chạy
   ↓
confirmed + paid + check_in_date <= hôm nay
   ↓
booking_status = checked_in
checked_in_at = NOW()
frontdesk_verified_at vẫn NULL
```

Ý nghĩa:

- `checked_in` lúc này là hệ thống tự mở nhận phòng.
- Chưa có `frontdesk_verified_at` nghĩa là lễ tân chưa quét QR.
- UI khách hiển thị bước 4 mở một phần.

### 7.3. Xác minh lễ tân qua LAN

```text
Khách mở QR nhận phòng
   ↓
lễ tân/điện thoại cùng LAN quét QR
   ↓
QuetCheckIn.jsx gọi public-checkin
   ↓
backend ghi frontdesk_verified_at
   ↓
bước 4 chuyển thành hoàn tất
   ↓
khách được phép check-out thủ công
```

### 7.4. Trả phòng

```text
Khách đã checked_in và frontdesk_verified_at có giá trị
   ↓
nút trả phòng mở
   ↓
khách bấm trả phòng
   ↓
booking_status = checked_out
```

Nếu khách quên:

```text
Đến hết ngày check_out_date 23:59
   ↓
scanner nền tự chuyển checked_out
   ↓
đơn hoàn tất 5/5
```

## 8. Luồng admin đặt phòng

```text
Admin đăng nhập
   ↓
TuyenDuongBaoVe.jsx kiểm tra role
   ↓
QuanLyDatPhong.jsx tải /api/admin/bookings
   ↓
bookingHelpers.js lọc theo tab
   ↓
BookingQueueItem.jsx hiển thị hàng đợi
   ↓
BookingDetail.jsx hiển thị chi tiết và hành động
```

Tab quan trọng:

- `Tất cả`: mọi đơn đang vận hành, gồm cả đơn tương lai.
- `Chờ ngày nhận phòng`: đơn đã thanh toán nhưng ngày check-in nằm trong tương lai.
- `Hôm nay & Lưu trú`: đơn đến ngày xử lý hoặc đang lưu trú.
- `Cần xử lý`: đơn cần thao tác admin như hoàn tiền/hỗ trợ/trạng thái bất thường.
- `Lịch sử`: đơn đã hoàn tất, hủy, hết hạn hoặc no-show.

## 9. Luồng hóa đơn

```text
Booking đủ dữ liệu
   ↓
hoaDon.service.js sinh HTML
   ↓
lưu vào thư mục hóa đơn admin
   ↓
Express phục vụ static file
   ↓
admin/khách mở từ frontend
```

Ghi chú:

- Hóa đơn HTML là artifact sinh ra, không nên commit vào git.
- `.gitignore` đã đưa `Hóa đơn admin/` vào nhóm bỏ qua.

## 10. Luồng voucher

```text
frontend lấy voucher công khai/voucher của tôi
   ↓
voucherApi.js
   ↓
voucher.service.js
   ↓
backend trả danh sách hợp lệ để hiển thị
```

Khi đặt phòng:

```text
DatPhong.jsx gửi voucherCode
   ↓
datPhong.service.js kiểm tra lại điều kiện voucher
   ↓
tính giảm giá
   ↓
lưu voucher vào booking/payment
```

Backend là nguồn quyết định voucher hợp lệ; frontend chỉ hỗ trợ hiển thị và chọn mã.

## 11. Luồng thông báo toàn cục

```text
component/page cần báo kết quả
   ↓
gọi khoThongBao.js
   ↓
BoThongBaoToanCuc.jsx render toast
   ↓
toast tự đóng hoặc người dùng đóng
```

Lợi ích:

- Không cần mỗi page tự dựng toast riêng.
- Trạng thái success/error/warning/info thống nhất.
- Dễ thay đổi giao diện thông báo ở một nơi.

## 12. Nguyên tắc sửa code tiếp theo

- Không đưa logic nghiệp vụ nặng vào JSX.
- Không gọi database trực tiếp ngoài backend service.
- Không để route trong `ungDung.js` phình thêm nếu có thời gian tách router.
- Khi thêm trạng thái booking mới, phải cập nhật:
  - Backend constants.
  - Mapper booking.
  - Frontend `lichSuDatPhong.js`.
  - Admin booking helpers.
  - My bookings progress.
  - Tài liệu vận hành.
- Khi thêm field database mới, cập nhật:
  - `final_database.sql`.
  - `cauTrucVanHanh.service.js` nếu cần tự thêm cột khi chạy app.
  - Mapper backend.
  - UI liên quan.

## 13. Các điểm đã dọn trong lần rà soát này

- Viết lại tài liệu Markdown bị lỗi mã hóa.
- Loại mô tả module `payments/thanhToan.service.js` đã không còn đúng.
- Thêm tài liệu tính năng nổi bật.
- Thêm `.env.example` cho backend và frontend.
- Cập nhật `.gitignore` để bỏ qua thư viện, build, hóa đơn, upload, storage và artifact phân tích.
- Giữ nguyên cấu trúc source đang chạy ổn, chưa move hàng loạt file để tránh gãy import trong khi repo đang có nhiều thay đổi.
