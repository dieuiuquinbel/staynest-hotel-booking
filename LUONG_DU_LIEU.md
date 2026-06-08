# Luồng dữ liệu và nghiệp vụ DieuBel

Tài liệu này mô tả đường đi dữ liệu và các luồng nghiệp vụ cần giữ khi sửa code. Trong dự án này, booking là trung tâm: thay đổi booking thường ảnh hưởng frontend, backend, database, admin, hóa đơn và thông báo.

## 1. Luồng frontend gọi backend

```text
Page/Component
   |
Hook hoặc service frontend
   |
ketNoiApi.js gắn token
   |
/api trên Vite proxy
   |
Express backend
   |
Service module
   |
MySQL
   |
Response JSON
   |
React Query/Zustand/local state
   |
React render lại UI
```

Quy ước:

- Frontend service chỉ gọi API và trả dữ liệu.
- Page/component xử lý hiển thị, validation UI và thao tác người dùng.
- Backend service mới là nơi quyết định nghiệp vụ hợp lệ.
- Database chỉ được gọi trực tiếp từ backend.

## 2. Luồng khởi động

Backend:

```text
npm run dev trong backend
   |
backend/src/mayChu.js nạp .env
   |
tạo/cập nhật admin mặc định
   |
Express listen tại PORT/HOST
   |
khởi động booking status scanner nền
```

Frontend:

```text
npm run dev trong frontend
   |
Vite chạy dev server
   |
React mount UngDung.jsx
   |
React Router chọn page
   |
page dùng service/hook gọi /api
   |
Vite proxy request sang backend :5000
```

## 3. Luồng đăng nhập và phân quyền

```text
Form đăng nhập/đăng ký
   |
xacThucApi.js
   |
ketNoiApi.js gắn base URL và interceptor
   |
backend auth service kiểm tra dữ liệu
   |
JWT trả về frontend
   |
khoXacThuc.js lưu user/token
   |
TuyenDuongBaoVe.jsx cho phép vào route phù hợp
```

Khi API trả `401`, interceptor trong `ketNoiApi.js` xóa phiên và đưa người dùng về trạng thái cần đăng nhập lại.

## 4. Luồng tìm và xem phòng

Danh sách phòng:

```text
Trang chủ hoặc DanhSachPhong.jsx
   |
ThanhTimKiem.jsx / BoLocBenTrai.jsx
   |
phongApi.js
   |
rooms/phong.service.js
   |
MySQL trả danh sách phòng
   |
ThePhong.jsx render card phòng
```

Chi tiết phòng:

```text
Người dùng bấm xem chi tiết
   |
ChiTietPhong.jsx
   |
phongApi.js lấy thông tin phòng
   |
backend trả ảnh, giá, tiện nghi, sức chứa, đánh giá
   |
frontend hiển thị CTA đặt phòng
```

Cần giữ:

- UI phòng phải hiện rõ ảnh, giá, sức chứa, tiện nghi và CTA.
- Backend vẫn là nguồn đúng về giá, tồn kho và điều kiện đặt.

## 5. Luồng yêu thích phòng (Lưu phòng)

Tính năng "Yêu thích" được đồng bộ trực tiếp với database để đảm bảo trải nghiệm liền mạch trên nhiều thiết bị.

Khi người dùng chưa đăng nhập:
```text
Khách vãng lai bấm nút "Yêu thích" tại Trang chủ, Danh sách phòng hoặc Chi tiết phòng
   |
frontend kiểm tra token trong store (khoXacThuc.js)
   |
không có token -> kích hoạt popup mời đăng nhập (hiển thị toàn cục qua UngDung.jsx)
   |
người dùng đăng nhập thành công
   |
hệ thống tự động tải danh sách phòng yêu thích từ database
```

Khi người dùng đã đăng nhập:
```text
Người dùng bấm "Yêu thích"
   |
frontend gọi POST /api/me/favorites (toggle)
   |
backend (yeuThich.service.js) thêm/xóa trong bảng favorite_rooms
   |
trả về { isFavorite: boolean }
   |
frontend cập nhật local state và store để đổi UI nút ngay lập tức
```

