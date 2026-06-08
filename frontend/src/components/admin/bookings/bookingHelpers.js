// Chức năng: Chứa hàm phụ trợ xử lý trạng thái và nhãn đặt phòng admin.
// Helper nghiệp vụ cho màn quản lý đặt phòng.
// Các hàm ở đây giúp tách điều kiện lọc/nhãn ra khỏi file trang để dễ đọc và dễ test hơn.
import {
  NHAN_TRANG_THAI_DAT_PHONG,
  NHAN_TRANG_THAI_THANH_TOAN,
  TRANG_THAI_DAT_PHONG,
  TRANG_THAI_THANH_TOAN,
} from '../../../utils/lichSuDatPhong';
import { NHAN_HOAN_TIEN, TABS_DAT_PHONG } from './bookingConstants';

export function layNgayHomNayYmd() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function laTabHopLe(raw) {
  return TABS_DAT_PHONG.some((item) => item.key === raw);
}

export function nhanDatPhong(status) {
  return NHAN_TRANG_THAI_DAT_PHONG[status] || status || 'Chưa có';
}

export function nhanThanhToan(status) {
  return NHAN_TRANG_THAI_THANH_TOAN[status] || status || 'Chưa có';
}

export function nhanHoanTien(status) {
  return NHAN_HOAN_TIEN[status] || status || 'Chưa có';
}

export function daThanhToanDu(booking) {
  return booking.paymentStatus === TRANG_THAI_THANH_TOAN.PAID;
}

export function laDonNhanPhongHomNay(booking) {
  return booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED
    && daThanhToanDu(booking)
    && booking.checkIn === layNgayHomNayYmd();
}

export function laDonConPhaiThu(booking) {
  return booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED
    && booking.paymentStatus === TRANG_THAI_THANH_TOAN.DEPOSIT_PAID;
}

export function laDonChoNgayNhanPhong(booking) {
  return booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED
    && [TRANG_THAI_THANH_TOAN.PAID, TRANG_THAI_THANH_TOAN.DEPOSIT_PAID].includes(booking.paymentStatus)
    && booking.checkIn > layNgayHomNayYmd();
}

export function khopTabDatPhong(booking, tab) {
  if (tab === 'action') {
    return booking.bookingStatus === TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED
      || booking.refundRequest?.status === 'pending';
  }
  if (tab === 'today') {
    return laDonNhanPhongHomNay(booking)
      || (laDonConPhaiThu(booking) && !laDonChoNgayNhanPhong(booking))
      || booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN;
  }
  if (tab === 'upcoming') {
    return laDonChoNgayNhanPhong(booking);
  }
  if (tab === 'holding') {
    return booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING;
  }
  if (tab === 'history') {
    return [
      TRANG_THAI_DAT_PHONG.CHECKED_OUT,
      TRANG_THAI_DAT_PHONG.CANCELLED,
      TRANG_THAI_DAT_PHONG.NO_SHOW,
      TRANG_THAI_DAT_PHONG.EXPIRED,
    ].includes(booking.bookingStatus);
  }
  if (tab === 'all') {
    // Hiển thị tất cả đơn chưa lưu trữ vào lịch sử (Đang lưu trú, Chờ thanh toán, Đã xác nhận...)
    return ![
      TRANG_THAI_DAT_PHONG.CHECKED_OUT,
      TRANG_THAI_DAT_PHONG.CANCELLED,
      TRANG_THAI_DAT_PHONG.NO_SHOW,
      TRANG_THAI_DAT_PHONG.EXPIRED,
    ].includes(booking.bookingStatus);
  }
  return false;
}

export function khopTimKiemDatPhong(booking, query) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return true;

  return [
    booking.id,
    booking.bookingCode,
    booking.guestName,
    booking.guestEmail,
    booking.guestPhone,
    booking.room_name,
    booking.hotel_name,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(keyword));
}

export function khopNgayDatPhong(booking, date) {
  if (!date) return true;
  return booking.checkIn === date || booking.checkOut === date;
}

export function demDonTheoTab(bookings, tab) {
  return bookings.filter((booking) => khopTabDatPhong(booking, tab)).length;
}

export function chonTabMacDinh() {
  return 'all';
}

