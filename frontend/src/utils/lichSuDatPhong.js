// Chức năng: Hằng số và hàm tính toán nghiệp vụ đặt phòng dùng ở frontend.
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
  return `00:00 ngày ${dinhDangNgay(booking?.checkIn)}`;
}

export const NHAN_KIEU_DAT_PHONG = {
  [KIEU_DAT_PHONG.OVERNIGHT]: 'Qua đêm',
  [KIEU_DAT_PHONG.DAY_USE]: 'Trong ngày',
};

export const KHUNG_GIO_THUE_NGAY = [
  { id: 'morning', label: 'Sáng', time: '08:00 - 12:00', priceRate: 0.45 },
  { id: 'noon', label: 'Trưa', time: '11:00 - 14:00', priceRate: 0.35 },
  { id: 'afternoon', label: 'Chiều', time: '13:00 - 18:00', priceRate: 0.5 },
  { id: 'evening', label: 'Tối', time: '18:00 - 22:00', priceRate: 0.6 },
  { id: 'full-day', label: 'Cả ngày', time: '08:00 - 18:00', priceRate: 0.8 },
];

export const NHAN_TRANG_THAI_DAT_PHONG = {
  [TRANG_THAI_DAT_PHONG.HOLDING]: 'Đang giữ chỗ',
  [TRANG_THAI_DAT_PHONG.CONFIRMED]: 'Đã xác nhận',
  [TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED]: 'Chờ duyệt hủy/hoàn tiền',
  [TRANG_THAI_DAT_PHONG.CHECKED_IN]: 'Đã nhận phòng',
  [TRANG_THAI_DAT_PHONG.CHECKED_OUT]: 'Đã trả phòng',
  [TRANG_THAI_DAT_PHONG.CANCELLED]: 'Đã hủy',
  [TRANG_THAI_DAT_PHONG.EXPIRED]: 'Quá hạn thanh toán',
  [TRANG_THAI_DAT_PHONG.NO_SHOW]: 'Không đến nhận phòng',
};

