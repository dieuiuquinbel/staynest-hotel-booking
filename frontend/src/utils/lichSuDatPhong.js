// Chá»©c nÄƒng: Háº±ng sá»‘ vÃ  hÃ m tÃ­nh toÃ¡n nghiá»‡p vá»¥ Ä‘áº·t phÃ²ng dÃ¹ng á»Ÿ frontend.
import { dinhDangNgay } from './dinhDang';

export const TRANG_THAI_DAT_PHONG = {
  HOLDING: 'holding',
  CONFIRMED: 'confirmed',
  CANCEL_REQUESTED: 'cancel_requested',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  NO_SHOW: 'no_show',
};

export const TRANG_THAI_THANH_TOAN = {
  UNPAID: 'unpaid',
  DEPOSIT_PAID: 'deposit_paid',
  PAID: 'paid',
  PAY_AT_COUNTER: 'pay_at_counter',
  REFUNDED: 'refunded',
};

export const PHUONG_THUC_THANH_TOAN = {
  ONLINE_FULL: 'online_full',
  COUNTER_DEPOSIT: 'counter_deposit',
};

export const TY_LE_PHI_HUY_HOAN_TIEN = 0.2;

export function tinhChinhSachHoanTien(paidAmount) {
  const safePaidAmount = Math.max(0, Number(paidAmount || 0));
  const cancelFeeAmount = Math.round(safePaidAmount * TY_LE_PHI_HUY_HOAN_TIEN);

  return {
    paidAmount: safePaidAmount,
    cancelFeeAmount,
    refundAmount: Math.max(0, safePaidAmount - cancelFeeAmount),
  };
}

export const KIEU_DAT_PHONG = {
  OVERNIGHT: 'overnight',
  DAY_USE: 'day_use',
};

