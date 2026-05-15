# Chạy dự án bằng Docker Desktop

## Yêu cầu

- Cài Docker Desktop.
- Mở Docker Desktop trước khi chạy lệnh.
- Chạy lệnh tại thư mục gốc dự án: `D:\Website khách sạn final`.

## Chạy lần đầu

```powershell
docker compose up --build
```

Sau khi container chạy xong:

- Website: http://localhost:5714
- Backend health check: http://localhost:5000/api/health
- MySQL trên máy host: `localhost:3307`

Tài khoản admin mặc định:

```text
admin / admin123
```

## Chạy nền

```powershell
docker compose up --build -d
```

Xem log:

```powershell
docker compose logs -f
```

Dừng chương trình:

```powershell
docker compose down
```

## Import lại database từ đầu

MySQL chỉ tự import các file trong `database/` khi volume dữ liệu còn trống. Nếu muốn xóa dữ liệu cũ và import lại từ đầu:

```powershell
docker compose down -v
docker compose up --build
```

Lệnh này sẽ xóa volume database Docker của dự án.

## Gửi cho máy khác

Gửi toàn bộ thư mục dự án, bao gồm các file mới:

- `docker-compose.yml`
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `.dockerignore`
- `backend/.dockerignore`
- `frontend/.dockerignore`

Người nhận chỉ cần mở Docker Desktop rồi chạy:

```powershell
docker compose up --build
```
