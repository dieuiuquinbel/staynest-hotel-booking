// Chá»©c nÄƒng: Chá»©a hÃ m phá»¥ trá»£ xá»­ lÃ½ tráº¡ng thÃ¡i vÃ  nhÃ£n Ä‘áº·t phÃ²ng admin.
// Helper nghiá»‡p vá»¥ cho mÃ n quáº£n lÃ½ Ä‘áº·t phÃ²ng.
// CÃ¡c hÃ m á»Ÿ Ä‘Ã¢y giÃºp tÃ¡ch Ä‘iá»u kiá»‡n lá»c/nhÃ£n ra khá»i file trang Ä‘á»ƒ dá»… Ä‘á»c vÃ  dá»… test hÆ¡n.
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
  return NHAN_TRANG_THAI_DAT_PHONG[status] || status || 'ChÆ°a cÃ³';
}

export function nhanThanhToan(status) {
  return NHAN_TRANG_THAI_THANH_TOAN[status] || status || 'ChÆ°a cÃ³';
}

export function nhanHoanTien(status) {
  return NHAN_HOAN_TIEN[status] || status || 'ChÆ°a cÃ³';
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
    // Hiá»ƒn thá»‹ táº¥t cáº£ Ä‘Æ¡n chÆ°a lÆ°u trá»¯ vÃ o lá»‹ch sá»­ (Äang lÆ°u trÃº, Chá» thanh toÃ¡n, ÄÃ£ xÃ¡c nháº­n...)
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

export function chonTabMacDinh(bookings) {
  return 'all';
}

export function tomTatHanhDong(booking) {
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING) {
    return { label: 'Chá» thanh toÃ¡n giá»¯ chá»—', tone: 'text-amber-700', hint: 'Há»‡ thá»‘ng Ä‘ang chá» giao dá»‹ch chuyá»ƒn khoáº£n QR Ä‘á»‘i soÃ¡t.' };
  }
  if (laDonChoNgayNhanPhong(booking)) {
    return { label: 'Đã xác nhận - Chờ ngày nhận phòng', tone: 'text-emerald-700', hint: 'QR có thể kiểm tra trước, nhưng chỉ nhận phòng từ 00:00 ngày check-in.' };
  }
  if (laDonConPhaiThu(booking)) {
    return { label: 'Thu tiá»n phÃ²ng (CÃ²n ná»£)', tone: 'text-amber-700', hint: 'Cáº§n truy thu pháº§n tiá»n cÃ²n láº¡i khi lÃ m thá»§ tá»¥c Check-in.' };
  }
  if (laDonNhanPhongHomNay(booking)) {
    return { label: 'YÃªu cáº§u nháº­n phÃ²ng (Check-in)', tone: 'text-sky-700', hint: 'KhÃ¡ch Ä‘áº¿n hÃ´m nay, lÃ m thá»§ tá»¥c nháº­n phÃ²ng & giao khÃ³a.' };
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN && !booking.frontdeskVerifiedAt) {
    return { label: 'Đã mở nhận phòng tự động', tone: 'text-brand-700', hint: 'Chờ lễ tân quét QR LAN để hoàn tất bước nhận phòng.' };
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN) {
    return { label: 'KhÃ¡ch Ä‘ang lÆ°u trÃº', tone: 'text-sky-700', hint: 'GiÃ¡m sÃ¡t dá»‹ch vá»¥ phÃ²ng, chuáº©n bá»‹ Check-out.' };
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED || booking.refundRequest?.status === 'pending') {
    return { label: 'PhÃª duyá»‡t há»§y Ä‘Æ¡n & HoÃ n tiá»n', tone: 'text-rose-600', hint: 'Quáº£n lÃ½ xem xÃ©t lÃ½ do vÃ  duyá»‡t sá»‘ tiá»n hoÃ n tráº£.' };
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED) {
    return { label: 'ÄÃ£ xÃ¡c nháº­n (Chá» Ä‘áº¿n)', tone: 'text-emerald-700', hint: 'Há»“ sÆ¡ Ä‘áº·t phÃ²ng há»£p lá»‡, chá» ngÃ y nháº­n phÃ²ng.' };
  }
  return { label: 'Lá»‹ch sá»­ lÆ°u trÃº', tone: 'text-slate-700', hint: 'Há»“ sÆ¡ Ä‘áº·t phÃ²ng Ä‘Ã£ hoÃ n táº¥t toÃ n bá»™ quy trÃ¬nh.' };
}

