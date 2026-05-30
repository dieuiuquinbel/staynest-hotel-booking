# Mục lục tài liệu dự án DieuBel

Thư mục này gom tài liệu kỹ thuật và tài liệu trình bày cho website đặt phòng khách sạn DieuBel. Mục tiêu là giúp người đọc hiểu nhanh hệ thống đang có gì, file nào chịu trách nhiệm phần nào, và nên sửa ở đâu khi phát triển tiếp.

## Tài liệu chính

- `CAU_TRUC_CHUONG_TRINH.md`  
  Mô tả cấu trúc thư mục, vai trò từng module backend/frontend/database, quy ước đặt file và hướng sắp xếp code.

- `TINH_NANG_NOI_BAT.md`  
  Liệt kê các tính năng nổi bật của chương trình theo nhóm khách hàng, admin, thanh toán, QR LAN, hóa đơn, voucher, đánh giá và vận hành demo.

- `GHI_CHU_DU_AN.md`  
  Ghi lại luồng vận hành chính: khởi động app, đăng nhập, đặt phòng, thanh toán, check-in/check-out, quản trị, hóa đơn, voucher và thông báo.

## Tài liệu liên quan ngoài thư mục này

- `../README.md`: tổng quan ngắn ở cấp repo.
- `../backend/src/README.md`: cấu trúc backend source.
- `../backend/src/modules/README.md`: mô tả từng module backend.
- `../frontend/src/README.md`: cấu trúc frontend source.
- `../database/README.md`: cách dùng SQL final và ghi chú database.

## Quy ước đọc tài liệu

- Tài liệu ưu tiên mô tả trạng thái code hiện tại, không mô tả lại các file cũ đã bị xóa.
- Khi có xung đột giữa tài liệu và code, lấy code hiện tại làm nguồn đúng rồi cập nhật tài liệu.
- Các file sinh tự động như hóa đơn HTML, thư mục build, thư mục phân tích hoặc thư viện không được xem là source chính.

## Sơ đồ tổng quan

```text
Khách hàng/Admin
   ↓
Frontend React tại frontend/src
   ↓ Axios / React Query
Backend Express tại backend/src
   ↓ mysql2 transaction/query
Database MySQL
   ↓
Hóa đơn HTML, email, log trạng thái, dữ liệu báo cáo
```

## Nguyên tắc bảo trì

- Sửa nghiệp vụ đặt phòng phải kiểm tra đủ ba lớp: frontend, backend và database.
- Sửa API backend phải rà lại service frontend tương ứng trong `frontend/src/services`.
- Sửa trạng thái đơn phải kiểm tra các màn hình: `DatPhongCuaToi.jsx`, `QuetCheckIn.jsx`, `QuanLyDatPhong.jsx` và các component admin booking.
- Tài liệu cần được cập nhật ngay khi thêm module mới, đổi luồng thanh toán, đổi trạng thái booking hoặc đổi cấu trúc database.
