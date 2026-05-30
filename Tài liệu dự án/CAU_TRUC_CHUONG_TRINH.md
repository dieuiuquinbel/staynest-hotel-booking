# Cấu trúc chương trình DieuBel

Tài liệu này mô tả cấu trúc source hiện tại của website đặt phòng khách sạn DieuBel. Nội dung được viết lại để loại bỏ mô tả cũ bị lệch cấu trúc, gom các file theo đúng vai trò và đưa ra quy ước sắp xếp code khi phát triển tiếp.

## 1. Cấu trúc cấp repo

```text
D:\Website khách sạn final
├─ backend/                 Backend Express, nghiệp vụ, API, upload, hóa đơn
├─ frontend/                Frontend React/Vite cho khách hàng và admin
├─ database/                SQL final và các script lịch sử
├─ Tài liệu dự án/           Tài liệu kiến trúc, tính năng, luồng vận hành
├─ Hóa đơn admin/            Hóa đơn HTML sinh ra khi chạy app
├─ duplicate-scan-report/    Báo cáo phân tích cục bộ, không phải source chính
└─ README.md                Tổng quan ngắn của repo
```

Nhóm source chính cần quan tâm khi sửa chương trình:

- `backend/src`: toàn bộ API và nghiệp vụ server.
- `frontend/src`: toàn bộ giao diện, route, component, hook, service và store.
- `database/final_database.sql`: schema tổng hợp đang dùng để khởi tạo database.
- `Tài liệu dự án`: nơi ghi lại quyết định kỹ thuật và luồng demo.

Nhóm file sinh tự động hoặc không nên xem là source chính:

- `node_modules/`
- `frontend/dist/`
- `backend/uploads/`
- `backend/storage/`
- `Hóa đơn admin/`
- `.understand-anything/`
- `_docx_review_*/`

## 2. Backend

### 2.1. Cấu trúc tổng thể

```text
backend/
├─ package.json
├─ package-lock.json
├─ .env.example
└─ src/
   ├─ mayChu.js
   ├─ ungDung.js
   ├─ config/
   │  └─ coSoDuLieu.js
   ├─ middleware/
   │  └─ xacThuc.middleware.js
   └─ modules/
      ├─ admin/
      │  └─ quanTri.service.js
      ├─ auth/
      │  └─ xacThuc.service.js
      ├─ bookings/
      │  ├─ datPhong.service.js
      │  └─ quanLyDatPhong.service.js
      ├─ invoices/
      │  └─ hoaDon.service.js
      ├─ notifications/
      │  └─ thuDienTu.service.js
      ├─ rooms/
      │  ├─ phong.service.js
      │  └─ danhGia.service.js
      ├─ system/
      │  └─ cauTrucVanHanh.service.js
      └─ vouchers/
         └─ voucher.service.js
```

### 2.2. File khởi động và route

- `backend/src/mayChu.js`  
  Nạp biến môi trường, chuẩn bị tài khoản admin mặc định, mở HTTP server và khởi động scanner nền cho trạng thái booking. Server mặc định chạy tại `PORT=5000`, `HOST=0.0.0.0` để các thiết bị cùng mạng LAN có thể gọi API.

- `backend/src/ungDung.js`  
  Tạo Express app, cấu hình CORS, JSON parser, upload static, invoice static và toàn bộ route API. File này chỉ nên giữ vai trò lắp route; nghiệp vụ chi tiết phải đặt trong service module.

- `backend/src/config/coSoDuLieu.js`  
  Tạo MySQL connection pool bằng `mysql2/promise`. Mọi service backend dùng pool này để query hoặc mở transaction.

- `backend/src/middleware/xacThuc.middleware.js`  
  Đọc JWT, gán `req.user`, chặn route yêu cầu đăng nhập hoặc quyền admin.

### 2.3. Module nghiệp vụ backend

