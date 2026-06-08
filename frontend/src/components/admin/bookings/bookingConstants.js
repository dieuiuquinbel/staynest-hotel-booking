// Chức năng: Khai báo màu sắc và hằng số hiển thị cho quản lý đặt phòng.
// Hằng số giao diện cho màn quản lý đặt phòng.
// File này chỉ chứa nhãn tab và màu hiển thị, không chứa logic gọi API.
import {
  TRANG_THAI_DAT_PHONG,
  TRANG_THAI_THANH_TOAN,
} from '../../../utils/lichSuDatPhong';

export const TABS_DAT_PHONG = [
  { key: 'all', label: 'Tất cả đơn', icon: '📦', tone: 'slate' },
  { key: 'today', label: 'Hôm nay & Lưu trú', icon: '📋', tone: 'sky' },
  { key: 'upcoming', label: 'Chờ ngày nhận phòng', icon: '📅', tone: 'emerald' },
  { key: 'holding', label: 'Chờ thanh toán', icon: '⏳', tone: 'amber' },
  { key: 'action', label: 'Cần xử lý', icon: '🔥', tone: 'rose' },
  { key: 'history', label: 'Lịch sử', icon: '📜', tone: 'slate' },
];

export const MAU_TRANG_THAI_DAT_PHONG = {
  [TRANG_THAI_DAT_PHONG.HOLDING]: 'bg-amber-50 text-amber-700',
  [TRANG_THAI_DAT_PHONG.CONFIRMED]: 'bg-emerald-50 text-emerald-700',
  [TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED]: 'bg-orange-50 text-orange-700',
  [TRANG_THAI_DAT_PHONG.CHECKED_IN]: 'bg-sky-50 text-sky-700',
  [TRANG_THAI_DAT_PHONG.CHECKED_OUT]: 'bg-slate-100 text-slate-700',
  [TRANG_THAI_DAT_PHONG.CANCELLED]: 'bg-rose-50 text-rose-700',
  [TRANG_THAI_DAT_PHONG.EXPIRED]: 'bg-slate-100 text-slate-700',
  [TRANG_THAI_DAT_PHONG.NO_SHOW]: 'bg-rose-50 text-rose-700',
};

export const MAU_TRANG_THAI_THANH_TOAN = {
  [TRANG_THAI_THANH_TOAN.UNPAID]: 'bg-rose-50 text-rose-700',
  [TRANG_THAI_THANH_TOAN.DEPOSIT_PAID]: 'bg-amber-50 text-amber-700',
  [TRANG_THAI_THANH_TOAN.PAID]: 'bg-emerald-50 text-emerald-700',
  [TRANG_THAI_THANH_TOAN.PAY_AT_COUNTER]: 'bg-sky-50 text-sky-700',
  [TRANG_THAI_THANH_TOAN.REFUNDED]: 'bg-slate-100 text-slate-700',
};

export const MAU_TRANG_THAI_HOAN_TIEN = {
  pending: 'bg-orange-50 text-orange-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
  completed: 'bg-slate-100 text-slate-700',
};

export const NHAN_HOAN_TIEN = {
  pending: 'Chờ xử lý',
  approved: 'Đã duyệt',
  rejected: 'Đã từ chối',
  completed: 'Đã hoàn tất',
};
