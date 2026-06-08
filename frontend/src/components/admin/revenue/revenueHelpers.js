// Chức năng: Hàm tạo khoảng ngày và phân tích doanh thu.
// Helper xử lý mốc thời gian và dữ liệu biểu diễn cho trang doanh thu.
export function ymdToday() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function addDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00`);
  date.setDate(date.getDate() + days);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function firstDayOfMonth(dateText) {
  return `${dateText.slice(0, 8)}01`;
}

export function firstDayOfQuarter(dateText) {
  const month = parseInt(dateText.slice(5, 7), 10);
  const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;
  return `${dateText.slice(0, 5)}${String(quarterStartMonth).padStart(2, '0')}-01`;
}

export function firstDayOfYear(dateText) {
  return `${dateText.slice(0, 4)}-01-01`;
}

export function buildRange(preset) {
  const today = ymdToday();

  if (preset === 'today') {
    return { dateFrom: today, dateTo: today };
  }

  if (preset === 'week') {
    return { dateFrom: addDays(today, -6), dateTo: today };
  }

  if (preset === 'month') {
    return { dateFrom: firstDayOfMonth(today), dateTo: today };
  }

  if (preset === 'quarter') {
    return { dateFrom: firstDayOfQuarter(today), dateTo: today };
  }

  if (preset === 'year') {
    return { dateFrom: firstDayOfYear(today), dateTo: today };
  }

  // 'all' — toàn bộ lịch sử, dùng ngày đặt phòng sớm nhất có thể
  if (preset === 'all') {
    return { dateFrom: '2020-01-01', dateTo: today };
  }

  return { dateFrom: today, dateTo: today };
}

// Màu ngữ nghĩa cho từng dòng trong bảng phân tích dòng tiền.
// 'positive' = thu vào | 'negative' = trừ ra/rủi ro | 'amber' = trung tính/chờ | 'highlight' = kết quả cuối
export const BREAKDOWN_COLOR_MAP = {
  positive: { bar: 'bg-emerald-500', value: 'text-emerald-700' },
  negative: { bar: 'bg-rose-400',    value: 'text-rose-700'    },
  amber:    { bar: 'bg-amber-400',   value: 'text-amber-700'   },
  neutral:  { bar: 'bg-slate-300',   value: 'text-slate-600'   },
  highlight:{ bar: 'bg-brand-600',   value: 'text-brand-700'   },
};

export function taoPhanTichTrongKy(period = {}) {
  return [
    // [label, value, colorType]
    ['Giá trị đơn gốc',          period.grossRevenue       || 0, 'neutral'  ],
    ['Giảm giá voucher',          period.voucherDiscount    || 0, 'negative' ],
    ['Khách đã thanh toán',       period.customerPaidAmount || 0, 'positive' ],
    ['Đã hoàn tiền',              period.refundAmount       || 0, 'negative' ],
    ['Phí hủy giữ lại',           period.cancelFeeRevenue   || 0, 'amber'    ],
    ['Doanh thu ròng',            period.netRevenue         || 0, 'highlight'],
    ['Còn phải thu hiệu lực',     period.receivableAmount   || 0, 'amber'    ],
  ];
}
