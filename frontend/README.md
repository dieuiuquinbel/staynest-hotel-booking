# StayNest Frontend

Frontend của StayNest sử dụng React, Vite và Tailwind CSS.

## Lệnh thường dùng

```powershell
npm install
npm run dev
npm run build
```

## Màn hình chính

- `/`: Trang chủ
- `/rooms`: Tìm chỗ ở
- `/rooms/:roomId`: Chi tiết khách sạn
- `/auth`: Đăng nhập / đăng ký
- `/booking`: Giữ chỗ, yêu cầu đăng nhập
- `/my-bookings`: Đặt chỗ của tôi, yêu cầu đăng nhập
- `/history`: Lịch sử xem và yêu thích

## Dữ liệu lưu trên trình duyệt

Một số phần demo được lưu bằng `localStorage`:

- Lịch sử tìm kiếm
- Khách sạn đã xem
- Khách sạn yêu thích
- Đặt chỗ mẫu