- `auth/xacThuc.service.js`  
  Đăng ký, đăng nhập, OTP email, JWT, tài khoản admin mặc định và hồ sơ người dùng. Module này chịu trách nhiệm bảo mật phiên đăng nhập.

- `bookings/datPhong.service.js`  
  Tạo đơn đặt phòng, kiểm tra ngày nhận/trả, kiểm tra tồn kho phòng, áp voucher, tạo mã booking, tạo log ban đầu và trả dữ liệu hóa đơn theo booking. Phần tạo booking phải dùng transaction và khóa dòng phòng để tránh đặt vượt số lượng phòng còn lại.

- `bookings/quanLyDatPhong.service.js`  
  Trung tâm nghiệp vụ sau khi đã có booking: danh sách đơn của khách, danh sách đơn admin, xác nhận thanh toán, cập nhật trạng thái, hoàn tiền, hỗ trợ, báo cáo doanh thu, QR check-in công khai và scanner nền check-in/check-out. Đây là module quan trọng nhất của luồng vận hành.

- `rooms/phong.service.js`  
  Danh sách phòng, chi tiết phòng, phòng nổi bật, tạo/sửa dữ liệu phòng admin và xử lý upload ảnh phòng.

- `rooms/danhGia.service.js`  
  Tạo và lấy đánh giá phòng từ booking đã đủ điều kiện.

- `vouchers/voucher.service.js`  
  Voucher công khai, voucher người dùng đang sở hữu, lưu voucher và dữ liệu voucher dùng trong booking.

- `invoices/hoaDon.service.js`  
  Sinh và đọc hóa đơn HTML. Hóa đơn là file sinh ra khi chạy chương trình, không phải source code chính.

- `notifications/thuDienTu.service.js`  
  Gửi email OTP, xác nhận, thông báo booking và các email nghiệp vụ khác. Nếu thiếu SMTP, backend vẫn nên chạy được và chỉ bỏ qua gửi mail.

- `admin/quanTri.service.js`  
  Dashboard, khách hàng, doanh thu, audit log và các API tổng hợp cho admin.

- `system/cauTrucVanHanh.service.js`  
  Đảm bảo cấu trúc vận hành bổ sung khi code cần cột mới trong database. Hiện đang đảm bảo các cột như `frontdesk_verified_at` và `frontdesk_verified_note` cho luồng xác minh nhận phòng LAN.

### 2.4. Quy ước backend

- Route ở `ungDung.js`, nghiệp vụ ở `modules/*/*.service.js`.
- Query có nhiều bước cập nhật trạng thái phải dùng transaction.
- Trạng thái booking quan trọng phải ghi `booking_status_logs`.
- API admin không được tin dữ liệu frontend; backend phải kiểm tra trạng thái hiện tại trước khi cập nhật.
- File sinh ra như hóa đơn, ảnh upload, log chạy thử không đặt chung vào source module.

## 3. Frontend

### 3.1. Cấu trúc tổng thể

```text
frontend/
├─ package.json
├─ vite.config.js
├─ .env.example
└─ src/
   ├─ main.jsx
   ├─ index.css
   ├─ app/
   │  └─ UngDung.jsx
   ├─ components/
   │  ├─ admin/
   │  ├─ auth/
   │  ├─ bookings/
   │  ├─ chatbot/
   │  ├─ layout/
   │  ├─ public/
   │  ├─ rooms/
   │  └─ search/
   ├─ hooks/
   ├─ pages/
   │  ├─ account/
   │  ├─ admin/
   │  ├─ auth/
   │  ├─ bookings/
   │  ├─ public/
   │  └─ rooms/
   ├─ services/
   ├─ store/
   └─ utils/
```

### 3.2. App, route và layout

- `frontend/src/main.jsx`  
  Mount React app vào DOM, import CSS global.

- `frontend/src/app/UngDung.jsx`  
  Khai báo router, React Query provider, layout chung, route bảo vệ, chatbot và thông báo toàn cục.

