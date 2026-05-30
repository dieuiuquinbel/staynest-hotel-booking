# Cấu trúc `database`

Thư mục này chứa SQL để dựng database MySQL cho website đặt phòng khách sạn DieuBel.

## File nên dùng

- `final_database.sql`  
  File SQL tổng hợp hiện tại. Khi cần dựng lại database demo từ đầu, ưu tiên chạy file này.

File này bao gồm:

- `CREATE DATABASE`
- `CREATE TABLE`
- dữ liệu phòng mẫu
- dữ liệu dịch vụ/voucher
- ảnh phòng mẫu
- các cột mới phục vụ luồng check-in/check-out, bao gồm xác minh lễ tân qua LAN

## File lịch sử

- `01_init_schema.sql`
- `02_seed_sample_data.sql`
- `03_add_auth_booking_invoice.sql`
- `03_seed_more_rooms.sql`
- `05_clean_demo_data.sql`
- `06_expand_hotel_booking_system.sql`

Các file này là lịch sử phát triển/migration trong quá trình làm chương trình. Với bản final/demo, chỉ nên chạy `final_database.sql` để tránh lệch schema.

## Cách chạy

1. Mở MySQL Workbench hoặc công cụ MySQL tương đương.
2. Chọn file `final_database.sql`.
3. Chạy toàn bộ script.
4. Kiểm tra backend `.env` đang trỏ đúng `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
5. Khởi động backend và gọi:

```bash
curl http://127.0.0.1:5000/api/health
```

## Lưu ý dữ liệu

- `final_database.sql` có thể xóa/tạo lại bảng để reset dữ liệu demo.
- Không chạy trên database thật đang có dữ liệu quan trọng nếu chưa backup.
- Khi thêm cột mới cho booking, cần cập nhật cả `final_database.sql` và `backend/src/modules/system/cauTrucVanHanh.service.js` nếu muốn app tự bổ sung cột khi chạy.
