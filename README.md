# DieuBel Hotel Booking

DieuBel là website đặt phòng khách sạn demo gồm frontend React, backend Express và database MySQL.

## Khởi chạy backend bằng terminal trong VS Code

- cd "D:\Website khách sạn final\backend"
- npm install
- npm run dev

## Chức năng chính

- Trang chủ với hero tìm kiếm, điểm đến nổi bật, ưu đãi và khách sạn được yêu thích.
- Trang tìm chỗ ở với search nâng cao và bộ lọc cố định bên trái.
- Trang chi tiết khách sạn, tiện nghi, trạng thái còn phòng và nút yêu thích.
- Đăng ký, đăng nhập, kiểm tra phiên người dùng bằng JWT.
- Luồng đặt phòng yêu cầu đăng nhập.
- Trang Đặt chỗ của tôi với trạng thái đang giữ chỗ, đã hoàn tất, đã hủy.
- Trang Lịch sử lưu khách sạn đã xem và đã yêu thích trên trình duyệt.

## Cấu trúc thư mục

```text
backend/   API Express, auth, rooms service
database/  SQL schema và dữ liệu mẫu
frontend/  React + Vite + Tailwind
```

## Yêu cầu môi trường

- Node.js 18 trở lên
- MySQL 8
- npm

## Cài đặt database

Tạo database MySQL:

```sql
CREATE DATABASE hotel_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import lần lượt:

```text
database/01_init_schema.sql
database/02_seed_sample_data.sql
```

## Chạy backend

```powershell
cd backend
npm install
copy .env.example .env
npm run dev
```

Kiểm tra file `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3307
DB_NAME=hotel_booking_db
DB_USER=root
DB_PASSWORD=123456
JWT_SECRET=staynest_jwt_dev_secret_2026
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Test API:

```text
http://localhost:5000/api/health
```

## Chạy frontend

```powershell
cd frontend
npm install
npm run dev
```

Mở:

```text
http://127.0.0.1:5173
```

Frontend đang gọi API qua `/api`. Khi chạy dev, cần backend hoạt động ở cổng `5000` và cấu hình proxy trong Vite nếu cần triển khai đầy đủ.

## Build kiểm tra

```powershell
cd frontend
npm run build
```

## Ghi chú triển khai

Khi deploy production:

- Backend cần biến `FRONTEND_URL` trỏ tới domain frontend thật.
- Database nên dùng MySQL cloud và import đủ 2 file SQL.
- Frontend có thể deploy Vercel/Netlify; backend có thể deploy Render/Railway.
- Nếu frontend và backend ở 2 domain khác nhau, cần cấu hình rewrite hoặc đổi API base URL phù hợp.
