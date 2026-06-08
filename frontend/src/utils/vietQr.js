// Chức năng: Tiện ích tạo mã thanh toán và ảnh VietQR.
const CAU_HINH_VIETQR = {
  bankId: import.meta.env.VITE_VIETQR_BANK_ID || '',
  accountNo: import.meta.env.VITE_VIETQR_ACCOUNT_NO || '',
  accountName: import.meta.env.VITE_VIETQR_ACCOUNT_NAME || '',
  template: import.meta.env.VITE_VIETQR_TEMPLATE || 'compact2',
};

function chuanHoaNoiDungChuyenKhoan(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
    .slice(0, 25);
}

export function daCauHinhVietQr() {
  return Boolean(CAU_HINH_VIETQR.bankId && CAU_HINH_VIETQR.accountNo && CAU_HINH_VIETQR.accountName);
}

export function taoMaThanhToan(bookingId) {
  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');
  const suffix = String(bookingId || '').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();

  return `HD${timestamp}${suffix}`;
}

export function taoAnhVietQr({ amount, bookingId, paymentMethod, paymentCode }) {
  if (!daCauHinhVietQr()) return '';

  const transferInfo = chuanHoaNoiDungChuyenKhoan(paymentCode || `DIEUBEL ${bookingId} ${paymentMethod}`);
  const numAmount = Math.max(Math.round(Number(amount || 0)), 0);

  const base = `https://img.vietqr.io/image/${CAU_HINH_VIETQR.bankId}-${CAU_HINH_VIETQR.accountNo}-${CAU_HINH_VIETQR.template}.png`;
  const parts = [];
  if (numAmount > 0) parts.push(`amount=${numAmount}`);
  if (transferInfo) parts.push(`addInfo=${encodeURIComponent(transferInfo)}`);
  parts.push(`accountName=${encodeURIComponent(CAU_HINH_VIETQR.accountName)}`);

  return `${base}?${parts.join('&')}`;
}
