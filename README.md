# DieuBel - Website dat phong khach san

DieuBel la ung dung full-stack mo phong he thong dat phong khach san, gom khu vuc khach hang, khu vuc admin, API backend va database MySQL. Du an tap trung vao luong dat phong qua dem, thanh toan demo, ma QR nhan phong qua mang LAN, hoa don, voucher, danh gia va quan ly van hanh.

## Thanh phan chinh

```text
D:\Website khach san final
├─ frontend/              React + Vite SPA cho khach hang va admin
├─ backend/               Express REST API va nghiep vu he thong
├─ database/              SQL final va cac migration lich su
├─ Tài liệu dự án/         Tai lieu tong quan, cau truc, luong van hanh
└─ Hóa đơn admin/          File hoa don HTML sinh tu he thong
```

## Cong nghe

- Frontend: React, Vite, React Router DOM, TanStack React Query, Zustand, Axios, Tailwind CSS.
- Backend: Node.js, Express, mysql2/promise, JWT, bcryptjs, multer, nodemailer.
- Database: MySQL.
- Demo thanh toan: VietQR mock/manual confirmation.
- Demo nhan phong: QR token cong khai, co the quet bang dien thoai trong cung mang LAN.

## Luong nghiep vu noi bat

- Khach xem phong, loc phong, dat phong, ap voucher va thanh toan.
- Don da thanh toan trong tuong lai nam o trang thai cho ngay nhan phong.
- Tu 00:00 ngay check-in, backend tu mo trang thai nhan phong.
- Le tan hoac dien thoai LAN quet QR de xac minh nhan phong lan cuoi.
- Khach co the tra phong sau khi da duoc xac minh LAN; he thong cung co quet nen de tu dong tra phong khi het ngay luu tru.
- Admin co hang doi don, tab cho ngay nhan phong, hoa don, doanh thu, khach hang, phong, voucher va khieu nai/ho tro.

## Chay du an

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Build frontend:

```bash
cd frontend
npm run build
```

Kiem tra backend:

```bash
curl http://127.0.0.1:5000/api/health
```

## Cau hinh moi truong

- Mau backend: `backend/.env.example`
- Mau frontend: `frontend/.env.example`
- File `.env` thuc te khong nen dua len git vi co the chua mat khau DB, JWT secret va SMTP.

## Tai lieu chi tiet

- `Tài liệu dự án/README.md`: muc luc tai lieu.
- `Tài liệu dự án/CAU_TRUC_CHUONG_TRINH.md`: cau truc thu muc, module, quy uoc sap xep file.
- `Tài liệu dự án/TINH_NANG_NOI_BAT.md`: danh sach tinh nang noi bat cua chuong trinh.
- `Tài liệu dự án/GHI_CHU_DU_AN.md`: luong van hanh va cac diem can giu khi phat trien tiep.
- `database/README.md`: cach dung SQL final va ghi chu database.
