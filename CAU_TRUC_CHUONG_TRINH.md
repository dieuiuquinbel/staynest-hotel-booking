# Cấu trúc chương trình DieuBel

Tài liệu này gom lại cấu trúc source, vai trò module, các file quan trọng và quy ước sửa code. Khi cần hiểu dự án để sửa đúng chỗ, đọc file này trước, sau đó đọc `LUONG_DU_LIEU.md` nếu thay đổi nghiệp vụ đặt phòng/thanh toán/check-in.

## 1. Cấu trúc cấp repo

```text
D:\Website khách sạn final
|- backend/
|  |- package.json
|  |- .env.example
|  `- src/
|- frontend/
|  |- package.json
|  |- vite.config.js
|  |- .env.example
|  `- src/
|- database/
|  `- final_database.sql
|- README.md
|- CAU_TRUC_CHUONG_TRINH.md
|- LUONG_DU_LIEU.md
`- AGENTS.md
```

Quy tắc đọc nhanh:

- Muốn sửa API, auth, booking, voucher, hóa đơn: vào `backend/src`.
- Muốn sửa giao diện, route, form, admin page: vào `frontend/src`.
- Muốn sửa schema demo: cập nhật `database/final_database.sql`.
- Muốn sửa nghiệp vụ booking: luôn kiểm tra cả frontend, backend và database.

## 2. Backend

### 2.1. Tổng quan

```text
backend/src/
|- mayChu.js
|- ungDung.js
|- config/
|  |- baoMat.js
|  `- coSoDuLieu.js
|- middleware/
|  |- taiAnhPhong.middleware.js
|  `- xacThuc.middleware.js
|- routes/
|  |- adminRoutes.js
|  |- authRoutes.js
|  |- bookingRoutes.js
|  |- invoiceRoutes.js
|  |- roomRoutes.js
|  |- userRoutes.js
|  `- voucherRoutes.js
|- utils/
|  `- thongBaoTiengViet.js
`- modules/
   |- admin/
   |- auth/
   |- bookings/
   |- invoices/
   |- notifications/
   |- rooms/
   |- system/
   `- vouchers/
```

### 2.2. File gốc backend

- `backend/src/mayChu.js`
  - Nạp biến môi trường.
  - Chuẩn bị tài khoản admin mặc định.
  - Mở HTTP server.
  - Khởi động scanner nền cho trạng thái booking.
  - Mặc định chạy trên `PORT=5000`, `HOST=0.0.0.0` để thiết bị cùng LAN có thể gọi API.

- `backend/src/ungDung.js`
  - Tạo Express app.
  - Cấu hình CORS, JSON parser, static upload, static invoice.
  - Khai báo route public, route khách hàng và route admin.
  - File này chỉ nên lắp route và trả response; nghiệp vụ chi tiết nên nằm trong service.

- `backend/src/config/coSoDuLieu.js`
  - Tạo MySQL pool bằng `mysql2/promise`.
  - Service nào cần transaction sẽ lấy connection từ pool.

- `backend/src/config/baoMat.js`
  - Đọc cấu hình JWT secret và admin mặc định.
  - Production bắt buộc có `JWT_SECRET`.
  - Admin seed chỉ reset mật khẩu khi bật `DEFAULT_ADMIN_FORCE_RESET=true`.

- `backend/src/middleware/xacThuc.middleware.js`
  - Đọc JWT.
  - Gắn `req.user`.
  - Chặn route yêu cầu đăng nhập hoặc quyền admin.

- `backend/src/middleware/taiAnhPhong.middleware.js`
  - Cấu hình upload ảnh phòng bằng multer.
  - Giới hạn dung lượng, số file và chỉ nhận mimetype ảnh.

### 2.3. Module backend

#### `modules/auth/xacThuc.service.js`

Xử lý:

- Đăng ký.
- Đăng nhập.
- OTP email.
- JWT.
- Hồ sơ người dùng.
- Tài khoản admin mặc định.