export function tomTatHanhDong(booking) {
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING) {
    return { label: 'Chờ thanh toán giữ chỗ', tone: 'text-amber-700', hint: 'Hệ thống đang chờ giao dịch chuyển khoản QR đối soát.' };
  }
  if (laDonChoNgayNhanPhong(booking)) {
    return { label: 'Đã xác nhận - Chờ ngày nhận phòng', tone: 'text-emerald-700', hint: 'QR có thể kiểm tra trước, nhưng chỉ nhận phòng từ 00:00 ngày check-in.' };
  }
  if (laDonConPhaiThu(booking)) {
    return { label: 'Thu tiền phòng (Còn nợ)', tone: 'text-amber-700', hint: 'Cần truy thu phần tiền còn lại khi làm thủ tục Check-in.' };
  }
  if (laDonNhanPhongHomNay(booking)) {
    return { label: 'Yêu cầu nhận phòng (Check-in)', tone: 'text-sky-700', hint: 'Khách đến hôm nay, làm thủ tục nhận phòng & giao khóa.' };
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN && !booking.frontdeskVerifiedAt) {
    return { label: 'Đã mở nhận phòng tự động', tone: 'text-brand-700', hint: 'Chờ lễ tân quét QR LAN để hoàn tất bước nhận phòng.' };
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN) {
    return { label: 'Khách đang lưu trú', tone: 'text-sky-700', hint: 'Giám sát dịch vụ phòng, chuẩn bị Check-out.' };
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED || booking.refundRequest?.status === 'pending') {
    return { label: 'Phê duyệt hủy đơn & Hoàn tiền', tone: 'text-rose-600', hint: 'Quản lý xem xét lý do và duyệt số tiền hoàn trả.' };
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED) {
    return { label: 'Đã xác nhận (Chờ đến)', tone: 'text-emerald-700', hint: 'Hồ sơ đặt phòng hợp lệ, chờ ngày nhận phòng.' };
  }
  return { label: 'Lịch sử lưu trú', tone: 'text-slate-700', hint: 'Hồ sơ đặt phòng đã hoàn tất toàn bộ quy trình.' };
}

export function ghiChuHanhDong(booking) {
  if (!booking) return '';
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING) {
    return 'Hồ sơ đang chờ giao dịch chuyển khoản QR đối soát tự động. Không cần thao tác thủ công, chỉ hủy nếu quá hạn hoặc khách yêu cầu.';
  }
  if (laDonConPhaiThu(booking)) {
    return 'Hồ sơ đã đặt cọc 10%. Vui lòng thu hồi phần tiền phòng còn lại khi làm thủ tục Check-in cho khách.';
  }
  if (laDonNhanPhongHomNay(booking)) {
    return 'Khách đã thanh toán đủ và nhận phòng hôm nay. Vui lòng đối chiếu giấy tờ và làm thủ tục nhận phòng (Check-in).';
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED) {
    return 'Đặt phòng hợp lệ và đã thanh toán đủ. Chỉ cần theo dõi và ghi chú nếu khách có yêu cầu dịch vụ phát sinh.';
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN) {
    return 'Khách hàng đang lưu trú tại cơ sở. Thực hiện thủ tục trả phòng (Check-out) và kiểm tra phòng khi khách rời đi.';
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED) {
    return 'Khách gửi yêu cầu hủy đơn. Vui lòng xem xét lý do, đối chiếu chính sách hoàn tiền 80% để phê duyệt hoặc từ chối.';
  }
  return 'Hồ sơ đặt phòng đã kết thúc quy trình lưu trú. Khu vực này chỉ dùng để đối soát lịch sử.';
}

export function taoThongKeHangDoi(bookings) {
  return [
    {
      label: 'Hủy / hoàn tiền',
      value: demDonTheoTab(bookings, 'action'),
      hint: 'Yêu cầu quản lý cần quyết định.',
      tone: 'text-rose-600',
      tabKey: 'action',
      group: 'action',
    },
    {
      label: 'Check-in hôm nay',
      value: bookings.filter((b) => laDonNhanPhongHomNay(b)).length,
      hint: 'Lễ tân cần xử lý.',
      tone: 'text-sky-700',
      tabKey: 'today',
      group: 'action',
    },
    {
      label: 'Đang lưu trú',
      value: bookings.filter((b) => b.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN).length,
      hint: 'Khách đang ở và chờ check-out.',
      tone: 'text-sky-700',
      tabKey: 'today',
      group: 'monitor',
    },
    {
      label: 'Chờ khách thanh toán',
      value: bookings.filter((b) => b.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING).length,
      hint: 'Đơn giữ chỗ, khách chưa xác nhận QR.',
      tone: 'text-amber-700',
      tabKey: 'all',
      group: 'monitor',
    },
  ];
}

export function tinhSoNgayChoDuyet(refundRequest) {
  if (!refundRequest?.createdAt) return 0;
  return Math.max(1, Math.ceil((Date.now() - new Date(refundRequest.createdAt).getTime()) / 86400000));
}
