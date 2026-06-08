// Chức năng: Tiện ích điểm thưởng, đổi quà, voucher và kiểm tra điều kiện áp dụng.
// ──────────────────────────────────────────────────────────────────────────────
// Hệ thống 2 loại điểm:
//   • Điểm thành tích (diemThanhTich): tích lũy vĩnh viễn, dùng xếp hạng thành viên.
//     KHÔNG BAO GIỜ GIẢM — kể cả khi đổi voucher.
//   • Điểm tiêu dùng (diemTieuDung): tăng song song với thành tích, GIẢM khi đổi quà.
//     Đây là loại điểm khách dùng để đổi voucher/phần thưởng.
//
// Migration: Nếu tồn tại khóa cũ `rewardPoints` mà chưa có 2 khóa mới,
// hệ thống tự copy điểm cũ sang cả 2 loại mới trong lần load đầu tiên.
// ──────────────────────────────────────────────────────────────────────────────
import { KHOA_LUU_TRU } from './khoaLuuTru';

// ─── Khóa lưu trữ ──────────────────────────────────────────────────────────
const KHOA_CU = KHOA_LUU_TRU.rewardPoints;       // Legacy — chỉ dùng migration
const KHOA_THANH_TICH = KHOA_LUU_TRU.diemThanhTich;
const KHOA_TIEU_DUNG = KHOA_LUU_TRU.diemTieuDung;
const KHOA_QUA_DA_DOI = KHOA_LUU_TRU.redeemedRewards;

// ─── Danh sách phần thưởng đổi bằng điểm tiêu dùng ─────────────────────────
export const QUA_THANH_VIEN = [
  {
    id: 'voucher-50k',
    title: 'Voucher giảm 50.000 đ',
    description: 'Áp dụng cho đơn đặt phòng tiếp theo.',
    cost: 100,
    discountType: 'fixed',
    discountValue: 50000,
  },
  {
    id: 'breakfast',
    title: 'Miễn phí bữa sáng',
    description: 'Quy đổi thành gói bữa sáng cho 1 đặt phòng.',
    cost: 180,
    discountType: 'fixed',
    discountValue: 120000,
  },
  {
    id: 'voucher-10',
    title: 'Voucher giảm 10%',
    description: 'Dùng cho đơn thanh toán online toàn bộ.',
    cost: 250,
    discountType: 'percent',
    discountValue: 0.1,
  },
  {
    id: 'airport',
    title: 'Ưu đãi đưa đón sân bay',
    description: 'Giảm chi phí dịch vụ đưa đón sân bay.',
    cost: 320,
    discountType: 'fixed',
    discountValue: 150000,
  },
  {
    id: 'vip-upgrade',
    title: 'Nâng hạng phòng miễn phí',
    description: 'Ưu đãi nâng hạng phòng trống miễn phí khi check-in.',
    cost: 450,
    discountType: 'service',
    discountValue: 'room-upgrade',
  },
  {
    id: 'discount-15',
    title: 'Voucher giảm 15%',
    description: 'Giảm sâu cho kỳ nghỉ tiếp theo của bạn.',
    cost: 500,
    discountType: 'percent',
    discountValue: 0.15,
  },
  {
    id: 'cash-200k',
    title: 'Voucher giảm 200.000 đ',
    description: 'Trừ trực tiếp tiền mặt vào hóa đơn lưu trú.',
    cost: 350,
    discountType: 'fixed',
    discountValue: 200000,
  },
];

