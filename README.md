# DieuBel Hotel Booking

Ung dung demo dat phong khach san gom frontend React, backend Express va MySQL. Ban nay duoc dong goi de chia se trong nhom, nen thong tin ket noi database va tai khoan demo duoc cong khai trong project.

## 1. Cau truc thu muc

```text
frontend/   Giao dien khach hang va admin
backend/    API, xac thuc, dat phong, thanh toan, hoa don
database/   Schema, seed du lieu va migration MySQL
```

## 2. Tai khoan va database demo

Tai khoan admin tren website:

```text
Username: admin
Password: admin123
```

Thong tin MySQL khi chay bang Docker:

```text
Host: 127.0.0.1
Port: 3307
Username: root
Password: 123456
Database/Schema: hotel_booking_db
```

Thong tin backend dung trong container:

```text
DB_HOST=database
DB_PORT=3306
DB_NAME=hotel_booking_db
DB_USER=root
DB_PASSWORD=123456
JWT_SECRET=staynest_jwt_dev_secret_2026
```

File cau hinh demo nam tai `backend/.env` va da duoc de kem project. Khi chay bang Docker Compose, cac bien moi truong trong `docker-compose.yml` se duoc uu tien cho container.

## 3. Chay bang Docker Desktop

Yeu cau:

- Da cai Docker Desktop.
- Mo Docker Desktop truoc khi chay lenh.
- Chay lenh tai thu muc goc cua project.

Chay lan dau:

```powershell
docker compose up --build
```

Chay nen:

```powershell
docker compose up --build -d
```

Mo ung dung:

```text
Website: http://localhost:5714
Backend health check: http://localhost:5000/api/health
MySQL host port: 127.0.0.1:3307
```

Dung chuong trinh:

```powershell
docker compose down
```

Xem log:

```powershell
docker compose logs -f
```

## 4. Mo database bang MySQL Workbench 8.0

Tao connection moi trong MySQL Workbench:

```text
Connection Name: DieuBel Docker MySQL
Connection Method: Standard (TCP/IP)
Hostname: 127.0.0.1
Port: 3307
Username: root
Password: 123456
Default Schema: hotel_booking_db
```

Sau khi ket noi, mo tab `Schemas`, bam refresh neu chua thay database. Schema can xem la `hotel_booking_db`.

Cac file tao bang va seed du lieu nam trong thu muc `database/`:

```text
01_init_schema.sql
02_seed_sample_data.sql
03_add_auth_booking_invoice.sql
03_seed_more_rooms.sql
05_clean_demo_data.sql
06_expand_hotel_booking_system.sql
```

## 5. Import lai database tu dau

MySQL container chi tu import cac file trong `database/` khi volume du lieu con trong. Neu muon xoa du lieu cu va tao lai database tu dau:

```powershell
docker compose down -v
docker compose up --build
```

Lenh `docker compose down -v` se xoa volume MySQL cua project, bao gom booking/tai khoan da tao trong luc demo.

## 6. Chay khong dung Docker

Neu cai MySQL truc tiep tren may, tao database:

```sql
CREATE DATABASE hotel_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Sau do import cac file trong `database/` theo thu tu o muc 4.

Chay backend:

```powershell
cd backend
npm install
npm run dev
```

Chay frontend:

```powershell
cd frontend
npm install
npm run dev
```

Khi chay backend truc tiep tren may, backend doc cau hinh tu `backend/.env`:

```text
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=hotel_booking_db
DB_USER=root
DB_PASSWORD=123456
```

## 7. Luu y khi gui cho nguoi khac

Gui ca thu muc project, gom cac phan quan trong:

```text
docker-compose.yml
backend/.env
backend/Dockerfile
frontend/Dockerfile
database/
backend/
frontend/
```

Nguoi nhan chi can mo Docker Desktop va chay:

```powershell
docker compose up --build
```

Neu port `3307`, `5000` hoac `5714` dang bi may khac su dung, doi mapping port trong `docker-compose.yml`.