export const NHAN_TRANG_THAI_THANH_TOAN = {
  [TRANG_THAI_THANH_TOAN.UNPAID]: 'Chờ thanh toán',
  [TRANG_THAI_THANH_TOAN.DEPOSIT_PAID]: 'Đã cọc 10%',
  [TRANG_THAI_THANH_TOAN.PAID]: 'Đã thanh toán',
  [TRANG_THAI_THANH_TOAN.PAY_AT_COUNTER]: 'Thanh toán tại quầy',
  [TRANG_THAI_THANH_TOAN.REFUNDED]: 'Đã hoàn tiền',
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
    unitLabel: `${nights} đêm`,
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
  
  let badgeClass = 'badge-unpaid';
  let statusLabel = 'Chờ thanh toán';
  let stampClass = 'stamp-unpaid';
  let stampText = 'Chờ CK';

  if (booking.paymentStatus === TRANG_THAI_THANH_TOAN.PAID) {
    badgeClass = 'badge-paid';
    statusLabel = 'Đã thanh toán';
    stampClass = 'stamp-paid';
    stampText = 'Đã trả';
  } else if (booking.paymentStatus === TRANG_THAI_THANH_TOAN.DEPOSIT_PAID) {
    badgeClass = 'badge-deposit';
    statusLabel = 'Đã cọc 10%';
    stampClass = 'stamp-deposit';
    stampText = 'Đã cọc';
  } else if (booking.paymentStatus === TRANG_THAI_THANH_TOAN.REFUNDED) {
    badgeClass = 'badge-refunded';
    statusLabel = 'Đã hoàn tiền';
    stampClass = 'stamp-refunded';
    stampText = 'Đã hoàn';
  } else if (booking.paymentStatus === TRANG_THAI_THANH_TOAN.PAY_AT_COUNTER) {
    badgeClass = 'badge-deposit';
    statusLabel = 'Thanh toán tại quầy';
    stampClass = 'stamp-deposit';
    stampText = 'Tại quầy';
  }

  let remainingBoxHtml = '';
  if (Number(booking.remainingAmount || 0) > 0) {
    remainingBoxHtml = `
      <div class="remaining-box unpaid">
        <span>Còn lại cần thanh toán:</span>
        <span>${Number(booking.remainingAmount).toLocaleString('vi-VN')} đ</span>
      </div>
    `;
  } else {
    remainingBoxHtml = `
      <div class="remaining-box paid">
        <span>Đã tất toán toàn bộ</span>
      </div>
    `;
  }

  let servicesRow = '';
  if (booking.services && booking.services.length > 0) {
    booking.services.forEach(svc => {
      servicesRow += `
        <tr>
          <td>
            <div class="item-desc">
              <span class="item-title">Dịch vụ: ${svc.title || svc}</span>
              <span class="item-subtitle">Dịch vụ đi kèm đặt phòng</span>
            </div>
          </td>
          <td class="item-price" style="color: var(--text); font-weight: 500;">Đi kèm</td>
        </tr>
      `;
    });
  }

  if (discountAmount > 0) {
    const voucherName = booking.voucherTitle || booking.voucherCode || 'Ưu đãi áp dụng';
    servicesRow += `
      <tr>
        <td>
          <div class="item-desc">
            <span class="item-title" style="color: var(--success-text);">Mã ưu đãi (${voucherName})</span>
            <span class="item-subtitle">Giảm trừ trực tiếp từ voucher ưu đãi</span>
          </div>
        </td>
        <td class="item-price text-right" style="color: var(--success-text); font-weight: 700;">-${Number(discountAmount).toLocaleString('vi-VN')} đ</td>
      </tr>
    `;
  }

  let voucherRow = '';
  if (discountAmount > 0) {
    const voucherName = booking.voucherTitle || (booking.voucherCode ? `Mã: ${booking.voucherCode}` : 'Ưu đãi');
    voucherRow = `
      <div class="summary-row discount-row">
        <span class="summary-label">Ưu đãi (${voucherName}):</span>
        <span class="summary-val">-${Number(discountAmount).toLocaleString('vi-VN')} đ</span>
      </div>
    `;
  }

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>Hóa đơn DieuBel - ${booking.id}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0f172a;
      --primary-light: #334155;
      --accent: #b89253;
      --accent-hover: #9f7d43;
      --accent-light: #fbf8f3;
      --bg: #f8fafc;
      --surface: #ffffff;
      --text: #475569;
      --text-dark: #0f172a;
      --border: #e2e8f0;
      
      --success-bg: #ecfdf5;
      --success-text: #059669;
      --success-border: #a7f3d0;
      
      --warning-bg: #fffbeb;
      --warning-text: #d97706;
      --warning-border: #fde68a;
      
      --danger-bg: #fef2f2;
      --danger-text: #dc2626;
      --danger-border: #fecaca;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: var(--text);
      background-color: var(--bg);
      line-height: 1.6;
      padding: 40px 20px;
    }

    .invoice-wrapper {
      max-width: 850px;
      margin: 0 auto;
      background: var(--surface);
      border-radius: 24px;
      box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 0 1px 0 rgba(15, 23, 42, 0.1);
      border: 1px solid var(--border);
      position: relative;
      overflow: hidden;
    }

    /* Print styling */
    @media print {
      body {
        background: none;
        padding: 0;
      }
      .invoice-wrapper {
        box-shadow: none;
        border: none;
        border-radius: 0;
      }
      .no-print {
        display: none !important;
      }
    }

    /* Elegant Top Bar */
    .top-decorative-bar {
      height: 6px;
      background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 50%, var(--primary) 100%);
    }

    /* Action Buttons Header */
    .actions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 40px 0;
    }

    .action-btn-group {
      display: flex;
      gap: 12px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid var(--border);
    }

    .btn-primary {
      background-color: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .btn-primary:hover {
      background-color: var(--primary-light);
      border-color: var(--primary-light);
    }

    .btn-outline {
      background-color: transparent;
      color: var(--text-dark);
    }

    .btn-outline:hover {
      background-color: rgba(15, 23, 42, 0.03);
      border-color: var(--primary);
    }

    /* Invoice Content */
    .invoice-content {
      padding: 40px;
    }

    /* Brand Section */
    .brand-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 30px;
    }

    .brand-logo-container {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: 0.5px;
      line-height: 1;
    }

    .brand-tagline {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--accent);
      font-weight: 700;
      margin-top: 6px;
    }

    .invoice-meta-top {
      text-align: right;
    }

    .invoice-badge-title {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      color: var(--text-dark);
    }

    .invoice-number-tag {
      font-size: 14px;
      color: var(--text);
      margin-top: 4px;
    }

    .invoice-number-tag strong {
      color: var(--text-dark);
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }

    .info-card {
      background-color: var(--accent-light);
      border: 1px solid rgba(184, 146, 83, 0.15);
      border-radius: 16px;
      padding: 24px;
    }

    .card-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--accent);
      margin-bottom: 12px;
      border-bottom: 1px dashed rgba(184, 146, 83, 0.25);
      padding-bottom: 8px;
    }

    .info-row {
      display: flex;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .info-label {
      width: 120px;
      flex-shrink: 0;
      color: var(--text);
      font-weight: 500;
    }

    .info-val {
      font-weight: 700;
      color: var(--text-dark);
    }

    /* Detailed Table styling */
    .bill-table-wrapper {
      margin-bottom: 35px;
    }

    .table-title {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 15px;
    }

    .bill-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .bill-table th {
      padding: 14px 18px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text);
      border-bottom: 2px solid var(--primary);
      background-color: #fcfcfc;
    }

    .bill-table td {
      padding: 16px 18px;
      font-size: 14px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }

    .item-desc {
      display: flex;
      flex-direction: column;
    }

    .item-title {
      font-weight: 700;
      color: var(--text-dark);
      font-size: 15px;
    }

    .item-subtitle {
      font-size: 12px;
      color: var(--text);
      margin-top: 4px;
    }

    .item-price {
      font-weight: 700;
      color: var(--text-dark);
      text-align: right;
    }

    .text-right {
      text-align: right;
    }

    /* Billing Summary Section */
    .billing-summary-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 40px;
      margin-bottom: 40px;
    }

    .payment-notes {
      flex: 1;
      max-width: 400px;
    }

    .notes-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-dark);
      margin-bottom: 8px;
    }

    .notes-text {
      font-size: 13px;
      color: var(--text);
      line-height: 1.5;
    }

    .summary-card {
      width: 340px;
      background-color: #fafbfd;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
      margin-left: auto;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .summary-row:last-child {
      margin-bottom: 0;
    }

    .summary-row.total-price {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid var(--border);
      font-size: 16px;
      font-weight: 800;
      color: var(--text-dark);
    }

    .summary-row.total-final {
      margin-top: 10px;
      padding-top: 12px;
      border-top: 2px solid var(--primary);
      font-size: 18px;
      font-weight: 900;
      color: var(--primary);
    }

    .summary-label {
      color: var(--text);
    }

    .summary-val {
      font-weight: 700;
      color: var(--text-dark);
    }

    .summary-row.total-final .summary-val {
      color: var(--primary);
      font-size: 20px;
    }

    .summary-row.discount-row {
      color: var(--success-text);
    }
    
    .summary-row.discount-row .summary-val {
      color: var(--success-text);
    }

    .remaining-box {
      margin-top: 15px;
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 700;
      border: 1px solid;
    }
    
    .remaining-box.paid {
      background-color: var(--success-bg);
      border-color: var(--success-border);
      color: var(--success-text);
    }

    .remaining-box.unpaid {
      background-color: var(--danger-bg);
      border-color: var(--danger-border);
      color: var(--danger-text);
    }

    /* Badges */
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid;
    }

    .badge-paid {
      background-color: var(--success-bg);
      color: var(--success-text);
      border-color: var(--success-border);
    }

    .badge-deposit {
      background-color: var(--warning-bg);
      color: var(--warning-text);
      border-color: var(--warning-border);
    }

    .badge-unpaid {
      background-color: var(--danger-bg);
      color: var(--danger-text);
      border-color: var(--danger-border);
    }
    
    .badge-refunded {
      background-color: #f1f5f9;
      color: #475569;
      border-color: #cbd5e1;
    }

    /* Authentic Stamp */
    .stamp-container {
      position: absolute;
      top: 110px;
      right: 50px;
      transform: rotate(-12deg);
      opacity: 0.85;
      pointer-events: none;
      z-index: 10;
    }

    .stamp {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 3px double;
      text-transform: uppercase;
      font-weight: 900;
      text-align: center;
      font-size: 10px;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }

    .stamp-paid {
      color: var(--success-text);
      border-color: var(--success-text);
      background-color: rgba(5, 150, 105, 0.02);
    }

    .stamp-deposit {
      color: var(--warning-text);
      border-color: var(--warning-text);
      background-color: rgba(217, 119, 6, 0.02);
    }

    .stamp-unpaid {
      color: var(--danger-text);
      border-color: var(--danger-text);
      background-color: rgba(220, 38, 38, 0.02);
    }
    
    .stamp-refunded {
      color: #475569;
      border-color: #475569;
      background-color: rgba(71, 85, 105, 0.02);
    }

    .stamp-inner {
      border-top: 1px solid;
      border-bottom: 1px solid;
      padding: 2px 8px;
      margin: 4px 0;
      font-size: 12px;
      font-weight: 900;
    }

    /* Footer decoration */
    .invoice-footer {
      background-color: var(--accent-light);
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid rgba(184, 146, 83, 0.15);
      font-size: 13px;
      color: var(--text-dark);
      position: relative;
    }

    .footer-thanks {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-style: italic;
      font-weight: 600;
      color: var(--accent);
      margin-bottom: 8px;
    }

    .footer-contacts {
      font-size: 12px;
      color: var(--text);
      margin-top: 10px;
      display: flex;
      justify-content: center;
      gap: 20px;
    }

    .footer-contacts span strong {
      color: var(--text-dark);
    }
  </style>