- `frontend/src/components/layout`  
  Header, footer, bảng mời thành viên và toast toàn cục. Đây là nhóm UI xuất hiện xuyên suốt app.

- `frontend/src/components/auth/TuyenDuongBaoVe.jsx`  
  Chặn route yêu cầu đăng nhập hoặc quyền admin.

### 3.3. Trang khách hàng

- `pages/public/TrangChu.jsx`  
  Trang chủ, phòng nổi bật, voucher, popup đánh giá và các section giới thiệu.

- `pages/rooms/DanhSachPhong.jsx`  
  Danh sách phòng, lọc, tìm kiếm, phân loại phòng.

- `pages/rooms/ChiTietPhong.jsx`  
  Chi tiết phòng, ảnh, tiện nghi, giá, đánh giá và CTA đặt phòng.

- `pages/bookings/DatPhong.jsx`  
  Form tạo booking, chọn ngày, số khách, số phòng, dịch vụ, voucher và bước thanh toán.

- `pages/bookings/DatPhongCuaToi.jsx`  
  Trang quản lý đặt phòng của khách. Hiển thị tiến trình 5 bước, QR nhận phòng, popup hiệu lực mã, thanh toán, hỗ trợ, hóa đơn, check-out và trạng thái đơn.

- `pages/bookings/QuetCheckIn.jsx`  
  Trang công khai cho điện thoại LAN quét QR. Nếu quét trước ngày nhận phòng thì chỉ xác minh mã hợp lệ nhưng không đổi trạng thái. Nếu đã đến ngày nhận phòng thì hoàn tất xác minh lễ tân.

- `pages/account/TaiKhoan.jsx`, `pages/account/LichSu.jsx`  
  Hồ sơ, điểm thưởng, lịch sử, gợi ý đánh giá và dữ liệu cá nhân.

### 3.4. Trang admin

- `pages/admin/QuanLyDatPhong.jsx`  
  Màn hình vận hành đặt phòng. Dùng các tab như tất cả đơn, hôm nay/lưu trú, chờ thanh toán, cần xử lý, chờ ngày nhận phòng và lịch sử.

- `components/admin/bookings`  
  Nhóm component booking admin:
  - `BookingQueueItem.jsx`: item trong hàng đợi.
  - `BookingDetail.jsx`: panel chi tiết và nút thao tác.
  - `BookingShared.jsx`: badge, icon, style dùng chung.
  - `bookingConstants.js`: tab, trạng thái, cấu hình hiển thị.
  - `bookingHelpers.js`: lọc tab, nhãn hành động, logic điều kiện hiển thị.

- `pages/admin/AdminRooms.jsx` và `components/admin/rooms`  
  Quản lý phòng, form tạo/sửa phòng, helper phòng.

- `pages/admin/AdminCustomers.jsx` và `components/admin/customers`  
  Quản lý khách hàng, chi tiết khách, tạo khách và trạng thái tài khoản.

- `pages/admin/AdminDashboard.jsx`, `AdminRevenue.jsx`, `AdminInvoices.jsx`, `AdminMarketing.jsx`, `AdminOperations.jsx`  
  Dashboard, doanh thu, hóa đơn, marketing và vận hành/audit.

### 3.5. Services, hooks, store, utils

- `services/`  
  Chỉ gọi API và trả dữ liệu. Không đặt layout, JSX hoặc logic UI nặng trong service.

- `hooks/`  
  Chứa custom hook dùng lại nhiều nơi, ví dụ lấy booking của tôi, voucher của tôi, lịch sử tìm kiếm.

- `store/`  
  Zustand store:
  - `khoXacThuc.js`: user/token.
  - `khoThongBao.js`: toast toàn cục.

- `utils/`  
  Hàm thuần dùng chung:
  - `dinhDang.js`: tiền, ngày, số.
  - `lichSuDatPhong.js`: trạng thái booking, helper check-in/check-out.
  - `vietQr.js`: cấu hình và tạo dữ liệu VietQR.
  - `media.js`: xử lý URL ảnh.
  - `phanQuyen.js`: helper quyền.
  - `khoaLuuTru.js`: key localStorage.

