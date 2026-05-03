# OTP, email va hoa don

Khong can Google Cloud Console. Backend dung SMTP, Gmail App Password hoat dong duoc.

Neu database da tao tu phien ban cu, chay them:

```text
database/03_add_auth_booking_invoice.sql
```

Cau hinh `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
MAIL_FROM="StayNest" <your_email@gmail.com>
INVOICE_DIR=storage/invoices
```

Neu chua cau hinh SMTP, moi truong dev van test duoc OTP bang `devOtp` tra ve sau API dang ky.

Hoa don dat phong duoc luu trong `backend/storage/invoices` neu khong doi `INVOICE_DIR`. Admin co the goi:

```text
GET /api/admin/invoices
GET /api/admin/invoices/:id/download
```
