# Hướng dẫn cài môi trường chạy Frontend, Backend, SQL trên Windows

Tài liệu này dùng cho dự án website đặt phòng khách sạn theo stack:

- Frontend: `React + Vite + Tailwind`
- Backend: `Node.js + Express`
- Database: `MySQL`

---

## 1. Trạng thái máy hiện tại

Mình đã kiểm tra trên máy của bạn:

- `Node.js` đã có: `v24.15.0`
- `Git` đã có: `2.52.0`
- `npm` có sẵn nhưng PowerShell đang chặn script `npm.ps1`
- `MySQL` chưa được cài hoặc chưa có trong `PATH`
- `VS Code` đã có

Kết luận:

- Chưa cần cài lại Node ngay.
- Cần xử lý cách dùng `npm` trong PowerShell.
- Cần cài MySQL.

---

## 2. Các phần mềm cần có

Bạn cần 4 thứ:

1. `VS Code`
2. `Node.js`
3. `MySQL Server`
4. `MySQL Workbench`

Hiện tại bạn đã có:

- VS Code
- Node.js
- Git

Còn thiếu:

- MySQL Server
- MySQL Workbench

---

## 3. Xử lý lỗi npm trên PowerShell

Trên máy bạn, lệnh `npm -v` bị lỗi vì PowerShell chặn file `npm.ps1`.

Bạn có 2 cách.

## Cách 1: Dùng `npm.cmd` luôn

Đây là cách an toàn và nhanh nhất.

Thay vì:

```powershell
npm install
npm run dev
```

Bạn dùng:

```powershell
npm.cmd install
npm.cmd run dev
```

Áp dụng tương tự cho mọi lệnh npm.

Ví dụ:

```powershell
npm.cmd create vite@latest frontend
npm.cmd install
npm.cmd run dev
```

## Cách 2: Mở quyền PowerShell cho user hiện tại

Nếu bạn muốn gõ `npm` thay vì `npm.cmd`, mở PowerShell bằng quyền user bình thường và chạy:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Sau đó gõ:

```powershell
npm -v
```

Nếu vẫn chưa được, đóng PowerShell rồi mở lại.

Khuyến nghị:

- Nếu bạn mới học, cứ dùng `npm.cmd` là ổn.

---

## 4. Cài MySQL

## Cách khuyên dùng cho sinh viên

Hãy cài:

- `MySQL Community Server`
- `MySQL Workbench`

Thông thường bạn sẽ tải bộ `MySQL Installer for Windows` từ trang MySQL và chọn các thành phần ở trên trong lúc cài.

## Trong lúc cài, nên chọn

### 1. Installation Type

Chọn:

- `Developer Default`

Nếu không có, chọn:

- `Custom`

Rồi tích:

- MySQL Server
- MySQL Workbench

### 2. Root Password

Đặt ví dụ:

```txt
root123
```

Bạn có thể đổi, nhưng phải nhớ chính xác.

### 3. Port

Giữ mặc định:

```txt
3306
```

### 4. Windows Service

Giữ bật service mặc định.

Ví dụ tên service:

```txt
MySQL80
```

### 5. Finish

Cài xong, mở:

- `MySQL Workbench`

---

## 5. Kiểm tra MySQL sau khi cài

Mở PowerShell mới và thử:

```powershell
mysql --version
```

Nếu chưa chạy được, có thể MySQL đã cài nhưng chưa thêm vào `PATH`.

Thư mục thường gặp:

```txt
C:\Program Files\MySQL\MySQL Server 8.0\bin
```

Hoặc:

```txt
C:\Program Files\MySQL\MySQL Server 8.4\bin
```

Bạn thêm thư mục `bin` đó vào `Environment Variables > Path`.

Sau đó mở lại PowerShell và chạy:

```powershell
mysql --version
```

---

## 6. Tạo database cho dự án

Sau khi MySQL cài xong, bạn có 2 cách:

- Dùng `MySQL Workbench`
- Dùng command line

## Cách 1: Dùng MySQL Workbench

1. Mở Workbench.
2. Tạo connection với:
   - Host: `localhost`
   - Port: `3306`
   - User: `root`
   - Password: mật khẩu bạn vừa đặt
3. Bấm mở connection.
4. Chạy câu lệnh:

```sql
CREATE DATABASE hotel_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. Sau đó:

```sql
USE hotel_booking_db;
```

## Cách 2: Dùng command line

```powershell
mysql -u root -p
```

Nhập mật khẩu, sau đó chạy:

```sql
CREATE DATABASE hotel_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hotel_booking_db;
```

---

## 7. Khởi tạo phần frontend

Trong thư mục:

```txt
D:\Website khách sạn final
```

Mở PowerShell và chạy:

```powershell
npm.cmd create vite@latest frontend -- --template react
```

Đi vào thư mục frontend:

```powershell
Set-Location 'D:\Website khách sạn final\frontend'
```

Cài dependencies cơ bản:

```powershell
npm.cmd install
npm.cmd install react-router-dom axios zustand @tanstack/react-query
npm.cmd install -D tailwindcss postcss autoprefixer
```

Khởi tạo Tailwind:

```powershell
npx.cmd tailwindcss init -p
```

Sau đó chạy frontend:

```powershell
npm.cmd run dev
```

Khi chạy thành công, thường sẽ có địa chỉ kiểu:

```txt
http://localhost:5173
```

---

## 8. Khởi tạo phần backend

Quay về thư mục gốc dự án:

```powershell
Set-Location 'D:\Website khách sạn final'
```

Tạo thư mục backend:

```powershell
New-Item -ItemType Directory -Path backend
Set-Location 'D:\Website khách sạn final\backend'
```

Khởi tạo Node project:

```powershell
npm.cmd init -y
```

Cài các package backend:

```powershell
npm.cmd install express cors dotenv jsonwebtoken bcrypt mysql2
npm.cmd install -D nodemon
```

Tạo cấu trúc cơ bản:

```txt
backend/
  src/
    config/
    controllers/
    middlewares/
    routes/
    services/
    app.js
    server.js
  .env
  package.json
