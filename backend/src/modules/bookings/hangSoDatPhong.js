// Chức năng: Định nghĩa các hằng số về trạng thái đặt phòng, thanh toán, giải phóng phòng và tỷ lệ hủy phòng.
const TRANG_THAI_DAT_PHONG = {
  HOLDING: "holding",
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCEL_REQUESTED: "cancel_requested",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
  NO_SHOW: "no_show",
};

const TRANG_THAI_THANH_TOAN = {
  UNPAID: "unpaid",
  DEPOSIT_PAID: "deposit_paid",
  PAID: "paid",
};

const PHUONG_THUC_THANH_TOAN = {
  ONLINE_FULL: "online_full",
  COUNTER_DEPOSIT: "counter_deposit",
};

const TRANG_THAI_GIAI_PHONG = new Set([
  TRANG_THAI_DAT_PHONG.CHECKED_OUT,
  TRANG_THAI_DAT_PHONG.CANCELLED,
  TRANG_THAI_DAT_PHONG.EXPIRED,
  TRANG_THAI_DAT_PHONG.NO_SHOW,
]);

const TY_LE_PHI_HUY_HOAN_TIEN = 0.2;

module.exports = {
  TRANG_THAI_DAT_PHONG,
  TRANG_THAI_THANH_TOAN,
  PHUONG_THUC_THANH_TOAN,
  TRANG_THAI_GIAI_PHONG,
  TY_LE_PHI_HUY_HOAN_TIEN,
};
