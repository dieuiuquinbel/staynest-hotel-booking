# Cấu trúc chương trình

Tài liệu cấu trúc chi tiết đã được chuẩn hóa tại:

- `Tài liệu dự án/CAU_TRUC_CHUONG_TRINH.md`

File này được giữ ở thư mục gốc để người đọc dễ tìm khi mở repo. Nội dung chính của dự án hiện được tổ chức như sau:

```text
D:\Website khách sạn final
├─ backend/          Express API, nghiệp vụ, upload, hóa đơn
├─ frontend/         React/Vite SPA cho khách hàng và admin
├─ database/         SQL final và script lịch sử
└─ Tài liệu dự án/    Tài liệu kiến trúc, tính năng, vận hành
```

Quy ước chính:

- Backend route đặt trong `backend/src/ungDung.js`.
- Backend nghiệp vụ đặt trong `backend/src/modules`.
- Frontend page đặt trong `frontend/src/pages`.
- Frontend component đặt trong `frontend/src/components`.
- Frontend API client đặt trong `frontend/src/services`.
- Helper thuần đặt trong `frontend/src/utils` hoặc file `*Helpers.js`.

Khi cần chỉnh cấu trúc sâu hơn, đọc tài liệu chi tiết trong `Tài liệu dự án/CAU_TRUC_CHUONG_TRINH.md` trước để tránh move file làm gãy import.
