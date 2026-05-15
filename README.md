# DieuBel Hotel Booking

Ứng dụng đặt phòng khách sạn dùng React, Express và MySQL.

## 1. Cấu trúc

```text
frontend/   Giao diện khách hàng và admin
backend/    API, xác thực, đặt phòng, thanh toán, hóa đơn
database/   Schema, seed dữ liệu, migration
```

Chỉ giữ 3 file tài liệu:

- `README.md`: cách chạy và ghi chú tổng quan.
- `HUONG_DAN_HAM.md`: API và hàm chính.
- `LUONG_DU_LIEU.md`: luồng nghiệp vụ và database.

## 2. Công nghệ

- Frontend: React 19, Vite, React Router, Axios, Zustand, TanStack Query, Tailwind CSS.
- Backend: Node.js, Express, MySQL2, JWT, bcryptjs, Nodemailer.
- Database: MySQL.

## 3. Chạy dự án

Tạo database:

```sql
CREATE DATABASE hotel_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import SQL theo thứ tự trong `database/`:

```text
01_init_schema.sql
02_seed_sample_data.sql
03_add_auth_booking_invoice.sql
03_seed_more_rooms.sql
05_clean_demo_data.sql
06_expand_hotel_booking_system.sql
```

Backend `.env` tối thiểu:

```env
PORT=5000
FRONTEND_URL=http://localhost:5714
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=hotel_booking_db
DB_USER=root
DB_PASSWORD=123456
JWT_SECRET=staynest_jwt_dev_secret_2026
JWT_EXPIRES_IN=7d
INVOICE_DIR=storage/invoices
```

Chạy:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

Địa chỉ:

- Frontend: `http://localhost:5714`
- Backend: `http://localhost:5000`
- Health check: `GET /api/health`

## 4. Ghi chú quan trọng

- Tài khoản admin mặc định luôn là `admin` / `admin123`.
- Backend tự tạo/cập nhật tài khoản admin khi khởi động và hạ các admin khác xuống customer để hệ thống chỉ có một admin.
- Admin đăng nhập xong luôn vào `/admin/overview`.
- Admin không dùng giao diện khách; nếu vào `/`, `/rooms`, `/history` sẽ bị chuyển về dashboard.
- Đặt phòng thành công sẽ trừ `rooms.inventory_count`.
- Hủy đơn đã thanh toán đi qua yêu cầu hoàn tiền, admin duyệt mới trả phòng về kho.
- Xóa khách hàng:
  - Chưa có booking: xóa thật khỏi MySQL.
  - Đã có booking: khóa tài khoản để giữ lịch sử đối soát.

## 5. Lỗi hay gặp

- Thiếu bảng `refund_requests` hoặc `support_tickets`: import `06_expand_hotel_booking_system.sql` hoặc restart backend để service tự bổ sung bảng vận hành.
- Frontend còn giao diện cũ: restart Vite hoặc hard refresh trình duyệt.
- Số phòng không giảm: kiểm tra backend đang chạy code mới và cột `rooms.inventory_count` trong MySQL.