```

Trong `package.json`, scripts nên có:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

Chạy backend:

```powershell
npm.cmd run dev
```

Nếu thành công, bạn sẽ có server ở:

```txt
http://localhost:5000
```

---

## 9. Tạo file `.env` cho backend

Trong thư mục `backend`, tạo file `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hotel_booking_db
DB_USER=root
DB_PASSWORD=root123
JWT_SECRET=hotel_booking_secret_key
```

Lưu ý:

- `DB_PASSWORD` phải đúng với password MySQL bạn đã đặt.

---

## 10. Kết nối backend với MySQL

Ví dụ file `backend/src/config/db.js`:

```js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
```

Backend muốn đọc được `.env` thì trong `src/server.js` phải có:

```js
require('dotenv').config();
```

---

## 11. Tạo bảng SQL

Sau khi tạo database, bạn chạy các lệnh `CREATE TABLE` trong file thiết kế:

- [HOTEL_BOOKING_SYSTEM_DESIGN.md](D:\Website khách sạn final\HOTEL_BOOKING_SYSTEM_DESIGN.md)

Phần cần copy là mục:

- `12.3. SQL tạo bảng`

Thứ tự chạy:

1. `users`
2. `rooms`
3. `bookings`
4. `services`
5. `booking_services`

Sau đó bạn có thể thêm dữ liệu mẫu.

---

## 12. Cách chạy đồng thời frontend và backend

Bạn cần mở `2 cửa sổ PowerShell`.

## Cửa sổ 1: Frontend

```powershell
Set-Location 'D:\Website khách sạn final\frontend'
npm.cmd run dev
```

## Cửa sổ 2: Backend

```powershell
Set-Location 'D:\Website khách sạn final\backend'
npm.cmd run dev
```

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:5000
```

---

## 13. Cấu hình gọi API từ frontend

Trong frontend, nên tạo file `src/services/api.js`:

```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export default api;
```

Ví dụ gọi API:

```js
import api from './api';

export const getRooms = (params) => api.get('/rooms', { params });
```

---

## 14. Nếu gặp lỗi CORS

Trong backend, bật CORS:

```js
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

---

## 15. Thứ tự học và làm đúng nhất

Bạn nên làm theo đúng thứ tự này:

1. Cài và kiểm tra MySQL.
2. Tạo database `hotel_booking_db`.
3. Khởi tạo backend.
4. Kết nối backend với MySQL.
5. Tạo bảng SQL.
6. Test backend bằng API đơn giản.
7. Khởi tạo frontend.
8. Gọi thử API từ frontend.
9. Sau đó mới làm giao diện chi tiết.

Lý do:

- Nếu frontend làm trước nhưng backend và SQL chưa chạy, bạn sẽ rất dễ rối.

---

## 16. Lỗi phổ biến

## Lỗi 1: `npm` bị chặn

Giải pháp:

- Dùng `npm.cmd`
- Hoặc chạy `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

## Lỗi 2: `mysql is not recognized`

Giải pháp:

- MySQL chưa cài
- Hoặc chưa thêm thư mục `bin` vào `PATH`

## Lỗi 3: Backend không kết nối được database

Kiểm tra:

- MySQL service có chạy không
- `.env` đúng chưa
- Password đúng chưa
- Database `hotel_booking_db` đã tạo chưa

## Lỗi 4: Frontend gọi API bị CORS

Giải pháp:

- Bật `cors()` ở backend

## Lỗi 5: Port bị trùng

Giải pháp:

- Frontend giữ `5173`
- Backend dùng `5000`
- MySQL dùng `3306`

---

## 17. Sau khi cài xong, bạn nên kiểm tra 5 thứ này

```powershell
node -v
npm.cmd -v
git --version
mysql --version
code --version
```

Nếu 5 lệnh này chạy được, môi trường gần như đã sẵn sàng.

---

## 18. Bước tiếp theo

Sau khi bạn cài xong MySQL, bước tiếp theo hợp lý nhất là:

1. Mình scaffold luôn `frontend` và `backend` cho bạn.
2. Mình tạo file SQL khởi tạo database.
3. Mình viết route test đầu tiên:
   - `GET /api/health`
   - `GET /api/rooms`

Nếu bạn muốn, ở bước kế tiếp mình có thể làm luôn phần scaffold source code ban đầu để bạn chỉ việc chạy.