Module này là trung tâm xác thực, không nên trộn logic booking/phòng vào đây.

#### `modules/bookings/datPhong.service.js`

Xử lý tạo booking mới:

- Kiểm tra ngày nhận/trả.
- Kiểm tra số khách, số phòng và tồn kho.
- Áp voucher.
- Tính giá, tiền cọc, giảm giá và tổng tiền.
- Tạo mã booking.
- Tạo booking, payment transaction và status log ban đầu.
- Đọc hóa đơn theo booking nếu cần.

Điểm bắt buộc:

- Tạo booking phải dùng transaction.
- Cần khóa dòng phòng khi trừ tồn kho để tránh đặt vượt số lượng.
- Nếu lỗi giữa chừng phải rollback.

#### `modules/bookings/quanLyDatPhong.service.js`

Đây là module quan trọng nhất của vòng đời booking sau khi tạo.

Xử lý:

- `layDatPhongCuaNguoiDung`: danh sách booking của khách.
- `layTatCaDatPhong`: danh sách booking cho admin.
- `xacNhanThanhToan`: xác nhận thanh toán demo.
- `capNhatTrangThaiDatPhong`: đổi trạng thái booking có kiểm tra điều kiện.
- QR check-in công khai.
- Scanner nền check-in/check-out theo thời gian.
- Check-out thủ công.

Điểm cần giữ:

- Booking tương lai sau thanh toán vẫn là `confirmed`, không đổi sang `checked_in` ngay.
- QR quét trước ngày nhận phòng chỉ trả trạng thái sớm, không đổi trạng thái booking.
- `checked_in` có thể là hệ thống tự mở ngày nhận phòng; chỉ khi có `frontdesk_verified_at` mới là lễ tân đã xác minh.

#### `modules/bookings/hoanTien.service.js`

Xử lý nghiệp vụ hoàn tiền, tách từ `quanLyDatPhong.service.js`:

- Tạo yêu cầu hủy/hoàn tiền từ phía khách.
- Tính phí hủy (20%) và số tiền hoàn.
- Admin duyệt/từ chối yêu cầu hoàn tiền.
- Cập nhật trạng thái booking khi duyệt (chuyển sang `cancelled`).
- Gửi email thông báo kết quả hoàn tiền.

#### `modules/bookings/hoTro.service.js`

Xử lý yêu cầu hỗ trợ và khiếu nại, tách từ `quanLyDatPhong.service.js`:

- Khách gửi yêu cầu hỗ trợ (support ticket).
- Lấy danh sách yêu cầu hỗ trợ (của khách hoặc tất cả cho admin).
- Admin phản hồi yêu cầu hỗ trợ.
- Gửi email phản hồi khiếu nại qua SMTP.
- Khách gửi phản hồi trực tiếp trên đơn đặt phòng.

#### `modules/bookings/baoCao.service.js`

Xử lý thống kê và báo cáo doanh thu, tách từ `quanLyDatPhong.service.js`:

- Doanh thu theo kỳ (trong khoảng ngày) và lũy kế (tổng toàn thời gian).
- Thống kê đơn đặt phòng, đơn hủy, no-show.
- Thống kê yêu cầu hoàn tiền (chờ duyệt, đã duyệt, phí hủy thu được).
- Thống kê tồn kho phòng.

#### `modules/bookings/hangSoDatPhong.js`

Tập trung hằng số trạng thái booking, trạng thái thanh toán, phương thức thanh toán và nhóm trạng thái giải phóng tồn kho. Khi thêm status mới, cập nhật file này trước rồi mới đồng bộ helper/frontend.

#### `modules/rooms/phong.service.js`

Xử lý:

- Danh sách phòng.
- Chi tiết phòng.
- Phòng nổi bật.
- CRUD phòng cho admin.
- Upload/gắn ảnh phòng.

#### `modules/rooms/yeuThich.service.js`