Xem danh sách đã lưu:
```text
Trang Lịch sử -> Tab "Phòng đã lưu"
   |
gọi GET /api/me/favorites
   |
backend JOIN favorite_rooms và rooms trả về danh sách đã chuẩn hóa
   |
frontend render thẻ phòng
```

```text
DatPhong.jsx
   |
khách chọn ngày, số khách, số phòng, dịch vụ, voucher
   |
datPhongApi.js gửi POST /api/bookings
   |
datPhong.service.js mở transaction
   |
SELECT phòng FOR UPDATE
   |
kiểm tra tồn kho, ngày, voucher, giá
   |
trừ inventory_count
   |
tạo booking, payment transaction, status log
   |
commit
   |
frontend refetch và hiển thị đơn
```

Điểm không được bỏ:

- Backend luôn kiểm tra ngày nhận/trả.
- Backend luôn kiểm tra số lượng phòng và sức chứa.
- Backend luôn kiểm tra voucher.
- Backend không cho đặt ngày quá khứ và không nhận dịch vụ giá âm từ payload frontend.
- Tạo booking phải có transaction.
- Lỗi giữa chừng phải rollback.
- Không chuyển booking tương lai sang `checked_in` ngay sau thanh toán.

## 6. Luồng voucher

Hiển thị voucher:

```text
frontend lấy voucher công khai/voucher của tôi
   |
voucherApi.js
   |
voucher.service.js
   |
backend trả danh sách hợp lệ để hiển thị
```

Dùng voucher khi đặt phòng:

```text
DatPhong.jsx gửi voucherCode
   |
datPhong.service.js kiểm tra lại điều kiện voucher
   |
tính giảm giá
   |
lưu voucher vào booking/payment
```

Nguyên tắc:

- Frontend chỉ giúp chọn voucher.
- Backend mới quyết định voucher có hợp lệ hay không.
- UI phải hiện giá trước/sau giảm rõ ràng.

## 7. Luồng thanh toán demo

```text
Booking được tạo
   |
khách chọn thanh toán toàn bộ hoặc cọc
   |
frontend hiển thị VietQR/demo payment
   |
xác nhận thanh toán gọi /api/bookings/:id/payments/confirm
   |
quanLyDatPhong.service.js cập nhật payment_status, paid_amount, remaining_amount
   |
booking chuyển sang confirmed khi đủ điều kiện
   |
frontend hiển thị tiến trình booking
```

Ghi chú:

- Thanh toán là demo, chưa xác thực giao dịch ngân hàng thật.
- Dữ liệu VietQR dùng để trình bày trải nghiệm.
- Logic thanh toán nằm trong `bookings/quanLyDatPhong.service.js`, không còn module `payments/thanhToan.service.js`.

## 8. Luồng check-in QR LAN

Đây là luồng quan trọng nhất khi demo.

### 8.1. Đơn đặt trong tương lai

Ví dụ hôm nay là `31/05/2026`, khách đặt từ `13/06/2026` đến `14/06/2026`.

```text
Thanh toán thành công
   |
booking_status = confirmed
payment_status = paid
   |
Admin thấy đơn trong "Tất cả" và "Chờ ngày nhận phòng"
   |
Khách mở QR thấy thông báo:
"Mã nhận phòng sẵn sàng, chỉ có hiệu lực từ 00:00 ngày 13/06/2026"
```

Nếu quét QR trước ngày 13/06:

```text
QuetCheckIn.jsx gọi /api/bookings/public-checkin
   |
backend kiểm tra check_in_date > hôm nay
   |
trả verificationStatus = early
   |
frontend báo "Mã chưa có hiệu lực"
   |
không đổi booking_status
```

### 8.2. Đến ngày nhận phòng

```text
00:00 ngày check-in
   |
booking status scanner nền chạy
   |
confirmed + paid + check_in_date <= hôm nay
   |
booking_status = checked_in
checked_in_at = NOW()
frontdesk_verified_at vẫn NULL
```

Ý nghĩa:

- `checked_in` lúc này là hệ thống tự mở nhận phòng.
- Chưa có `frontdesk_verified_at` nghĩa là lễ tân chưa quét QR.
- UI khách hiển thị bước 4 ở trạng thái mở một phần.

### 8.3. Xác minh lễ tân qua LAN

