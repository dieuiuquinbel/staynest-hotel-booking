# Tính năng nổi bật của chương trình DieuBel

Tài liệu này liệt kê các tính năng chính dùng để trình bày sản phẩm, bảo vệ đồ án hoặc định hướng phát triển tiếp. Nội dung được chia theo nhóm người dùng và nhóm nghiệp vụ để dễ thuyết minh.

## 1. Trải nghiệm khách hàng

### Trang chủ và tìm phòng

- Trang chủ giới thiệu thương hiệu DieuBel, phòng nổi bật, ưu đãi và các điểm mạnh dịch vụ.
- Danh sách phòng có tìm kiếm, bộ lọc và dữ liệu phòng trực quan.
- Chi tiết phòng hiển thị ảnh, tên khách sạn, vị trí, sức chứa, tiện nghi, giá, đánh giá và hành động đặt phòng.
- Lịch sử xem phòng và lịch sử tìm kiếm giúp khách quay lại lựa chọn cũ nhanh hơn.

### Tài khoản và xác thực

- Đăng ký tài khoản bằng email.
- Đăng nhập bằng email/mật khẩu.
- Xác thực OTP qua email.
- Lưu phiên đăng nhập bằng JWT.
- Route bảo vệ tự chặn người chưa đăng nhập.
- Tách quyền khách hàng và admin.

### Đặt phòng

- Khách chọn phòng, ngày nhận/trả, số khách, số phòng và dịch vụ kèm theo.
- Hệ thống tính số đêm, giá gốc, giảm giá, tổng thanh toán, cọc tối thiểu và số tiền còn lại.
- Backend kiểm tra dữ liệu đặt phòng thay vì chỉ tin frontend.
- Khi tạo đơn, backend dùng transaction và khóa dòng phòng để giảm rủi ro đặt vượt tồn kho.
- Có mã đặt phòng, mã QR nhận phòng và lịch sử trạng thái.

### Voucher và ưu đãi

- Có voucher công khai và voucher người dùng đã lưu.
- Voucher được kiểm tra điều kiện ở backend.
- Hỗ trợ giảm tiền/giảm phần trăm hoặc ưu đãi dịch vụ tùy dữ liệu voucher.
- UI hiển thị rõ giá trước/sau giảm.

### Thanh toán demo

- Hỗ trợ thanh toán toàn bộ hoặc cọc tùy luồng.
- Có giao diện VietQR demo.
- Có xác nhận thanh toán để chuyển đơn sang trạng thái đã thanh toán.
- Sau thanh toán, khách nhìn thấy tiến trình đơn rõ ràng theo 5 bước.

## 2. Luồng nhận phòng bằng QR LAN

Đây là điểm nổi bật để trình bày demo vì mô phỏng được tình huống lễ tân dùng thiết bị khác trong cùng mạng LAN.

### Mã QR nhận phòng

- Mỗi booking có QR token riêng.
- Khách mở QR trong trang "Đặt chỗ của tôi".
- QR có thể được quét bằng điện thoại khác thông qua URL frontend/backend trong cùng mạng LAN.
- Popup QR hiển thị thông tin phòng, ngày nhận/trả, số tiền đã thanh toán và thời điểm mã có hiệu lực.

### Đơn đặt trong tương lai

- Sau thanh toán, booking tương lai vẫn giữ trạng thái hợp lý là `confirmed`.
- Admin thấy đơn trong tab "Tất cả" và tab "Chờ ngày nhận phòng".
- Nếu quét QR trước ngày nhận phòng, hệ thống chỉ báo mã hợp lệ nhưng chưa có hiệu lực.
- Quét sớm không chuyển đơn sang `checked_in`, tránh lỗi logic "chưa đến khách sạn đã nhận phòng".

### Mở nhận phòng tự động

- Từ 00:00 ngày check-in, scanner nền backend tự chuyển đơn đã thanh toán sang `checked_in`.
- UI khách hiển thị bước 4 ở trạng thái mở một phần: hệ thống đã mở nhận phòng nhưng lễ tân chưa xác minh.
- Trạng thái này giúp demo hợp lý với giả định khách đến đúng ngày và phòng đã sẵn sàng.

### Xác minh lễ tân qua LAN

- Khi lễ tân hoặc điện thoại demo quét QR đúng ngày nhận phòng, backend ghi `frontdesk_verified_at`.
- Sau khi có `frontdesk_verified_at`, bước 4 chuyển sang hoàn tất.
- Đây là lớp xác minh thứ hai, tách biệt với auto check-in của hệ thống.

### Trả phòng

- Khách chỉ có thể tự check-out sau khi đã được xác minh LAN.
- Nếu khách quên check-out, scanner nền tự hoàn tất đơn khi hết ngày trả phòng.
- Khi đơn `checked_out`, tiến trình hoàn tất 5/5 và khách có thể đánh giá theo điều kiện của hệ thống.

## 3. Trang "Đặt chỗ của tôi"

