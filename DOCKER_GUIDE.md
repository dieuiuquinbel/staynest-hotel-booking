# Chạy DieuBel bằng Docker

## Yêu cầu

- Cài Docker Desktop.
- Mở Docker Desktop trước khi chạy lệnh.

## Chạy dự án

Tại thư mục gốc dự án:

```powershell
cd "D:\Website khách sạn final"
docker compose up --build
```

Mở web:

```text
http://localhost:8080
```

API backend:

```text
http://localhost:5000/api/health
```

MySQL trong Docker được map ra máy thật ở port:

```text
localhost:3308
```

Thông tin database:

```text
Database: hotel_booking_db
User: root
Password: 123456
```

## Dừng dự án

```powershell
docker compose down
```

## Xóa cả dữ liệu MySQL Docker để import lại seed từ đầu

```powershell
docker compose down -v
docker compose up --build
```

Lưu ý: lệnh `down -v` sẽ xóa database trong container Docker, không xóa database XAMPP/local của máy.