```text
Khách mở QR nhận phòng
   |
frontend tạo QR nội bộ từ URL check-in, không gửi token sang bên thứ ba
   |
lễ tân/điện thoại cùng LAN quét QR
   |
QuetCheckIn.jsx gọi public-checkin
   |
backend ghi frontdesk_verified_at
   |
bước 4 chuyển thành hoàn tất
   |
khách được phép check-out thủ công
```

### 8.4. Trả phòng

Khách tự check-out:

```text
Khách đã checked_in và frontdesk_verified_at có giá trị
   |
nút trả phòng mở
   |
khách bấm trả phòng
   |
booking_status = checked_out
```

Scanner tự check-out:

```text
Đến hết ngày check_out_date 23:59
   |
scanner nền tự chuyển checked_out
   |
đơn hoàn tất 5/5
```

Cần giữ:

- Quét QR trước ngày check-in không được chuyển sang `checked_in`.
- `checked_in` nhưng chưa có `frontdesk_verified_at` chưa phải xác minh xong.
- Nút check-out phía khách chỉ mở sau khi có xác minh LAN.
- Auto check-out vẫn chạy để hoàn tất đơn khi khách quên thao tác.

## 9. Luồng trang "Đặt phòng của tôi"

```text
DatPhongCuaToi.jsx
   |
layDatPhongCuaToi qua datPhongApi.js
   |
GET /api/bookings/my
   |
quanLyDatPhong.service.js lấy danh sách booking
   |
frontend phân nhóm/tab theo trạng thái
   |
render card booking + tiến trình + action phù hợp
```

Màn hình này cần hiện:

- Ảnh phòng, tên khách sạn/phòng, địa chỉ.
- Mã đơn.
- Trạng thái booking.
- Trạng thái thanh toán.
- Timeline 5 bước.
- QR nhận phòng và trạng thái hiệu lực mã.
- Nút thanh toán, hóa đơn, hỗ trợ, xem phòng, trả phòng tùy điều kiện.

Khi đổi status booking, cần kiểm tra:

- `frontend/src/utils/lichSuDatPhong.js`
- `DatPhongCuaToi.jsx`
- `components/bookings/my-bookings/MyBookingsProgress.jsx`
- Backend constants/logic trong `quanLyDatPhong.service.js`

## 10. Luồng admin đặt phòng

```text
Admin đăng nhập
   |
TuyenDuongBaoVe.jsx kiểm tra role
   |
QuanLyDatPhong.jsx tải /api/admin/bookings
   |
bookingHelpers.js lọc theo tab
   |
BookingQueueItem.jsx hiển thị hàng đợi
   |
BookingDetail.jsx hiển thị chi tiết và hành động
```

Tab quan trọng:

- `Tất cả`: mọi đơn đang vận hành, gồm cả đơn tương lai.
- `Chờ ngày nhận phòng`: đơn đã thanh toán nhưng ngày check-in nằm trong tương lai.
- `Hôm nay & Lưu trú`: đơn đến ngày xử lý hoặc đang lưu trú.
- `Chờ thanh toán`: đơn cần thanh toán.
- `Cần xử lý`: đơn cần admin can thiệp như hoàn tiền, hỗ trợ, trạng thái bất thường.
- `Lịch sử`: đơn đã hoàn tất, hủy, hết hạn hoặc no-show.

Cần giữ:

- Backend phải kiểm tra trạng thái trước khi cập nhật, không chỉ dựa vào nút frontend.
- Thao tác quan trọng phải ghi log.
- UI admin cần rõ trạng thái và action tiếp theo, không nên trang trí làm chậm thao tác.

## 11. Luồng hóa đơn

```text
Booking đủ dữ liệu
   |
hoaDon.service.js sinh HTML
   |
lưu vào `backend/storage/invoices`
   |
Express phục vụ static file
   |
admin/khách mở từ frontend
```

Ghi chú:

- Hóa đơn HTML là artifact sinh ra, không nên commit.
- Không sửa file trong `backend/storage/invoices/` nếu không đang xử lý riêng output hóa đơn.

## 13. Luồng hoàn tiền (Refunds)

