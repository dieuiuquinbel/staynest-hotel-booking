# DieuBel Hotel Booking

Website đặt phòng khách sạn demo gồm frontend React, backend Express và database MySQL.

## Công nghệ

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MySQL
- Xác thực: JWT, OTP email qua SMTP
- Thanh toán demo: VietQR

## Cấu trúc chính

```text
backend/   API, xác thực, đặt phòng, hóa đơn, thanh toán demo
frontend/  Giao diện người dùng React
database/  Schema và dữ liệu mẫu MySQL
```

Tên file và module chính đã được đổi sang tiếng Việt không dấu để dễ tìm logic.

Frontend:

```text
pages/TrangChu.jsx
pages/DanhSachPhong.jsx
pages/ChiTietPhong.jsx
pages/DatPhong.jsx
pages/DatPhongCuaToi.jsx
pages/QuanLyDatPhong.jsx
components/rooms/ThePhong.jsx
utils/lichSuDatPhong.js
services/phongApi.js
```

Backend:

```text
src/mayChu.js
src/ungDung.js
src/config/coSoDuLieu.js
src/middleware/xacThuc.middleware.js
src/services/xacThuc.service.js
src/services/phong.service.js
src/services/datPhong.service.js
src/services/thanhToan.service.js
```

## Cài đặt

Tạo database:

```sql
CREATE DATABASE hotel_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import các file SQL trong `database/` theo thứ tự số đầu file.

Cài dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Biến môi trường

Backend cần file `backend/.env`:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=hotel_booking_db
DB_USER=root
DB_PASSWORD=123456
JWT_SECRET=staynest_jwt_dev_secret_2026
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
INVOICE_DIR=storage/invoices
PAYMENT_HISTORY_DIR=storage/lich-su-ck
```

Frontend cần file `frontend/.env` nếu dùng VietQR:

```env
VITE_VIETQR_BANK_ID=970407
VITE_VIETQR_ACCOUNT_NO=722710020058888
VITE_VIETQR_ACCOUNT_NAME=NGUYEN XUAN DIEU
VITE_VIETQR_TEMPLATE=compact2
```

## Chạy project

Terminal backend:

```bash
cd backend
npm run dev
```

Terminal frontend:

```bash
cd frontend
npm run dev
```

Địa chỉ:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

## Route chính

- `/`: trang chủ
- `/rooms`: danh sách và tìm kiếm phòng
- `/rooms/:roomId`: chi tiết phòng
- `/auth`: đăng nhập, đăng ký, xác minh OTP
- `/booking`: đặt phòng
- `/my-bookings`: đặt phòng của tôi, thanh toán demo, QR nhận phòng
- `/me`: tài khoản, điểm thưởng, voucher
- `/admin/bookings`: quản lý đặt phòng
- `/history`: lịch sử xem, yêu thích, đánh giá

## Kiểm tra

```bash
cd frontend
npm run build

cd ../backend
node --check src/mayChu.js
node -e "require('./src/ungDung'); console.log('backend module load ok')"
```
