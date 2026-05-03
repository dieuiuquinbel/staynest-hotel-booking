# Diệu Bel Data Flow

Tai lieu nay mo ta luong du lieu chinh cua he thong de debug, thuyet trinh va mo rong code.

## 1. Tong quan kien truc

```text
React frontend
  -> axios service layer
  -> Express API
  -> service layer backend
  -> MySQL
  -> SMTP Gmail
  -> storage/invoices
```

Thanh phan chinh:

- `frontend/src/pages`: man hinh nguoi dung.
- `frontend/src/services`: wrapper goi API.
- `frontend/src/store/authStore.js`: luu JWT va user bang Zustand persist.
- `backend/src/app.js`: khai bao API routes.
- `backend/src/services`: xu ly nghiep vu auth, room, booking, mail, invoice.
- `database/*.sql`: schema, seed, migration.

## 2. Luong dang ky va xac minh OTP

```text
AuthPage register form
  -> POST /api/auth/register
  -> auth.service.registerUser()
  -> users insert email_verified = false
  -> tao OTP 6 so
  -> email_otps insert otp_hash + expires_at
  -> mail.service.sendMail()
  -> frontend hien form nhap OTP
```

Khi nguoi dung nhap OTP:

```text
AuthPage OTP form
  -> POST /api/auth/verify-email
  -> auth.service.verifyEmailOtp()
  -> tim email_otps theo email + otp_hash + chua used + chua het han
  -> update email_otps.used_at
  -> update users.email_verified = true
  -> tra ve JWT + user
  -> authStore.setSession()
```

Neu SMTP chua cau hinh:

```text
registerUser()
  -> sendMail() skipped
  -> backend tra devOtp
  -> frontend hien devOtp de test local
```

## 3. Luong dang nhap

```text
AuthPage login form
  -> POST /api/auth/login { identifier, password }
  -> auth.service.loginUser()
  -> findUserByIdentifier(email OR username)
  -> bcrypt.compare(password)
  -> JWT sign
  -> frontend luu token + user vao authStore
```

Frontend gui token cho cac request can dang nhap qua interceptor:

```text
frontend/src/services/api.js
  -> Authorization: Bearer <token>
```

Backend doc token:

```text
requireAuth middleware
  -> jwt.verify()
  -> findUserById()
  -> req.user = user
```

## 4. Luong tim va xem phong

```text
HomePage / RoomListPage
  -> getRooms(queryString)
  -> GET /api/rooms
  -> room.service.getRooms()
  -> buildRoomFilters()
  -> SELECT rooms theo filter
  -> mapRoom()
  -> frontend render RoomCard
```

Chi tiet phong:

```text
RoomDetailPage
  -> getRoomById(roomId)
  -> GET /api/rooms/:id
  -> room.service.getRoomById()
```

## 5. Luong dat phong

```text
BookingPage
  -> user chon ngay, so khach, so phong, dich vu
  -> tinh tam tinh tren frontend de hien UI
  -> POST /api/bookings
```

Backend:

```text
requireAuth
  -> booking.service.createBooking()
  -> check user.email_verified
  -> getRoomById(roomId)
  -> normalizeServices()
  -> calculateNights()
  -> tinh roomPrice, servicePrice, totalPrice
  -> INSERT bookings
  -> createInvoiceFile()
  -> INSERT invoices
  -> commit transaction
  -> sendBookingConfirmationEmail()
```

Sau khi API thanh cong:

```text
BookingPage
  -> saveMyBooking() localStorage
  -> navigate /my-bookings
```

Luu y hien tai:

- DB la nguon du lieu chinh cho booking va invoice.
- `localStorage` van duoc dung de hien nhanh tab "Dat cho cua toi" tren frontend demo.
- Neu muon production hon, nen tao `GET /api/my-bookings` va bo phu thuoc localStorage.

## 6. Luong gui email

OTP email:

```text
auth.service.sendEmailVerificationOtp()
  -> mail.service.sendMail()
  -> SMTP Gmail
```

Email xac nhan dat phong:

```text
booking.service.sendBookingConfirmationEmail()
  -> dinh kem invoice HTML
  -> mail.service.sendMail()
  -> SMTP Gmail
```

Bien moi truong can co:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=app_password
MAIL_FROM="StayNest" <your_email@gmail.com>
```

## 7. Luong hoa don admin

Khi dat phong:

```text
invoice.service.createInvoiceFile()
  -> tao file HTML trong backend/storage/invoices
  -> tra invoiceCode + filePath
  -> bookings.service INSERT invoices
```

Admin xem danh sach:

```text
GET /api/admin/invoices
  -> requireAuth
  -> requireAdmin
  -> booking.service.listInvoices()
```

Admin tai file:

```text
GET /api/admin/invoices/:id/download
  -> requireAuth
  -> requireAdmin
  -> booking.service.getInvoiceById()
  -> res.download(file_path)
```

Dieu kien admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## 8. Bang du lieu lien quan

```text
users
  id, full_name, username, email, password_hash, phone,
  email_verified, role, status

email_otps
  user_id, email, otp_hash, expires_at, used_at

rooms
  thong tin khach san/phong, gia, tien nghi, inventory

bookings
  booking_code, user_id, room_id, check_in_date, check_out_date,
  guests, rooms_count, nights, room_price, service_price, total_price,
  booking_status, payment_status, payment_method

invoices
  booking_id, invoice_code, file_path, total_amount
```

## 9. Diem nen cai tien tiep

Nen lam tiep theo thu tu:

1. Tao `GET /api/my-bookings` de trang "Dat cho cua toi" doc tu DB thay vi localStorage.
2. Luu dich vu da chon vao `booking_services` thay vi chi gom vao `bookings.note`.
3. Tao trang admin UI cho invoices/bookings.
4. Doi invoice HTML sang PDF neu can in an that.
5. Them bang `discount_codes` va luong ap ma giam gia truoc khi tao booking.
