# DieuBel Hotel Booking

Website đặt phòng khách sạn gồm frontend React, backend Express và database MySQL.

## 1. Cấu trúc dự án

```text
frontend/   Giao diện người dùng và trang quản trị
backend/    API, xác thực, đặt phòng, thanh toán demo, hóa đơn
database/   File tạo bảng, seed dữ liệu và mở rộng schema
```

## 2. Công nghệ sử dụng

Frontend:

- React 19
- Vite
- React Router
- Axios
- Zustand
- TanStack Query
- Tailwind CSS

Backend:

- Node.js
- Express
- MySQL2
- JWT
- bcryptjs
- Nodemailer
- dotenv

Database:

- MySQL
- Các bảng chính: `users`, `rooms`, `bookings`, `invoices`, `vouchers`, `payment_transactions`, `booking_status_logs`, `customer_feedbacks`

Chức năng phụ:

- OTP email qua SMTP Gmail
- Hóa đơn HTML lưu trong `backend/storage/invoices`
- Lịch sử chuyển khoản demo lưu trong `backend/storage/lich-su-ck`
- VietQR tạo từ biến môi trường frontend

## 3. Cài đặt database

Tạo database:

```sql
CREATE DATABASE hotel_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import các file trong `database/` theo thứ tự tên file:

```text
01_init_schema.sql
02_seed_sample_data.sql
03_add_auth_booking_invoice.sql
03_seed_more_rooms.sql
05_clean_demo_data.sql
06_expand_hotel_booking_system.sql
```

## 4. Cấu hình backend

Tạo file `backend/.env`:

Nếu chưa cấu hình SMTP, backend vẫn trả `devOtp` khi đăng ký để test local.

## 5. Cấu hình frontend

Tạo file `frontend/.env` nếu muốn bật VietQR:

## 6. Chạy dự án

Cài dependencies:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

Chạy backend:

```bash
cd backend
npm run dev
```

Chạy frontend:

```bash
cd frontend
npm run dev
```

Địa chỉ mặc định:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `GET http://localhost:5000/api/health`

## 7. Ba tài liệu cần đọc

- `README.md`: công nghệ, cấu trúc và cách chạy dự án.
- `HUONG_DAN_HAM.md`: danh sách API, service và hàm quan trọng.
- `LUONG_DU_LIEU.md`: luồng phân tích và xử lý dữ liệu.