```text
Khách gửi yêu cầu hoàn tiền từ DatPhongCuaToi.jsx
   |
datPhongApi.js gọi POST /api/bookings/:id/refund-requests
   |
hoanTien.service.js kiểm tra trạng thái thanh toán, tạo yêu cầu
   |
Admin thấy yêu cầu trong AdminOperations.jsx (Tab Hoàn tiền)
   |
Admin duyệt (approved) hoặc từ chối (rejected)
   |
hoanTien.service.js cập nhật trạng thái đơn thành 'cancelled', lưu phí hủy và hoàn tiền
   |
Hệ thống gửi email thông báo kết quả hoàn tiền cho khách
```

Cần giữ:
- Phí hủy 20% (hoặc tùy quy định) được tính tự động.
- Chỉ đơn đã thanh toán (`paid`, `deposit_paid`) mới được gửi yêu cầu hoàn tiền.
- Khi duyệt hoàn tiền, booking tự động chuyển trạng thái `cancelled`.

## 14. Luồng hỗ trợ và khiếu nại (Support & Feedbacks)

```text
Khách gửi khiếu nại/hỗ trợ từ DatPhongCuaToi.jsx
   |
datPhongApi.js gọi POST /api/bookings/support hoặc /api/bookings/:id/feedbacks
   |
hoTro.service.js lưu yêu cầu vào database (bảng support_tickets hoặc customer_feedbacks)
   |
Admin nhận yêu cầu tại AdminOperations.jsx (Tab Khiếu nại/Hỗ trợ)
   |
Admin nhập nội dung phản hồi và duyệt
   |
Hệ thống gửi email SMTP báo cho khách hàng kèm nội dung phản hồi của quản lý
```

## 15. Luồng thông báo toàn cục

## 16. Luồng doanh thu/admin report

```text
AdminRevenue.jsx
   |
quanTriApi.js gọi GET /api/admin/revenue
   |
baoCao.service.js tính doanh thu theo khoảng ngày và lũy kế
   |
RevenueCards.jsx + revenueHelpers.js render thống kê
```

Khi sửa doanh thu:

- Doanh thu bao gồm các đơn đã thanh toán.
- `customer_paid_amount` là tiền khách thực trả.
- `net_revenue` = Tiền khách đã trả - Số tiền đã hoàn.
- Có tính cả doanh thu phí hủy phòng (`cancel_fee_revenue`).

## 17. Checklist khi sửa nghiệp vụ

### Sửa booking status

Kiểm tra:

- Backend constants/logic trong `quanLyDatPhong.service.js`.
- Mapper booking backend.
- `booking_status_logs`.
- `frontend/src/utils/lichSuDatPhong.js`.
- `components/admin/bookings/bookingConstants.js`.
- `components/admin/bookings/bookingHelpers.js`.
- `DatPhongCuaToi.jsx` và progress UI.
- `QuetCheckIn.jsx` nếu status liên quan check-in.

### Sửa payment

Kiểm tra:

- API confirm payment.
- Mapper booking.
- UI thanh toán trong booking của tôi.
- Trang admin booking.
- Hóa đơn.
- Báo cáo doanh thu.

### Sửa voucher

Kiểm tra:

- `voucher.service.js`.
- `datPhong.service.js`.
- UI chọn voucher.
- Giá trước/sau giảm.
- Điều kiện tối thiểu/phần trăm/số tiền.

### Sửa database

Kiểm tra:

- `database/final_database.sql`.
- Service đảm bảo cấu trúc nếu cần.
- Mapper backend.
- UI liên quan field mới.

### Sửa route/API

Kiểm tra:

- `backend/src/ungDung.js`.
- Service backend.
- `frontend/src/services/*Api.js`.
- Page/component đang dùng endpoint.

## 15. Nguyên tắc sửa code tiếp theo

- Không đưa logic nghiệp vụ nặng vào JSX.
- Không gọi database trực tiếp ngoài backend service.
- Không để `ungDung.js` phình thêm nếu có thời gian tách router.
- Không đổi API contract, auth, booking state, voucher, QR LAN, invoice hoặc admin workflow nếu không có yêu cầu rõ.
- Sau khi sửa frontend, chạy `npm run build` trong `frontend/` khi khả thi.