// ─── Danh sách voucher khuyến mãi (lưu miễn phí, không tốn điểm) ───────────
export const VOUCHER_KHUYEN_MAI = [
  {
    id: 'first-booking-10',
    code: 'FIRST10',
    title: 'Giảm 10% booking đầu tiên',
    description: 'Áp dụng cho khách sạn đầu tiên sau khi đăng nhập hoặc đăng ký tài khoản DieuBel.',
    badge: 'Khách mới',
    discountType: 'percent',
    discountValue: 0.1,
    minSpend: 0,
    expiresIn: '7 ngày',
    imageTone: 'from-sky-300 via-blue-500 to-indigo-700',
    imageText: '10% OFF',
  },
  {
    id: 'hotel-8',
    code: 'HOTEL8',
    title: 'Giảm 8% cho phòng từ 2 đêm',
    description: 'Dành cho đơn đặt phòng khách sạn từ 2 đêm, tối đa 350.000 đ.',
    badge: 'Ở dài hơn',
    discountType: 'percent',
    discountValue: 0.08,
    minSpend: 1200000,
    expiresIn: '5 ngày',
    imageTone: 'from-emerald-300 via-teal-500 to-cyan-700',
    imageText: '8% OFF',
  },
  {
    id: 'weekend-7',
    code: 'WEEKEND7',
    title: 'Giảm 7% cuối tuần',
    description: 'Áp dụng cho khách sạn, resort biển còn phòng trong thứ Sáu đến Chủ nhật.',
    badge: 'Cuối tuần',
    discountType: 'percent',
    discountValue: 0.07,
    minSpend: 900000,
    expiresIn: '3 ngày',
    imageTone: 'from-fuchsia-400 via-pink-500 to-rose-600',
    imageText: 'DEAL',
  },
  {
    id: 'family-5',
    code: 'FAMILY5',
    title: 'Giảm 5% phòng gia đình',
    description: 'Dành cho phòng family hoặc căn hộ từ 4 khách trở lên.',
    badge: 'Gia đình',
    discountType: 'percent',
    discountValue: 0.05,
    minSpend: 1500000,
    expiresIn: '10 ngày',
    imageTone: 'from-amber-200 via-orange-400 to-red-500',
    imageText: '5% OFF',
  },
  {
    id: 'breakfast-free',
    code: 'EATFREE',
    title: 'Miễn phí bữa sáng',
    description: 'Tặng gói bữa sáng cho 2 khách khi đặt phòng suite hoặc deluxe.',
    badge: 'Dịch vụ',
    discountType: 'service',
    discountValue: 'breakfast',
    minSpend: 1000000,
    expiresIn: '6 ngày',
    imageTone: 'from-yellow-200 via-lime-300 to-emerald-500',
    imageText: 'FREE',
  },
  {
    id: 'airport-free',
    code: 'AIRPORT',
    title: 'Free đưa đón sân bay',
    description: 'Miễn phí một chiều đưa đón sân bay cho đơn resort từ 3.000.000 đ.',
    badge: 'Tiện ích',
    discountType: 'service',
    discountValue: 'airport',
    minSpend: 3000000,
    expiresIn: '4 ngày',
    imageTone: 'from-cyan-300 via-blue-500 to-violet-700',
    imageText: 'RIDE',
  },
  {
    id: 'local-6',
    code: 'LOCAL6',
    title: 'Giảm 6% khách sạn nội địa',
    description: 'Áp dụng cho các điểm đến phổ biến tại Hà Nội, Đà Nẵng, Hội An và TP.HCM.',
    badge: 'Nội địa',
    discountType: 'percent',
    discountValue: 0.06,
    minSpend: 800000,
    expiresIn: '8 ngày',
    imageTone: 'from-green-300 via-emerald-500 to-slate-800',
    imageText: 'LOCAL',
  },
  {
    id: 'late-checkout',
    code: 'LATEOUT',
    title: 'Free late checkout',
    description: 'Tặng quyền trả phòng muộn đến 14:00 cho khách sạn đủ điều kiện.',
    badge: 'Linh hoạt',
    discountType: 'service',
    discountValue: 'late-checkout',
    minSpend: 1200000,
    expiresIn: '5 ngày',
    imageTone: 'from-violet-300 via-purple-500 to-slate-900',
    imageText: 'VIP',
  },
];

// ─── Tiện ích đọc/ghi localStorage ──────────────────────────────────────────

/** Đọc một số nguyên từ localStorage, trả 0 nếu không hợp lệ. */
function docSo(key) {
  const value = Number(window.localStorage.getItem(key) || 0);
  return Number.isFinite(value) ? value : 0;
}

/** Đọc mảng JSON từ localStorage, trả [] nếu không hợp lệ. */
function docMang(key) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ─── Migration từ hệ thống cũ (1 loại điểm) sang 2 loại ────────────────────
// Chạy 1 lần duy nhất khi phát hiện khóa cũ có giá trị mà 2 khóa mới chưa có.

function chayMigrationNeuCan() {
  const diemCu = docSo(KHOA_CU);
  const daCoDiemMoi =
    window.localStorage.getItem(KHOA_THANH_TICH) !== null ||
    window.localStorage.getItem(KHOA_TIEU_DUNG) !== null;

  if (diemCu > 0 && !daCoDiemMoi) {
    window.localStorage.setItem(KHOA_THANH_TICH, String(diemCu));
    window.localStorage.setItem(KHOA_TIEU_DUNG, String(diemCu));
  }
}