export function layNgayHomNayYmd() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function chuyenNgayThanhYmd(value) {
  if (!value) return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

export function daDenNgayNhanPhong(checkIn) {
  const checkInYmd = chuyenNgayThanhYmd(checkIn);
  return Boolean(checkInYmd && checkInYmd <= layNgayHomNayYmd());
}

export function laDonDatPhongTuongLai(booking) {
  return chuyenNgayThanhYmd(booking?.checkIn) > layNgayHomNayYmd();
}

export function moTaHieuLucNhanPhong(booking) {
  return `00:00 ngÃ y ${dinhDangNgay(booking?.checkIn)}`;
}

export const NHAN_KIEU_DAT_PHONG = {
  [KIEU_DAT_PHONG.OVERNIGHT]: 'Qua Ä‘Ãªm',
  [KIEU_DAT_PHONG.DAY_USE]: 'Trong ngÃ y',
};

export const KHUNG_GIO_THUE_NGAY = [
  { id: 'morning', label: 'SÃ¡ng', time: '08:00 - 12:00', priceRate: 0.45 },
  { id: 'noon', label: 'TrÆ°a', time: '11:00 - 14:00', priceRate: 0.35 },
  { id: 'afternoon', label: 'Chiá»u', time: '13:00 - 18:00', priceRate: 0.5 },
  { id: 'evening', label: 'Tá»‘i', time: '18:00 - 22:00', priceRate: 0.6 },
  { id: 'full-day', label: 'Cáº£ ngÃ y', time: '08:00 - 18:00', priceRate: 0.8 },
];

export const NHAN_TRANG_THAI_DAT_PHONG = {
  [TRANG_THAI_DAT_PHONG.HOLDING]: 'Äang giá»¯ chá»—',
  [TRANG_THAI_DAT_PHONG.CONFIRMED]: 'ÄÃ£ xÃ¡c nháº­n',
  [TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED]: 'Chá» duyá»‡t há»§y/hoÃ n tiá»n',
  [TRANG_THAI_DAT_PHONG.CHECKED_IN]: 'ÄÃ£ nháº­n phÃ²ng',
  [TRANG_THAI_DAT_PHONG.CHECKED_OUT]: 'ÄÃ£ tráº£ phÃ²ng',
  [TRANG_THAI_DAT_PHONG.CANCELLED]: 'ÄÃ£ há»§y',
  [TRANG_THAI_DAT_PHONG.EXPIRED]: 'QuÃ¡ háº¡n thanh toÃ¡n',
  [TRANG_THAI_DAT_PHONG.NO_SHOW]: 'KhÃ´ng Ä‘áº¿n nháº­n phÃ²ng',
};

export const NHAN_TRANG_THAI_THANH_TOAN = {
  [TRANG_THAI_THANH_TOAN.UNPAID]: 'Chá» thanh toÃ¡n',
  [TRANG_THAI_THANH_TOAN.DEPOSIT_PAID]: 'ÄÃ£ cá»c 10%',
  [TRANG_THAI_THANH_TOAN.PAID]: 'ÄÃ£ thanh toÃ¡n',
  [TRANG_THAI_THANH_TOAN.PAY_AT_COUNTER]: 'Thanh toÃ¡n táº¡i quáº§y',
  [TRANG_THAI_THANH_TOAN.REFUNDED]: 'ÄÃ£ hoÃ n tiá»n',
};

export function tinhSoDem(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();

  if (!Number.isFinite(diff) || diff <= 0) return 0;
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function tinhTienPhong({ bookingType, checkIn, checkOut, rooms = 1, pricePerNight = 0, timeSlotId }) {
  const roomCount = Math.max(Number(rooms || 1), 1);
  const nightlyPrice = Number(pricePerNight || 0);

  if (bookingType === KIEU_DAT_PHONG.DAY_USE) {
    const slot = KHUNG_GIO_THUE_NGAY.find((item) => item.id === timeSlotId) || KHUNG_GIO_THUE_NGAY[0];
    return {
      units: 1,
      unitLabel: slot.label,
      roomPrice: Math.ceil(nightlyPrice * slot.priceRate * roomCount),
      timeSlot: slot,
    };
  }

  const nights = tinhSoDem(checkIn, checkOut);
  return {
    units: nights,
    unitLabel: `${nights} Ä‘Ãªm`,
    roomPrice: nightlyPrice * nights * roomCount,
    timeSlot: null,
  };
}

export function tinhGiamGiaVoucher(totalPrice, voucher) {
  if (!voucher) return 0;

  const safeTotal = Math.max(0, Number(totalPrice || 0));
  let discountAmount = 0;

  if (voucher.discountType === 'percent') {
    discountAmount = Math.round(safeTotal * Number(voucher.discountValue || 0));
  } else if (voucher.discountType === 'fixed') {
    discountAmount = Number(voucher.discountValue || 0);
  }

  if (!Number.isFinite(discountAmount)) return 0;
  return Math.min(safeTotal, Math.max(0, discountAmount));
}

export function taoHtmlHoaDon(booking) {
  const originalTotalPrice = Number(booking.originalTotalPrice || Number(booking.totalPrice || 0) + Number(booking.discountAmount || 0));
  const discountAmount = Number(booking.discountAmount || 0);
  const rows = [
    ['MÃ£ Ä‘Æ¡n', booking.id],
    ['KhÃ¡ch hÃ ng', booking.guestName],
    ['Email', booking.guestEmail],
    ['KhÃ¡ch sáº¡n', booking.hotel_name],
    ['PhÃ²ng', booking.room_name],
    ['NgÃ y nháº­n', dinhDangNgay(booking.checkIn)],
    ['NgÃ y tráº£', dinhDangNgay(booking.checkOut)],
    ['Tá»•ng tiá»n', Number(booking.totalPrice || 0).toLocaleString('vi-VN') + ' Ä‘'],
    ['ÄÃ£ thanh toÃ¡n', Number(booking.paidAmount || 0).toLocaleString('vi-VN') + ' Ä‘'],
    ['CÃ²n láº¡i', Number(booking.remainingAmount || 0).toLocaleString('vi-VN') + ' Ä‘'],
  ];

  rows.splice(
    7,
    1,
    ['GiÃ¡ gá»‘c', originalTotalPrice.toLocaleString('vi-VN') + ' Ä‘'],
    ['Voucher', booking.voucherTitle ? `${booking.voucherTitle} (${booking.voucherCode})` : 'KhÃ´ng Ã¡p dá»¥ng'],
    ['Giáº£m bá»Ÿi voucher', discountAmount.toLocaleString('vi-VN') + ' Ä‘'],
    ['Tá»•ng cuá»‘i cÃ¹ng', Number(booking.totalPrice || 0).toLocaleString('vi-VN') + ' Ä‘'],
  );

  return `<!doctype html><html><head><meta charset="utf-8"><title>${booking.id}</title></head><body style="font-family:Arial;line-height:1.7;padding:28px"><h1>HÃ³a Ä‘Æ¡n DieuBel</h1>${rows
    .map(([label, value]) => `<p><strong>${label}:</strong> ${value || ''}</p>`)
    .join('')}<p><strong>Dá»‹ch vá»¥:</strong> ${(booking.services || []).map((item) => item.title).join(', ') || 'KhÃ´ng cÃ³'}</p></body></html>`;
}