- Có tab lọc đơn theo trạng thái.
- Hiển thị card booking gồm ảnh phòng, tên khách sạn, tên phòng, địa chỉ, trạng thái thanh toán và mã đơn.
- Có timeline 5 bước: giữ chỗ, thanh toán, xác nhận, nhận phòng, trả phòng.
- Bước nhận phòng có trạng thái đặc biệt: chưa đến ngày, tự mở một phần, hoặc đã xác minh LAN.
- Có modal QR nhận phòng.
- Có nút xem phòng, chi tiết/hóa đơn, hỗ trợ, thanh toán và trả phòng tùy trạng thái.
- Có thông báo rõ khi thao tác thành công hoặc lỗi.

## 4. Khu vực admin

### Dashboard và điều hành

- Admin có layout riêng và route bảo vệ.
- Dashboard tổng quan số liệu vận hành.
- Có khu vực quản lý đặt phòng dạng hàng đợi và panel chi tiết.
- Có các tab nghiệp vụ: tất cả đơn, hôm nay/lưu trú, chờ thanh toán, cần xử lý, chờ ngày nhận phòng, lịch sử.

### Quản lý đặt phòng

- Admin xem nhanh khách, phòng, ngày nhận/trả, trạng thái thanh toán và số tiền.
- Admin xem chi tiết phòng, tài chính, hoàn tiền, ghi chú nội bộ và lịch sử trạng thái.
- Admin có thể xác minh nhận phòng LAN khi hệ thống đã tự mở nhận phòng.
- Admin có thể cập nhật trạng thái hợp lệ theo điều kiện backend kiểm tra.
- Các thao tác trạng thái quan trọng được ghi log.

### Quản lý phòng

- Admin xem danh sách phòng.
- Có form tạo/sửa phòng.
- Hỗ trợ ảnh phòng, sức chứa, tiện nghi, giá và trạng thái phòng.
- Dữ liệu phòng được dùng chung cho trang khách hàng và admin.

### Quản lý khách hàng

- Admin xem danh sách khách hàng.
- Có panel chi tiết khách hàng.
- Có trạng thái tài khoản và dữ liệu liên quan đến lịch sử đặt phòng.

### Hóa đơn, doanh thu và marketing

- Hệ thống sinh hóa đơn HTML.
- Admin có trang quản lý hóa đơn.
- Có báo cáo doanh thu cơ bản.
- Có khu vực marketing/voucher để quản lý ưu đãi.

## 5. Hỗ trợ khách hàng và phản hồi

- Khách có thể gửi yêu cầu hỗ trợ/khiếu nại.
- Admin có thể xử lý yêu cầu hỗ trợ.
- Backend có cấu hình gửi email phản hồi khi SMTP sẵn sàng.
- Khách có thể đánh giá phòng khi đủ điều kiện.
- Trang tài khoản/lịch sử hỗ trợ khách theo dõi hoạt động.

## 6. Tính năng hệ thống

- Backend có endpoint health check để kiểm tra server và database.
- Có cấu hình CORS cho frontend.
- Có proxy Vite từ frontend `/api` sang backend `5000`.
- Có scanner nền trạng thái booking chạy theo chu kỳ.
- Có file `.env.example` cho backend và frontend.
- Có `.gitignore` loại bỏ thư viện, build, hóa đơn sinh tự động, upload và file phân tích cục bộ.

## 7. Điểm mạnh khi trình bày demo

- Luồng đặt phòng có đủ vòng đời từ chọn phòng đến thanh toán, nhận phòng và trả phòng.
- QR LAN là phần dễ gây ấn tượng vì dùng được thiết bị khác để quét trong cùng mạng.
- Trạng thái check-in hai lớp giúp giải thích được khác biệt giữa "hệ thống mở nhận phòng" và "lễ tân xác minh".
- Admin có màn hình riêng để chứng minh hệ thống không chỉ là giao diện khách hàng.
- Dữ liệu hóa đơn, doanh thu, voucher, hỗ trợ và đánh giá giúp chương trình có chiều sâu nghiệp vụ.

## 8. Giới hạn hiện tại cần nói rõ khi bảo vệ

- Thanh toán là demo, chưa kết nối cổng thanh toán thật.
- Email phụ thuộc cấu hình SMTP, thiếu SMTP thì chỉ bỏ qua gửi email.
- Scanner nền chạy theo chu kỳ, không phải cron production chuyên dụng.
- Tồn kho phòng đang phù hợp demo, nếu dùng thật cần mở rộng kiểm tra trùng lịch theo từng phòng cụ thể.
- Chưa có bộ test tự động đầy đủ cho state machine booking.

## 9. Hướng phát triển tiếp

- Tách route backend thành router riêng.
- Tách `quanLyDatPhong.service.js` thành nhiều service nhỏ hơn.
- Thêm test cho booking lifecycle.
- Thêm lịch sử audit chi tiết cho mọi thao tác admin.
- Tích hợp thanh toán thật.
- Mở rộng quản lý phòng theo từng mã phòng vật lý.
- Thêm phân quyền admin chi tiết theo vai trò lễ tân, kế toán, quản lý.