// Tự chạy migration khi module được import lần đầu.
chayMigrationNeuCan();

// ─── API đọc / cộng / trừ 2 loại điểm ──────────────────────────────────────

/** Đọc điểm thành tích (vĩnh viễn, dùng xếp hạng). */
export function docDiemThanhTich() {
  return docSo(KHOA_THANH_TICH);
}

/** Đọc điểm tiêu dùng (có thể dùng đổi voucher). */
export function docDiemTieuDung() {
  return docSo(KHOA_TIEU_DUNG);
}

/**
 * Backwards-compatible: trả điểm tiêu dùng.
 * Các consumer cũ gọi `docDiemThuong()` sẽ nhận diemTieuDung để logic đổi quà không thay đổi.
 */
export function docDiemThuong() {
  return docDiemTieuDung();
}

/**
 * Cộng điểm cho CẢ HAI loại đồng thời.
 * Gọi khi hoàn thành nhiệm vụ, đặt phòng, v.v.
 * @returns {{ thanhTich: number, tieuDung: number }}
 */
export function congDiemThuong(points) {
  const delta = Math.max(0, Number(points || 0));
  if (delta === 0) return { thanhTich: docDiemThanhTich(), tieuDung: docDiemTieuDung() };

  const nextThanhTich = docDiemThanhTich() + delta;
  const nextTieuDung = docDiemTieuDung() + delta;

  window.localStorage.setItem(KHOA_THANH_TICH, String(nextThanhTich));
  window.localStorage.setItem(KHOA_TIEU_DUNG, String(nextTieuDung));

  // Cập nhật khóa cũ để đồng bộ (backward compat)
  window.localStorage.setItem(KHOA_CU, String(nextTieuDung));

  return { thanhTich: nextThanhTich, tieuDung: nextTieuDung };
}

// ─── Quà đã đổi ─────────────────────────────────────────────────────────────

/** Đọc danh sách quà đã đổi từ localStorage. */
export function docQuaDaDoi() {
  return docMang(KHOA_QUA_DA_DOI);
}

/** Đánh dấu một voucher đã dùng (sử dụng khi áp voucher vào đơn đặt phòng). */
export function danhDauQuaDaDung(code) {
  const next = docQuaDaDoi().map((reward) =>
    reward.code === code ? { ...reward, used: true, usedAt: new Date().toISOString() } : reward,
  );
  window.localStorage.setItem(KHOA_QUA_DA_DOI, JSON.stringify(next));
  return next;
}

// ─── Kiểm tra & mô tả điều kiện voucher ─────────────────────────────────────

/** Đọc số ngày hết hạn từ chuỗi expiresIn (ví dụ: "7 ngày" → 7). */
function docSoNgayHetHan(voucher) {
  const match = String(voucher?.expiresIn || '').match(/\d+/);
  return match ? Number(match[0]) : null;
}

/**
 * Kiểm tra voucher có hợp lệ cho đơn totalPrice hay không.
 * @returns {{ hopLe: boolean, lyDo: string }}
 */
export function kiemTraDieuKienVoucher(voucher, totalPrice) {
  if (!voucher) {
    return { hopLe: true, lyDo: '' };
  }

  if (voucher.used) {
    return { hopLe: false, lyDo: 'Voucher này đã được sử dụng.' };
  }

  const minSpend = Number(voucher.minSpend || 0);
  if (minSpend > 0 && Number(totalPrice || 0) < minSpend) {
    return {
      hopLe: false,
      lyDo: `Đơn cần tối thiểu ${minSpend.toLocaleString('vi-VN')} đ để dùng voucher này.`,
    };
  }

  const soNgayHetHan = docSoNgayHetHan(voucher);
  const mocLuu = voucher.savedAt || voucher.redeemedAt;
  if (soNgayHetHan && mocLuu) {
    const hetHanLuc = new Date(mocLuu).getTime() + soNgayHetHan * 24 * 60 * 60 * 1000;
    if (Number.isFinite(hetHanLuc) && Date.now() > hetHanLuc) {
      return { hopLe: false, lyDo: 'Voucher này đã hết hạn.' };
    }
  }

  return { hopLe: true, lyDo: '' };
}