</head>
<body>

<div class="invoice-wrapper">
  <div class="top-decorative-bar"></div>
  
  <!-- Print/Action Header -->
  <div class="actions-header no-print">
    <div style="font-size: 12px; color: var(--text); font-weight: 500;">
      Hóa đơn điện tử chính thức · StayNest DieuBel
    </div>
    <div class="action-btn-group">
      <button class="btn btn-outline" onclick="window.print()">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
        In hóa đơn
      </button>
      <button class="btn btn-primary" onclick="window.close()">
        Đóng tab
      </button>
    </div>
  </div>

  <div class="invoice-content">
    <!-- Stamp -->
    <div class="stamp-container">
      <div class="stamp ${stampClass}">
        <span>DieuBel</span>
        <div class="stamp-inner">${stampText}</div>
        <span>StayNest</span>
      </div>
    </div>

    <!-- Brand Header -->
    <div class="brand-section">
      <div class="brand-logo-container">
        <span class="brand-name">DieuBel</span>
        <span class="brand-tagline">Premium Boutique Hotel</span>
        <div style="font-size: 12px; color: var(--text); margin-top: 15px; line-height: 1.4;">
          12 Tôn Đức Thắng, Quận 1, TP. Hồ Chí Minh<br>
          Hotline: 034 558 3772 · Email: support@dieubel.vn
        </div>
      </div>
      
      <div class="invoice-meta-top">
        <span class="invoice-badge-title">Hóa Đơn</span>
        <div class="invoice-number-tag" style="margin-top: 10px;">
          Mã đặt phòng: <strong>${booking.id}</strong>
        </div>
        <div class="invoice-number-tag">
          Mã giao dịch: <strong>${booking.paymentCode || booking.booking_code || 'Chưa thanh toán'}</strong>
        </div>
        <div class="invoice-number-tag">
          Trạng thái: <span class="status-badge ${badgeClass}">${statusLabel}</span>
        </div>
      </div>
    </div>

    <!-- Info Grid -->
    <div class="info-grid">
      <!-- Guest Info -->
      <div class="info-card">
        <div class="card-title">Khách hàng</div>
        <div class="info-row">
          <span class="info-label">Họ tên</span>
          <span class="info-val">${booking.guestName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-val" style="word-break: break-all;">${booking.guestEmail}</span>
        </div>
        <div class="info-row">
          <span class="info-label">SĐT</span>
          <span class="info-val">${booking.guestPhone || 'Không có'}</span>
        </div>
      </div>

      <!-- Booking Info -->
      <div class="info-card">
        <div class="card-title">Thông tin lưu trú</div>
        <div class="info-row">
          <span class="info-label">Khách sạn</span>
          <span class="info-val">${booking.hotel_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Hạng phòng</span>
          <span class="info-val">${booking.room_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Nhận phòng</span>
          <span class="info-val">${dinhDangNgay(booking.checkIn)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Trả phòng</span>
          <span class="info-val">${dinhDangNgay(booking.checkOut)}</span>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="bill-table-wrapper">
      <div class="table-title">Chi Tiết Khoản Mục</div>
      <table class="bill-table">
        <thead>
          <tr>
            <th>Nội dung chi tiết</th>
            <th class="text-right" style="width: 180px;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="item-desc">
                <span class="item-title">Tiền phòng (Hạng: ${booking.room_name})</span>
                <span class="item-subtitle">Lưu trú từ ngày ${dinhDangNgay(booking.checkIn)} đến ${dinhDangNgay(booking.checkOut)}</span>
              </div>
            </td>
            <td class="item-price">${Number(originalTotalPrice).toLocaleString('vi-VN')} đ</td>
          </tr>
          ${servicesRow}
        </tbody>
      </table>
    </div>

    <!-- Billing Summary -->
    <div class="billing-summary-section">
      <div class="payment-notes">
        <div class="notes-title">Chính sách & Lưu ý</div>
        <div class="notes-text" style="margin-bottom: 10px;">
          • Quý khách vui lòng xuất trình mã QR nhận phòng hoặc hóa đơn này tại quầy lễ tân khi làm thủ tục check-in.<br>
          • Thời gian nhận phòng tiêu chuẩn: 14:00. Thời gian trả phòng tiêu chuẩn: 12:00.<br>
          • Dịch vụ phát sinh ngoài danh mục trên sẽ được thanh toán trực tiếp tại quầy lúc trả phòng.
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-row">
          <span class="summary-label">Giá gốc phòng:</span>
          <span class="summary-val">${Number(originalTotalPrice).toLocaleString('vi-VN')} đ</span>
        </div>
        
        ${voucherRow}

        <div class="summary-row total-price">
          <span class="summary-label">Cần thanh toán:</span>
          <span class="summary-val">${Number(booking.totalPrice || 0).toLocaleString('vi-VN')} đ</span>
        </div>

        <div class="summary-row">
          <span class="summary-label">Đã thanh toán:</span>
          <span class="summary-val" style="color: var(--success-text);">${Number(booking.paidAmount || 0).toLocaleString('vi-VN')} đ</span>
        </div>

        <div class="summary-row total-final">
          <span class="summary-label">Còn lại:</span>
          <span class="summary-val">${Number(booking.remainingAmount || 0).toLocaleString('vi-VN')} đ</span>
        </div>

        ${remainingBoxHtml}
      </div>
    </div>
  </div>

  <!-- Footer thanks -->
  <div class="invoice-footer">
    <div class="footer-thanks">Chân thành cảm ơn sự lựa chọn của Quý khách!</div>
    <div style="font-size: 13px; font-weight: 500;">Chúc Quý khách một kỳ nghỉ tuyệt vời và tràn đầy niềm vui tại DieuBel.</div>
    <div class="footer-contacts">
      <span>Hotline: <strong>034 558 3772</strong></span>
      <span>Email: <strong>support@dieubel.vn</strong></span>
      <span>Website: <strong>dieubel.staynest.vn</strong></span>
    </div>
  </div>
</div>

</body>
</html>`;
}