Xử lý:

- Toggle yêu thích phòng (thêm/xóa).
- Lấy danh sách phòng yêu thích của người dùng.
- Đồng bộ trạng thái yêu thích qua database.

#### `modules/rooms/danhGia.service.js`

Xử lý:

- Lấy đánh giá phòng.
- Tạo đánh giá khi booking đủ điều kiện.

#### `modules/vouchers/voucher.service.js`

Xử lý:

- Voucher công khai.
- Voucher của người dùng.
- Lưu voucher.
- Dữ liệu voucher dùng trong booking.

Backend là nơi quyết định voucher hợp lệ; frontend chỉ hỗ trợ hiển thị và chọn mã.

#### `modules/invoices/hoaDon.service.js`

Xử lý:

- Sinh hóa đơn HTML.
- Đọc hóa đơn HTML theo booking.

Hóa đơn là artifact sinh ra khi chạy chương trình, không phải source code chính.

#### `modules/notifications/thuDienTu.service.js`

Xử lý:

- Gửi OTP.
- Gửi email xác nhận booking.
- Gửi email nghiệp vụ.

Nếu thiếu SMTP, backend nên bỏ qua gửi mail thay vì dừng server.

#### `modules/admin/quanTri.service.js`

Xử lý:

- Dashboard admin.
- Quản lý khách hàng.
- Doanh thu.
- Audit log.
- Dữ liệu tổng hợp cho admin.

#### `modules/system/cauTrucVanHanh.service.js`

Xử lý đảm bảo cấu trúc database bổ sung khi app cần cột mới để chạy, ví dụ:

- `frontdesk_verified_at`
- `frontdesk_verified_note`

Khi thêm cột mới cho booking, cần cập nhật cả `final_database.sql` và module này nếu muốn app tự bổ sung cột.

### 2.4. Routes

Các route đã được tách thành file riêng trong `backend/src/routes/`:

- `authRoutes.js`: đăng ký, đăng nhập, OTP, token.
- `bookingRoutes.js`: tạo booking, thanh toán, trạng thái, QR check-in công khai.
- `roomRoutes.js`: danh sách, chi tiết, phòng nổi bật.
- `userRoutes.js`: hồ sơ, yêu thích, hoàn tiền, hỗ trợ, phản hồi.
- `adminRoutes.js`: quản lý đặt phòng, phòng, khách hàng, voucher, doanh thu, hóa đơn, hoàn tiền, hỗ trợ.
- `invoiceRoutes.js`: xem và tải hóa đơn.
- `voucherRoutes.js`: voucher công khai.

`ungDung.js` chỉ import và mount các router, không còn chứa handler trực tiếp.

### 2.5. Utils backend

- `utils/thongBaoTiengViet.js`: hàm tạo thông báo, lỗi và response chuẩn hóa bằng tiếng Việt.

### 2.6. Quy ước backend

- Route đặt trong `routes/*.js`.
- Nghiệp vụ đặt trong `modules/*/*.service.js`.
- Query cập nhật nhiều bảng phải dùng transaction.
- Trạng thái booking quan trọng phải ghi `booking_status_logs`.
- API admin không được tin dữ liệu frontend; backend phải kiểm tra trạng thái hiện tại trước khi cập nhật.
- Không commit `.env`, upload, storage hoặc hóa đơn sinh tự động.

## 3. Frontend

### 3.1. Tổng quan

```text
frontend/src/
|- main.jsx
|- index.css
|- app/
|  `- UngDung.jsx
|- components/
|  |- admin/
|  |- auth/
|  |- bookings/
|  |- chatbot/
|  |- layout/
|  |- public/
|  |- rooms/
|  `- search/
|- hooks/
|- pages/
|  |- account/
|  |- admin/
|  |- auth/
|  |- bookings/
|  |- public/
|  `- rooms/
|- services/
|- store/
`- utils/
```

### 3.2. App và route

