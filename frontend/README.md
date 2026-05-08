# DieuBel Frontend

Giao diện đặt phòng khách sạn dùng React, Vite và Tailwind CSS.

## Lệnh chính

```bash
npm install
npm run dev
npm run build
```

## Màn hình chính

- `/`: `TrangChu`
- `/rooms`: `DanhSachPhong`
- `/rooms/:roomId`: `ChiTietPhong`
- `/auth`: `DangNhapDangKy`
- `/booking`: `DatPhong`
- `/my-bookings`: `DatPhongCuaToi`
- `/me`: `TaiKhoan`
- `/admin/bookings`: `QuanLyDatPhong`
- `/history`: `LichSu`

## Quy ước đặt tên

File, component và các hàm export trong `src` dùng tiếng Việt không dấu để dễ tìm logic:

```text
components/rooms/ThePhong.jsx
components/search/ThanhTimKiem.jsx
services/xacThucApi.js
services/phongApi.js
utils/lichSuDatPhong.js
utils/diemThuong.js
store/khoXacThuc.js
```

## Dữ liệu lưu trên trình duyệt

Một số dữ liệu demo được lưu bằng `localStorage`: lịch sử tìm kiếm, phòng đã xem, phòng yêu thích, đặt phòng mẫu, điểm thưởng và voucher.
