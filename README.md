# DieuBel - Hệ thống đặt phòng khách sạn

DieuBel là ứng dụng full-stack mô phỏng hệ thống đặt phòng khách sạn, gồm giao diện khách hàng, khu vực admin, API backend, database MySQL, hóa đơn HTML, voucher, thanh toán demo và nhận phòng bằng QR trong mạng LAN.

Tài liệu đã được gom lại để dễ đọc hơn. Repo chỉ giữ 4 file Markdown ở thư mục gốc:

- `README.md`: tổng quan sản phẩm, công nghệ, cách chạy và các điểm demo.
- `CAU_TRUC_CHUONG_TRINH.md`: cấu trúc thư mục, module, file quan trọng và quy ước sửa code.
- `LUONG_DU_LIEU.md`: luồng nghiệp vụ từ frontend đến backend/database, đặt phòng, thanh toán, QR LAN, admin.
- `AGENTS.md`: quy tắc làm việc cho Codex/AI khi sửa dự án.

## 1. Thành phần chính

```text
D:\Website khách sạn final
|- backend/          Express REST API, nghiệp vụ, upload, hóa đơn
|- frontend/         React + Vite + Tailwind CSS SPA cho khách và admin
|- database/         SQL final và các script lịch sử
|- backend/storage/  Upload và hóa đơn HTML sinh khi chạy app
|- README.md
|- CAU_TRUC_CHUONG_TRINH.md
|- LUONG_DU_LIEU.md
`- AGENTS.md
```

Nhóm source cần quan tâm khi phát triển:

- `backend/src`: API, middleware, module nghiệp vụ và cấu hình database.
- `frontend/src`: route, page, component, hook, store, service và CSS global.
- `database/final_database.sql`: schema tổng hợp ưu tiên khi dùng lại database demo.

Nhóm artifact không nên xem là source chính:

- `node_modules/`
- `frontend/dist/`
- `backend/uploads/`
- `backend/storage/`
- `.understand-anything/`
- các báo cáo hoặc file sinh từ công cụ phân tích.

## 2. Công nghệ

Frontend:

- React 19
- Vite
- React Router DOM
- TanStack React Query
- Zustand
- Axios
- Tailwind CSS 3.4

Backend:

- Node.js
- Express
- mysql2/promise
- JWT
- bcryptjs
- multer
- nodemailer

Database và demo:

- MySQL
- VietQR demo/manual confirmation
- QR token công khai cho nhận phòng qua LAN
- Hóa đơn HTML sinh từ backend

## 3. Chức năng nổi bật

### Khách hàng

- Xem trang chủ, phòng nổi bật, ưu đãi và thông tin khách sạn.
- Tìm phòng, lọc phòng, xem chi tiết phòng, ảnh, giá, sức chứa, tiện nghi và đánh giá.
- Đăng ký, đăng nhập, OTP email, lưu phiên bằng JWT.
- Đặt phòng theo ngày nhận/trả, số khách, số phòng, dịch vụ kèm theo và voucher.
- Xem tổng tiền, tiền cọc, giảm giá, số tiền còn lại và mã đặt phòng.
- Thanh toán demo bằng giao diện VietQR.
- Theo dõi tiến trình đặt phòng 5 bước: giữ chỗ, thanh toán, xác nhận, nhận phòng, trả phòng.
- Mở QR nhận phòng, xem hóa đơn, gửi hỗ trợ, trả phòng và đánh giá khi đủ điều kiện.
- Yêu thích/lưu phòng để dễ dàng xem lại (danh sách được lưu vào database và đồng bộ giữa các thiết bị).

### QR nhận phòng qua LAN

- Mỗi booking có QR token riêng.
- QR có thể được quét bằng điện thoại hoặc thiết bị khác trong cùng mạng LAN.
- Nếu quét trước ngày nhận phòng, backend trả trạng thái `early` và không đổi booking sang `checked_in`.
- Từ 00:00 ngày check-in, scanner nền tự mở trạng thái `checked_in` cho đơn đã thanh toán.
- Lễ tân/thiết bị LAN quét QR đúng ngày để ghi `frontdesk_verified_at`.
- Khách chỉ được tự check-out sau khi đã có xác minh LAN.
- Scanner nền tự check-out khi hết ngày trả phòng nếu khách quên thao tác.

### Admin

- Dashboard tổng quan vận hành.
- Quản lý đặt phòng theo hàng đợi và panel chi tiết.
- Tab nghiệp vụ: Tất cả, Hôm nay/Lưu trú, Chờ thanh toán, Cần xử lý, Chờ ngày nhận phòng, Lịch sử.
- Xem khách, phòng, ngày nhận/trả, trạng thái thanh toán, số tiền, ghi chú và lịch sử trạng thái.
- Xác minh nhận phòng, cập nhật trạng thái hợp lệ.
- Xử lý hoàn tiền, duyệt đơn hủy phòng và trả lời khiếu nại/hỗ trợ của khách hàng.
- Quản lý phòng, khách hàng, hóa đơn, doanh thu, voucher/marketing và vận hành.

### Hệ thống

- Backend có endpoint health check.
- Vite proxy từ frontend `/api` sang backend.
- CORS cấu hình cho frontend.
- Scanner nền đồng bộ trạng thái booking theo chu kỳ.
- `.env.example` cho backend và frontend.
- `.gitignore` bỏ qua thư viện, build, upload, storage, hóa đơn sinh tự động và artifact phân tích.

## 4. Cách chạy dự án

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend mặc định:

- `PORT=5000`
- `HOST=0.0.0.0`
- API health check: `http://127.0.0.1:5000/api/health`

