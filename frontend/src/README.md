# Cấu trúc `frontend/src`

Thư mục này chứa toàn bộ source React của frontend DieuBel.

## Nhóm chính

### `app/`

- `UngDung.jsx`  
  Khai báo router, React Query provider, layout chung, route bảo vệ, chatbot và thông báo toàn cục.

### `pages/`

- `public/`  
  Trang công khai như trang chủ.

- `rooms/`  
  Danh sách phòng và chi tiết phòng.

- `bookings/`  
  Tạo booking, xem booking của tôi và trang quét QR check-in.

- `account/`  
  Tài khoản, lịch sử và dữ liệu cá nhân.

- `auth/`  
  Đăng nhập, đăng ký và OTP.

- `admin/`  
  Dashboard, quản lý đặt phòng, phòng, khách hàng, hóa đơn, doanh thu, marketing và vận hành.

### `components/`

- `admin/`  
  Component cho khu vực quản trị.

- `auth/`  
  Component bảo vệ route.

- `bookings/`  
  Component phục vụ luồng đặt phòng phía khách.

- `chatbot/`  
  Chatbot hỗ trợ đặt phòng và logic gợi ý.

- `layout/`  
  Header, footer, bảng mời thành viên và toast toàn cục.

- `public/home/`  
  Section trang chủ, dữ liệu tĩnh, voucher và popup.

- `rooms/`  
  Card phòng, skeleton, bộ lọc đang dùng.

- `search/`  
  Thanh tìm kiếm và cấu hình bộ lọc.

### `services/`

Các file gọi API backend bằng Axios. Quy ước: service chỉ gửi/nhận dữ liệu, không chứa layout hoặc JSX.

### `hooks/`

Custom hook tái sử dụng logic lấy dữ liệu hoặc đồng bộ localStorage.

### `store/`

- `khoXacThuc.js`: user/token.
- `khoThongBao.js`: toast toàn cục.

### `utils/`

Hàm tiện ích thuần: định dạng tiền/ngày, phân quyền, localStorage, media URL, VietQR, trạng thái phòng và trạng thái booking.

## Quy ước sắp xếp

- Page giữ luồng chính của màn hình.
- Component giữ UI có thể tái sử dụng hoặc UI theo domain.
- Helper thuần đặt ở `*Helpers.js`.
- Dữ liệu tĩnh đặt ở `*Data.js` hoặc `*Options.js`.
- API đặt ở `services/`.
- State dùng chung đặt ở `store/`.
- Logic không phụ thuộc React đặt ở `utils/`.

## Các điểm cần chú ý

- `DatPhongCuaToi.jsx` là màn hình lớn, đã có component phụ trong `components/bookings/my-bookings`.
- `QuetCheckIn.jsx` là trang công khai phục vụ QR LAN, phải giữ logic không cho check-in sớm trước ngày nhận phòng.
- `components/admin/bookings` là nhóm quan trọng của admin booking; khi đổi trạng thái booking phải rà lại helper và constants trong nhóm này.