export function ghiChuHanhDong(booking) {
  if (!booking) return '';
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING) {
    return 'Há»“ sÆ¡ Ä‘ang chá» giao dá»‹ch chuyá»ƒn khoáº£n QR Ä‘á»‘i soÃ¡t tá»± Ä‘á»™ng. KhÃ´ng cáº§n thao tÃ¡c thá»§ cÃ´ng, chá»‰ há»§y náº¿u quÃ¡ háº¡n hoáº·c khÃ¡ch yÃªu cáº§u.';
  }
  if (laDonConPhaiThu(booking)) {
    return 'Há»“ sÆ¡ Ä‘Ã£ Ä‘áº·t cá»c 10%. Vui lÃ²ng thu há»“i pháº§n tiá»n phÃ²ng cÃ²n láº¡i khi lÃ m thá»§ tá»¥c Check-in cho khÃ¡ch.';
  }
  if (laDonNhanPhongHomNay(booking)) {
    return 'KhÃ¡ch Ä‘Ã£ thanh toÃ¡n Ä‘á»§ vÃ  nháº­n phÃ²ng hÃ´m nay. Vui lÃ²ng Ä‘á»‘i chiáº¿u giáº¥y tá» vÃ  lÃ m thá»§ tá»¥c nháº­n phÃ²ng (Check-in).';
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED) {
    return 'Äáº·t phÃ²ng há»£p lá»‡ vÃ  Ä‘Ã£ thanh toÃ¡n Ä‘á»§. Chá»‰ cáº§n theo dÃµi vÃ  ghi chÃº náº¿u khÃ¡ch cÃ³ yÃªu cáº§u dá»‹ch vá»¥ phÃ¡t sinh.';
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN) {
    return 'KhÃ¡ch hÃ ng Ä‘ang lÆ°u trÃº táº¡i cÆ¡ sá»Ÿ. Thá»±c hiá»‡n thá»§ tá»¥c tráº£ phÃ²ng (Check-out) vÃ  kiá»ƒm tra phÃ²ng khi khÃ¡ch rá»i Ä‘i.';
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED) {
    return 'KhÃ¡ch gá»­i yÃªu cáº§u há»§y Ä‘Æ¡n. Vui lÃ²ng xem xÃ©t lÃ½ do, Ä‘á»‘i chiáº¿u chÃ­nh sÃ¡ch hoÃ n tiá»n 80% Ä‘á»ƒ phÃª duyá»‡t hoáº·c tá»« chá»‘i.';
  }
  return 'Há»“ sÆ¡ Ä‘áº·t phÃ²ng Ä‘Ã£ káº¿t thÃºc quy trÃ¬nh lÆ°u trÃº. Khu vá»±c nÃ y chá»‰ dÃ¹ng Ä‘á»ƒ Ä‘á»‘i soÃ¡t lá»‹ch sá»­.';
}

export function taoThongKeHangDoi(bookings) {
  return [
    {
      label: 'Há»§y / hoÃ n tiá»n',
      value: demDonTheoTab(bookings, 'action'),
      hint: 'YÃªu cáº§u quáº£n lÃ½ cáº§n quyáº¿t Ä‘á»‹nh.',
      tone: 'text-rose-600',
      tabKey: 'action',
      group: 'action',
    },
    {
      label: 'Check-in hÃ´m nay',
      value: bookings.filter((b) => laDonNhanPhongHomNay(b)).length,
      hint: 'Lá»… tÃ¢n cáº§n xá»­ lÃ½.',
      tone: 'text-sky-700',
      tabKey: 'today',
      group: 'action',
    },
    {
      label: 'Äang lÆ°u trÃº',
      value: bookings.filter((b) => b.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN).length,
      hint: 'KhÃ¡ch Ä‘ang á»Ÿ vÃ  chá» check-out.',
      tone: 'text-sky-700',
      tabKey: 'today',
      group: 'monitor',
    },
    {
      label: 'Chá» khÃ¡ch thanh toÃ¡n',
      value: bookings.filter((b) => b.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING).length,
      hint: 'ÄÆ¡n giá»¯ chá»—, khÃ¡ch chÆ°a xÃ¡c nháº­n QR.',
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