Kiểm tra nhanh:

```bash
curl http://127.0.0.1:5000/api/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Build frontend:

```bash
cd frontend
npm run build
```

## 5. Cấu hình môi trường

Backend:

- Mẫu cấu hình: `backend/.env.example`
- Cần cấu hình database, JWT secret, SMTP nếu muốn gửi email thật.
- `DEFAULT_ADMIN_ENABLED=true` chỉ nên dùng cho demo/dev; production nên đặt admin riêng và không bật `DEFAULT_ADMIN_FORCE_RESET` nếu không muốn reset mật khẩu.
- `AUTO_MIGRATE=true` cho phép app tự đảm bảo cấu trúc bổ sung khi chạy demo; production có thể chạy SQL/migration trước rồi đặt `AUTO_MIGRATE=false`.

Frontend:

- Mẫu cấu hình: `frontend/.env.example`
- Dùng `VITE_BACKEND_ORIGIN` nếu frontend và backend khác origin; nếu đi qua cùng reverse proxy thì media upload có thể dùng URL tương đối.

Lưu ý:

- Không commit `.env`.
- Không commit mật khẩu database, JWT secret, SMTP password hoặc token riêng.
- Nếu thiếu SMTP, backend nên tiếp tục chạy và chỉ bỏ qua gửi email.
- QR nhận phòng được render trong frontend, không gửi token check-in sang dịch vụ QR bên thứ ba.

## 6. Database

File ưu tiên khi dùng lại database demo:

```text
database/final_database.sql
```

File này gồm:

- Tạo database và bảng.
- Dữ liệu phòng mẫu.
- Dịch vụ, voucher và ảnh phòng mẫu.
- Các cột phục vụ check-in/check-out và xác minh lễ tân qua LAN.

Cách dùng:

1. Mở MySQL Workbench hoặc công cụ MySQL tương đương.
2. Chạy `database/final_database.sql`.
3. Kiểm tra `backend/.env` trỏ đúng `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
4. Khởi động backend và gọi `/api/health`.

Các file SQL đánh số trong `database/` là lịch sử phát triển/migration cũ. Với bản final/demo, ưu tiên `final_database.sql` để tránh lệch schema.

## 7. Reset dữ liệu test khách hàng

Khi cần làm mới dữ liệu để test lại từ đầu luồng khách hàng, chạy script reset ở backend:

```bash
cd backend
npm run reset:test-data
```

Script này chỉ xóa dữ liệu tại thời điểm chạy lệnh. Nó không chạy nền và không tự động xóa dữ liệu mới phát sinh sau đó. Nếu muốn xem trước số dòng sẽ bị xóa mà chưa thay đổi database, dùng:

```bash
cd backend
npm run reset:test-data:dry-run
```

Dữ liệu bị xóa gồm tài khoản khách hàng, đặt phòng, hóa đơn trong database, OTP email, thanh toán, voucher đã lưu/đã dùng của khách, phòng yêu thích, đánh giá, yêu cầu hoàn tiền, hỗ trợ/phản hồi và log trạng thái booking.

Script giữ lại tài khoản admin, danh sách phòng, dịch vụ và voucher gốc. Tồn kho phòng mẫu và số lượt dùng voucher sẽ được đưa về trạng thái sạch để tiếp tục test.

## 8. Điểm mạnh khi trình bày demo

- Luồng đặt phòng có đủ vòng đời từ tìm phòng, đặt phòng, thanh toán, nhận phòng, trả phòng.
- QR LAN tạo được tình huống thực tế: khách mở QR, lễ tân dùng thiết bị khác quét trong cùng mạng.
- Check-in hai lớp giải thích rõ khác biệt giữa "hệ thống mở ngày nhận phòng" và "lễ tân đã xác minh".
- Admin có màn hình riêng, chứng minh hệ thống không chỉ là giao diện khách hàng.
- Hóa đơn, doanh thu, voucher, hỗ trợ và đánh giá giúp demo có chiều sâu nghiệp vụ.

## 9. Giới hạn hiện tại

- Thanh toán là demo, chưa kết nối cổng thanh toán thật.
- Email phụ thuộc SMTP.
- Scanner nền là cơ chế demo, chưa phải cron/queue production.
- Tồn kho phòng phù hợp demo; nếu dùng thật cần mở rộng theo từng phòng vật lý và lịch trùng ngày.
- Chưa có bộ test tự động đầy đủ cho booking state machine.