- `frontend/src/main.jsx`
  - Mount React app.
  - Import CSS global.

- `frontend/src/app/UngDung.jsx`
  - Khai báo React Router.
  - Gắn React Query provider.
  - Gắn layout chung.
  - Gắn route bảo vệ.
  - Gắn chatbot và thông báo toàn cục.

- `frontend/src/components/auth/TuyenDuongBaoVe.jsx`
  - Chặn route yêu cầu đăng nhập.
  - Chặn route yêu cầu role admin.

### 3.3. Pages khách hàng

- `pages/public/TrangChu.jsx`
  - Trang chủ, phòng nổi bật, voucher, popup đánh giá và section giới thiệu.

- `pages/rooms/DanhSachPhong.jsx`
  - Danh sách phòng, lọc, tìm kiếm, phân loại phòng.

- `pages/rooms/ChiTietPhong.jsx`
  - Chi tiết phòng, ảnh, tiện nghi, giá, đánh giá và CTA đặt phòng.

- `pages/bookings/DatPhong.jsx`
  - Form tạo booking, chọn ngày, số khách, số phòng, dịch vụ, voucher và thanh toán.

- `pages/bookings/DatPhongCuaToi.jsx`
  - Danh sách booking của khách.
  - Tiến trình 5 bước.
  - QR nhận phòng.
  - Popup hiệu lực mã.
  - Thanh toán, hỗ trợ, hóa đơn, check-out và trạng thái đơn.

- `pages/bookings/QuetCheckIn.jsx`
  - Trang công khai cho thiết bị LAN quét QR.
  - Phải giữ logic không cho check-in sớm trước ngày nhận phòng.

- `pages/account/TaiKhoan.jsx`, `pages/account/LichSu.jsx`
  - Hồ sơ, điểm thưởng, lịch sử và dữ liệu cá nhân.

### 3.4. Pages admin

- `pages/admin/AdminDashboard.jsx`
  - KPI, cảnh báo, tồn kho, việc cần xử lý.

- `pages/admin/QuanLyDatPhong.jsx`
  - Màn hình quản lý đơn đặt phòng.
  - Điều phối dữ liệu; UI lớn nằm trong `components/admin/bookings`.

- `pages/admin/AdminRooms.jsx`
  - Quản lý phòng, danh sách, lọc kho, tạo phòng.
  - UI lớn nằm trong `components/admin/rooms`.

- `pages/admin/AdminCustomers.jsx`
  - Tìm kiếm, tạo tài khoản khách, sửa thông tin, khóa/xóa.

- `pages/admin/AdminRevenue.jsx`
  - Báo cáo doanh thu theo khoảng thời gian và tổng lũy kế.

- `pages/admin/AdminOperations.jsx`
  - Xử lý hoàn tiền và hỗ trợ/khiếu nại.

- `pages/admin/AdminInvoices.jsx`
  - Tra cứu và xem danh sách hóa đơn.

- `pages/admin/AdminMarketing.jsx`
  - Quản lý voucher/marketing, hiện chủ yếu phần voucher có dữ liệu thật.

### 3.5. Component quan trọng

#### `components/layout`

- Header.
- Footer.
- Bảng mời thành viên.
- Toast/thông báo toàn cục.

#### `components/search`

- `ThanhTimKiem.jsx`: thanh tìm kiếm phòng.
- `BoLocBenTrai.jsx`: bộ lọc danh sách phòng.

Cần giữ mobile dễ bấm, label rõ và không làm chậm luồng tìm phòng.

#### `components/rooms`

- `ThePhong.jsx`: card phòng, cần hiện rõ ảnh, tên, vị trí, sức chứa, giá, trạng thái và CTA.
- `KhungThePhong.jsx`: khung/skeleton card phòng.
- `TheBoLocDangDung.jsx`: chip bộ lọc đang áp dụng.

#### `components/bookings/my-bookings`