### 3.6. Quy ước frontend

- `pages/` giữ luồng chính của route.
- `components/` giữ UI có thể tái sử dụng hoặc UI theo domain.
- `services/` chỉ gọi API.
- `hooks/` giữ logic dữ liệu tái sử dụng.
- `utils/` giữ hàm thuần, không phụ thuộc React.
- Component lớn nên tách thành `*Parts.jsx`, `*Helpers.js`, `*Constants.js` nếu vượt quá một màn hình logic.
- Trạng thái dùng chung đặt trong `store/`; trạng thái chỉ dùng trong một màn hình giữ tại page/component.

## 4. Database

```text
database/
├─ final_database.sql
├─ README.md
├─ 01_init_schema.sql
├─ 02_seed_sample_data.sql
├─ 03_add_auth_booking_invoice.sql
├─ 03_seed_more_rooms.sql
├─ 05_clean_demo_data.sql
└─ 06_expand_hotel_booking_system.sql
```

- `final_database.sql` là file ưu tiên khi dựng lại database demo.
- Các file `01` đến `06` là lịch sử phát triển/migration cũ, giữ để tham khảo.
- Khi thay đổi schema chính thức, cần cập nhật `final_database.sql`, `database/README.md` và service đảm bảo cấu trúc nếu cần.

Nhóm bảng quan trọng:

- Người dùng, OTP, xác thực.
- Phòng, ảnh phòng, dịch vụ, tiện nghi.
- Booking, payment transaction, booking status log.
- Voucher, voucher người dùng.
- Hóa đơn, đánh giá, hỗ trợ, hoàn tiền.
- Audit log admin.

## 5. Luồng check-in/check-out hiện tại

```text
Thanh toán thành công
   ↓
Booking tương lai vẫn là confirmed
   ↓
Admin thấy trong "Tất cả" và "Chờ ngày nhận phòng"
   ↓
Từ 00:00 ngày check-in, scanner nền chuyển sang checked_in
   ↓
UI khách hiển thị bước 4 mở một phần
   ↓
Lễ tân/điện thoại LAN quét QR để ghi frontdesk_verified_at
   ↓
Bước 4 thành công hoàn toàn, khách có thể check-out
   ↓
Khách tự check-out hoặc scanner nền tự check-out khi hết ngày trả phòng
```

Điểm cần giữ:

- Quét QR trước ngày check-in không được chuyển trạng thái sang `checked_in`.
- `checked_in` nhưng chưa có `frontdesk_verified_at` chỉ là hệ thống tự mở nhận phòng, chưa phải lễ tân xác minh xong.
- Nút check-out phía khách chỉ mở sau khi đã có xác minh LAN.
- Auto check-out vẫn chạy để hoàn tất đơn khi khách quên thao tác.

## 6. Hướng tối ưu cấu trúc tiếp theo

Các cải tiến nên làm theo thứ tự an toàn:

1. Tách dần `quanLyDatPhong.service.js` thành các file con theo nhóm: trạng thái booking, thanh toán, hoàn tiền, hỗ trợ, báo cáo.
2. Tách route trong `ungDung.js` thành router riêng: `auth.routes.js`, `bookings.routes.js`, `admin.routes.js`, `rooms.routes.js`.
3. Chuẩn hóa tên field trả về API bằng một lớp mapper chung cho booking.
4. Tăng test cho booking state machine vì đây là phần dễ phát sinh lỗi logic nhất.
5. Chuẩn hóa encoding UTF-8 cho toàn bộ Markdown và source comment để tránh lỗi hiển thị tiếng Việt.

Chưa nên move hàng loạt file frontend/backend trong một lần nếu không có test bao phủ, vì nhiều import tương đối đang hoạt động ổn.
