// Chức năng: Nghiệp vụ thống kê và báo cáo doanh thu khách sạn (theo kỳ và tổng).
// Tách từ quanLyDatPhong.service.js để giảm độ phức tạp của file gốc.
const ketNoiDb = require("../../config/coSoDuLieu");
const { damBaoCauTrucVanHanh } = require("../system/cauTrucVanHanh.service");

// ─── Hàm tiện ích ────────────────────────────────────────────────────────────

function chuanHoaNgayBaoCao(value, fallback) {
  if (!value) return fallback;
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return fallback;
  return text;
}

// ─── Service function ────────────────────────────────────────────────────────

async function layBaoCaoDoanhThu({ dateFrom, dateTo } = {}) {
  await damBaoCauTrucVanHanh();

  const today = new Date().toISOString().slice(0, 10);
  const safeDateFrom = chuanHoaNgayBaoCao(dateFrom, today);
  const safeDateTo = chuanHoaNgayBaoCao(dateTo, today);
  const rangeStart = safeDateFrom <= safeDateTo ? safeDateFrom : safeDateTo;
  const rangeEnd = safeDateFrom <= safeDateTo ? safeDateTo : safeDateFrom;

  const [[periodBookingStats]] = await ketNoiDb.query(
    `SELECT
       COUNT(CASE WHEN booked_at >= ? AND booked_at < DATE_ADD(?, INTERVAL 1 DAY) THEN 1 END) AS total_bookings,
       SUM(CASE WHEN booked_at >= ? AND booked_at < DATE_ADD(?, INTERVAL 1 DAY) AND booking_status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings,
       SUM(CASE WHEN booked_at >= ? AND booked_at < DATE_ADD(?, INTERVAL 1 DAY) AND booking_status = 'no_show' THEN 1 ELSE 0 END) AS no_show_bookings,
       SUM(CASE WHEN paid_at >= ? AND paid_at < DATE_ADD(?, INTERVAL 1 DAY) AND payment_status IN ('paid', 'deposit_paid', 'refunded') THEN COALESCE(original_total_price, total_price, 0) ELSE 0 END) AS gross_revenue,
       SUM(CASE WHEN paid_at >= ? AND paid_at < DATE_ADD(?, INTERVAL 1 DAY) AND payment_status IN ('paid', 'deposit_paid', 'refunded') THEN COALESCE(discount_amount, 0) ELSE 0 END) AS voucher_discount,
       SUM(CASE WHEN paid_at >= ? AND paid_at < DATE_ADD(?, INTERVAL 1 DAY) AND payment_status IN ('paid', 'deposit_paid', 'refunded') THEN COALESCE(paid_amount, 0) ELSE 0 END) AS customer_paid_amount,
       SUM(CASE WHEN paid_at >= ? AND paid_at < DATE_ADD(?, INTERVAL 1 DAY) AND payment_status IN ('paid', 'deposit_paid') THEN COALESCE(paid_amount, 0) ELSE 0 END) AS paid_revenue,
       SUM(CASE WHEN booked_at >= ? AND booked_at < DATE_ADD(?, INTERVAL 1 DAY) AND booking_status NOT IN ('cancelled', 'expired', 'no_show') THEN COALESCE(remaining_amount, 0) ELSE 0 END) AS receivable_amount
     FROM bookings`,
    [
      rangeStart,
      rangeEnd,
      rangeStart,
      rangeEnd,
      rangeStart,
      rangeEnd,
      rangeStart,
      rangeEnd,
      rangeStart,
      rangeEnd,
      rangeStart,
      rangeEnd,
      rangeStart,
      rangeEnd,
      rangeStart,
      rangeEnd,
    ],
  );

  const [[bookingStats]] = await ketNoiDb.query(
    `SELECT
       COUNT(*) AS total_bookings,
       SUM(CASE WHEN booking_status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings,
       SUM(CASE WHEN booking_status = 'no_show' THEN 1 ELSE 0 END) AS no_show_bookings,
       SUM(CASE WHEN payment_status IN ('paid', 'deposit_paid', 'refunded') THEN COALESCE(original_total_price, total_price, 0) ELSE 0 END) AS gross_revenue,
       SUM(CASE WHEN payment_status IN ('paid', 'deposit_paid', 'refunded') THEN COALESCE(discount_amount, 0) ELSE 0 END) AS voucher_discount,
       SUM(CASE WHEN payment_status IN ('paid', 'deposit_paid', 'refunded') THEN COALESCE(paid_amount, 0) ELSE 0 END) AS customer_paid_amount,
       SUM(CASE WHEN payment_status IN ('paid', 'deposit_paid') THEN COALESCE(paid_amount, 0) ELSE 0 END) AS paid_revenue,
       SUM(CASE WHEN booking_status NOT IN ('cancelled', 'expired', 'no_show') THEN COALESCE(remaining_amount, 0) ELSE 0 END) AS receivable_amount
     FROM bookings`,
  );
  const [[refundStats]] = await ketNoiDb.query(
    `SELECT
       COUNT(*) AS refund_requests,
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_refunds,
       COALESCE(SUM(CASE WHEN status = 'pending' THEN refund_amount ELSE 0 END), 0) AS pending_refund_amount,
       SUM(CASE WHEN status IN ('approved', 'completed') THEN COALESCE(cancel_fee_amount, 0) ELSE 0 END) AS cancel_fee_revenue,
       SUM(CASE WHEN status IN ('approved', 'completed') THEN COALESCE(refund_amount, 0) ELSE 0 END) AS refund_amount
     FROM refund_requests`,
  );
  const [[roomStats]] = await ketNoiDb.query(
    `SELECT
       SUM(inventory_count) AS available_rooms,
       COUNT(*) AS room_types
     FROM rooms
     WHERE is_active = TRUE`,
  );

  const [[periodRefundStats]] = await ketNoiDb.query(
    `SELECT
       COUNT(CASE WHEN requested_at >= ? AND requested_at < DATE_ADD(?, INTERVAL 1 DAY) THEN 1 END) AS refund_requests,
       SUM(CASE WHEN requested_at >= ? AND requested_at < DATE_ADD(?, INTERVAL 1 DAY) AND status = 'pending' THEN 1 ELSE 0 END) AS pending_refunds,
       SUM(CASE WHEN requested_at >= ? AND requested_at < DATE_ADD(?, INTERVAL 1 DAY) AND status = 'pending' THEN COALESCE(refund_amount, 0) ELSE 0 END) AS pending_refund_amount,
       SUM(CASE WHEN requested_at >= ? AND requested_at < DATE_ADD(?, INTERVAL 1 DAY) AND status IN ('approved', 'completed') THEN COALESCE(cancel_fee_amount, 0) ELSE 0 END) AS cancel_fee_revenue,
       SUM(CASE WHEN requested_at >= ? AND requested_at < DATE_ADD(?, INTERVAL 1 DAY) AND status IN ('approved', 'completed') THEN COALESCE(refund_amount, 0) ELSE 0 END) AS refund_amount
     FROM refund_requests`,
    [
      rangeStart,
      rangeEnd,
      rangeStart,
      rangeEnd,
      rangeStart,
      rangeEnd,
      rangeStart,
      rangeEnd,
      rangeStart,
      rangeEnd,
    ],
  );

  const periodCustomerPaid = Number(
    periodBookingStats.customer_paid_amount || 0,
  );
  const lifetimeCustomerPaid = Number(bookingStats.customer_paid_amount || 0);
  const periodRefundAmount = Number(periodRefundStats.refund_amount || 0);
  const lifetimeRefundAmount = Number(refundStats.refund_amount || 0);

  return {
    period: {
      dateFrom: rangeStart,
      dateTo: rangeEnd,
      totalBookings: Number(periodBookingStats.total_bookings || 0),
      cancelledBookings: Number(periodBookingStats.cancelled_bookings || 0),
      noShowBookings: Number(periodBookingStats.no_show_bookings || 0),
      grossRevenue: Number(periodBookingStats.gross_revenue || 0),
      voucherDiscount: Number(periodBookingStats.voucher_discount || 0),
      paidRevenue: Number(periodBookingStats.paid_revenue || 0),
      customerPaidAmount: periodCustomerPaid,
      netRevenue: periodCustomerPaid - periodRefundAmount,
      receivableAmount: Number(periodBookingStats.receivable_amount || 0),
      refundRequests: Number(periodRefundStats.refund_requests || 0),
      pendingRefunds: Number(periodRefundStats.pending_refunds || 0),
      pendingRefundAmount: Number(periodRefundStats.pending_refund_amount || 0),
      cancelFeeRevenue: Number(periodRefundStats.cancel_fee_revenue || 0),
      refundAmount: periodRefundAmount,
    },
    lifetime: {
      totalBookings: Number(bookingStats.total_bookings || 0),
      cancelledBookings: Number(bookingStats.cancelled_bookings || 0),
      noShowBookings: Number(bookingStats.no_show_bookings || 0),
      grossRevenue: Number(bookingStats.gross_revenue || 0),
      voucherDiscount: Number(bookingStats.voucher_discount || 0),
      paidRevenue: Number(bookingStats.paid_revenue || 0),
      customerPaidAmount: lifetimeCustomerPaid,
      netRevenue: lifetimeCustomerPaid - lifetimeRefundAmount,
      receivableAmount: Number(bookingStats.receivable_amount || 0),
      refundRequests: Number(refundStats.refund_requests || 0),
      pendingRefunds: Number(refundStats.pending_refunds || 0),
      pendingRefundAmount: Number(refundStats.pending_refund_amount || 0),
      cancelFeeRevenue: Number(refundStats.cancel_fee_revenue || 0),
      refundAmount: lifetimeRefundAmount,
    },
    inventory: {
      availableRooms: Number(roomStats.available_rooms || 0),
      roomTypes: Number(roomStats.room_types || 0),
    },
  };
}

module.exports = {
  layBaoCaoDoanhThu,
};