- `MyBookingsQrMock.jsx`: QR minh họa nội bộ.
- `MyBookingsVietQr.jsx`: ảnh VietQR khi cấu hình.
- `MyBookingsProgress.jsx`: tiến trình trạng thái đặt phòng của khách.

QR check-in được tạo nội bộ trong frontend, không gọi dịch vụ QR công khai để tránh lộ token nhận phòng.

#### `components/public/home`

- `trangChuData.js`: dữ liệu tĩnh của hero, điểm đến, đánh giá, bộ sưu tập.
- `trangChuHelpers.js`: helper gắn tham số tìm kiếm.
- `HomeVoucherCard.jsx`: hiển thị voucher.
- `HomeReviewPopupCard.jsx`: popup review tự động.
- `HomeDialogs.jsx`: popup mời đăng nhập và kho voucher.
- `HomeSections.jsx`: các section lớn của trang chủ.

#### `components/admin/bookings`

- `bookingConstants.js`: tab, trạng thái, nhãn và cấu hình hiển thị.
- `bookingHelpers.js`: lọc tab, đếm đơn, nhãn hành động và logic điều kiện.
- `BookingShared.jsx`: badge, icon, style dùng chung.
- `BookingQueueItem.jsx`: một đơn trong hàng đợi.
- `BookingDetail.jsx`: panel chi tiết và thao tác quản lý.

Khi đổi trạng thái booking, phải rà lại nhóm này.

#### `components/admin/rooms`

- `roomConstants.js`: loại phòng, tiện nghi, form rỗng mặc định.
- `roomHelpers.js`: lọc phòng, tính kho, thống kê.
- `RoomField.jsx`: ô form dùng chung.
- `RoomListPane.jsx`: danh sách phòng, bộ lọc, thống kê.
- `RoomCreatePane.jsx`: form tạo phòng mới.

#### `components/admin/customers`

- `CustomerList.jsx`: danh sách khách hàng.
- `CustomerDetailPanel.jsx`: chi tiết khách đang chọn.
- `customerStatus.js`: ánh xạ trạng thái sang nhãn và class màu.

#### `components/admin/dashboard`

- `DashboardCards.jsx`: KPI, action item, progress row, notice item.
- `dashboardHelpers.js`: tính tỷ lệ và tổng phòng theo dõi.

#### `components/admin/revenue`

- `revenueHelpers.js`: mốc ngày và breakdown doanh thu.
- `RevenueCards.jsx`: card thống kê, bộ lọc, trong kỳ/lũy kế, đối soát nhanh.

### 3.6. Services, hooks, store, utils

`services/` chỉ gọi API và trả dữ liệu:

- `ketNoiApi.js`: Axios instance, token interceptor, xử lý lỗi phiên.
- `datPhongApi.js`: API booking, thanh toán, hoàn tiền, hỗ trợ.
- `phongApi.js`: API phòng.
- `xacThucApi.js`: đăng nhập, đăng ký, OTP.
- `quanTriApi.js`: API admin.
- `voucherApi.js`: API voucher.

`hooks/` chứa custom hook dùng lại logic lấy dữ liệu hoặc đồng bộ localStorage.

`store/`:

- `khoXacThuc.js`: user/token.
- `khoThongBao.js`: toast toàn cục.

`utils/`:

- `dinhDang.js`: tiền, ngày, số.
- `lichSuDatPhong.js`: trạng thái booking, helper check-in/check-out.
- `vietQr.js`: cấu hình và tạo dữ liệu VietQR.
- `media.js`: xử lý URL ảnh.
- `phanQuyen.js`: helper quyền.
- `khoaLuuTru.js`: key localStorage (có key điểm thành tích và điểm tiêu dùng).
- `diemThuong.js`: quản lý điểm tiêu dùng, điểm thành tích và logic đổi voucher.

### 3.7. Quy ước frontend