/** Trả chuỗi mô tả điều kiện áp dụng voucher (dùng hiển thị cho khách). */
export function moTaDieuKienVoucher(voucher) {
  if (!voucher) return '';

  const dieuKien = [];
  if (Number(voucher.minSpend || 0) > 0) {
    dieuKien.push(`tối thiểu ${Number(voucher.minSpend).toLocaleString('vi-VN')} đ`);
  }
  if (voucher.expiresIn) {
    dieuKien.push(`hết hạn sau ${voucher.expiresIn}`);
  }

  return dieuKien.join(', ');
}

// ─── Nhiệm vụ nhận thưởng ───────────────────────────────────────────────────
// Mỗi nhiệm vụ trả về `points` — khi hoàn thành sẽ cộng vào CẢ 2 loại điểm.

export function docNhiemVuNhanThuong({ user, bookings = [], favoriteRooms = [], reviews = [] }) {
  return [
    { id: 'verify_email', title: 'Xác minh email', points: 150, completed: Boolean(user?.email_verified) },
    { id: 'first_booking', title: 'Đặt phòng đầu tiên', points: 300, completed: bookings.length > 0 },
    {
      id: 'online_payment',
      title: 'Thanh toán online',
      points: 150,
      completed: bookings.some((booking) => booking.paymentStatus === 'paid' || booking.paymentStatus === 'deposit_paid'),
    },
    { id: 'write_review', title: 'Viết đánh giá sau checkout', points: 90, completed: reviews.length > 0 },
    { id: 'save_3_rooms', title: 'Lưu 3 phòng yêu thích', points: 60, completed: favoriteRooms.length >= 3 },
  ];
}

// ─── Đổi quà thưởng ─────────────────────────────────────────────────────────
// Chỉ TRỪ điểm tiêu dùng. Điểm thành tích KHÔNG GIẢM → hạng thành viên giữ nguyên.

/**
 * Đổi phần thưởng bằng điểm tiêu dùng.
 * @returns {{ ok: boolean, thanhTich: number, tieuDung: number, redeemed: Array }}
 */
export function doiQuaThuong(reward) {
  const currentTieuDung = docDiemTieuDung();
  const currentThanhTich = docDiemThanhTich();

  if (!reward || currentTieuDung < reward.cost) {
    return {
      ok: false,
      points: currentTieuDung,         // backward compat
      thanhTich: currentThanhTich,
      tieuDung: currentTieuDung,
      redeemed: docQuaDaDoi(),
    };
  }

  // Chỉ trừ điểm tiêu dùng
  const nextTieuDung = currentTieuDung - reward.cost;
  const redeemedReward = {
    ...reward,
    code: `DB-${reward.id.toUpperCase()}-${String(Date.now()).slice(-5)}`,
    redeemedAt: new Date().toISOString(),
    used: false,
  };
  const nextRedeemed = [redeemedReward, ...docQuaDaDoi()].slice(0, 20);

  window.localStorage.setItem(KHOA_TIEU_DUNG, String(nextTieuDung));
  window.localStorage.setItem(KHOA_CU, String(nextTieuDung)); // sync legacy
  window.localStorage.setItem(KHOA_QUA_DA_DOI, JSON.stringify(nextRedeemed));

  return {
    ok: true,
    points: nextTieuDung,              // backward compat
    thanhTich: currentThanhTich,       // KHÔNG GIẢM
    tieuDung: nextTieuDung,
    redeemed: nextRedeemed,
  };
}

// ─── Lưu voucher khuyến mãi (không tốn điểm) ───────────────────────────────

/** Lưu voucher khuyến mãi vào kho voucher (trang chủ, banner, v.v.). */
export function luuVoucherKhuyenMai(voucher) {
  if (!voucher) return docQuaDaDoi();

  const current = docQuaDaDoi();
  const existing = current.find((reward) => reward.code === voucher.code);
  if (existing) return current;

  const savedVoucher = {
    ...voucher,
    title: voucher.title,
    description: voucher.description,
    savedAt: new Date().toISOString(),
    redeemedAt: new Date().toISOString(),
    used: false,
    source: 'home-promotion',
  };
  const nextRedeemed = [savedVoucher, ...current].slice(0, 30);
  window.localStorage.setItem(KHOA_QUA_DA_DOI, JSON.stringify(nextRedeemed));
  return nextRedeemed;
}
