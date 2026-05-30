// Chá»©c nÄƒng: Khai bÃ¡o mÃ u sáº¯c vÃ  háº±ng sá»‘ hiá»ƒn thá»‹ cho quáº£n lÃ½ Ä‘áº·t phÃ²ng.
// Háº±ng sá»‘ giao diá»‡n cho mÃ n quáº£n lÃ½ Ä‘áº·t phÃ²ng.
// File nÃ y chá»‰ chá»©a nhÃ£n tab vÃ  mÃ u hiá»ƒn thá»‹, khÃ´ng chá»©a logic gá»i API.
import {
  TRANG_THAI_DAT_PHONG,
  TRANG_THAI_THANH_TOAN,
} from '../../../utils/lichSuDatPhong';

export const TABS_DAT_PHONG = [
  { key: 'all',     label: 'Táº¥t cáº£ Ä‘Æ¡n',         icon: 'ðŸ“¦', tone: 'slate' },
  { key: 'today',   label: 'HÃ´m nay & LÆ°u trÃº',  icon: 'ðŸ“‹', tone: 'sky' },
  { key: 'upcoming', label: 'Chờ ngày nhận phòng', icon: '📅', tone: 'emerald' },
  { key: 'holding', label: 'Chá» thanh toÃ¡n',     icon: 'â³', tone: 'amber' },
  { key: 'action',  label: 'Cáº§n xá»­ lÃ½',         icon: 'ðŸ”¥', tone: 'rose' },
  { key: 'history', label: 'Lá»‹ch sá»­',            icon: 'ðŸ“œ', tone: 'slate' },
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
  pending: 'Chá» xá»­ lÃ½',
  approved: 'ÄÃ£ duyá»‡t',
  rejected: 'ÄÃ£ tá»« chá»‘i',
  completed: 'ÄÃ£ hoÃ n táº¥t',
};