- `pages/` giữ luồng chính của route.
- `components/` giữ UI tái sử dụng hoặc UI theo domain.
- `services/` chỉ gọi API, không chứa JSX.
- `hooks/` giữ logic dữ liệu tái sử dụng.
- `utils/` giữ hàm thuần, không phụ thuộc React.
- Helper thuần đặt ở `*Helpers.js`.
- Dữ liệu tĩnh đặt ở `*Data.js` hoặc `*Options.js`.
- Component lớn nên tách thành `*Parts.jsx`, `*Helpers.js`, `*Constants.js`.
- State dùng chung đặt trong `store`; state chỉ dùng một màn hình giữ tại page/component.

## 4. Hướng dẫn UI khi sửa frontend

DieuBel nên có ngôn ngữ khách sạn Việt Nam: rõ ràng cho khách mới, đủ lịch sự cho lưu trú cao cấp, và gọn cho lễ tân/admin làm việc lặp lại.

### Trang public

Ưu tiên:

- Ảnh phòng/điểm đến lớn và thật.
- Lối vào tìm kiếm rõ.
- Giá, ngày, khách, sức chứa, tiện nghi và chính sách dễ quét nhanh.
- Booking flow bình tĩnh, không trang trí làm rối thanh toán/voucher/xác nhận.
- Vietnamese label tự nhiên, không thay bằng copy tiếng Anh chung chung.

Tránh:

- Gradient tím/xanh kiểu template AI.
- Hàng ba card bằng nhau lặp lại qua nhiều section.
- Card trang trí không giúp đặt phòng.

### Trang admin

Ưu tiên:

- Đọc nhanh.
- Status label nhất quán và dễ phân biệt.
- Bảng/list đậm dữ liệu nhưng không chật.
- Action nguy hiểm có xác nhận.
- Empty/loading/error state rõ ràng.

Tránh:

- Card marketing quá lớn.
- Animation trang trí.
- Chip trạng thái tương phản thấp.
- Đẩy action quan trọng xuống dưới fold.

### Kiểm tra sau khi sửa UI

- Logic API/state hiện tại vẫn hoạt động.
- Mobile không tràn chữ, không vỡ nút, không che nội dung.
- Hover/focus/active/disabled state có tồn tại với control quan trọng.
- Text tiếng Việt đọc tự nhiên.
- Không import dependency mới nếu chưa có trong `package.json`.
- Sau đổi `frontend/`, chạy `npm run build` khi khả thi.

## 5. Quy ước database

File chính:

- `database/final_database.sql`

Nhóm bảng quan trọng:

- Người dùng, OTP, xác thực.
- Phòng, ảnh phòng, dịch vụ, tiện nghi.
- Booking, payment transaction, booking status log.
- Voucher, voucher người dùng.
- Hóa đơn, đánh giá, hỗ trợ, hoàn tiền.
- Audit log admin.

Khi đổi schema:

- Cập nhật `final_database.sql`.
- Cập nhật backend mapper/service liên quan.
- Cập nhật `cauTrucVanHanh.service.js` nếu cần tự đảm bảo cột khi app chạy.
- Cập nhật frontend nếu field mới được hiển thị.

## 6. Nên tách tiếp khi có thời gian

1. ~~Tách `quanLyDatPhong.service.js` theo nhóm~~ — **Đã hoàn thành**: hoàn tiền (`hoanTien.service.js`), hỗ trợ (`hoTro.service.js`), báo cáo (`baoCao.service.js`).
2. ~~Tách route trong `ungDung.js` thành router riêng~~ — **Đã hoàn thành**: `routes/authRoutes.js`, `routes/bookingRoutes.js`, `routes/adminRoutes.js`, `routes/roomRoutes.js`, v.v.
3. Chuẩn hóa mapper chung cho booking.
4. Thêm test cho booking state machine.
5. Chuẩn hóa encoding UTF-8 cho toàn bộ Markdown/source comment nếu còn file cũ bị lỗi hiển thị.
