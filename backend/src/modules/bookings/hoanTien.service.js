// Chức năng: Nghiệp vụ tạo, duyệt, từ chối yêu cầu hoàn tiền cho đơn đặt phòng.
// Tách từ quanLyDatPhong.service.js để giảm độ phức tạp của file gốc.
const ketNoiDb = require("../../config/coSoDuLieu");
const { damBaoCauTrucVanHanh } = require("../system/cauTrucVanHanh.service");
const {
  TRANG_THAI_DAT_PHONG,
  TRANG_THAI_THANH_TOAN,
  TRANG_THAI_GIAI_PHONG,
  TY_LE_PHI_HUY_HOAN_TIEN,
} = require("./hangSoDatPhong");

// ─── Hàm tiện ích nội bộ ─────────────────────────────────────────────────────

function taoLoi(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function taoMaYeuCau(prefix) {
  return `${prefix}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Date.now()).slice(-6)}`;
}

function tinhChinhSachHoanTien(paidAmount) {
  const safePaidAmount = Math.max(0, Number(paidAmount || 0));
  const cancelFeeAmount = Math.round(safePaidAmount * TY_LE_PHI_HUY_HOAN_TIEN);

  return {
    paidAmount: safePaidAmount,
    cancelFeeAmount,
    refundAmount: Math.max(0, safePaidAmount - cancelFeeAmount),
  };
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

function mapYeuCauHoanTien(row) {
  return {
    id: row.id,
    code: row.refund_code,
    bookingId: row.booking_code,
    hotelName: row.hotel_name,
    roomName: row.room_name,
    guestName: row.full_name,
    guestEmail: row.user_email,
    paidAmount: Number(row.paid_amount || 0),
    cancelFeeAmount: Number(row.cancel_fee_amount || 0),
    refundAmount: Number(row.refund_amount || 0),
    bankName: row.bank_name,
    bankAccountName: row.bank_account_name,
    bankAccountNumber: row.bank_account_number,
    phone: row.phone,
    email: row.email,
    reason: row.reason,
    status: row.status,
    adminNote: row.admin_note,
    requestedAt: row.requested_at,
    approvedAt: row.approved_at,
    completedAt: row.completed_at,
    checkIn: row.check_in_date,
    checkOut: row.check_out_date,
  };
}

// ─── Query SELECT chung cho hoàn tiền ────────────────────────────────────────

const SELECT_HOAN_TIEN = `
  SELECT
    rr.*,
    b.booking_code,
    DATE_FORMAT(b.check_in_date, '%Y-%m-%d') AS check_in_date,
    DATE_FORMAT(b.check_out_date, '%Y-%m-%d') AS check_out_date,
    r.hotel_name,
    r.room_name,
    u.full_name,
    u.email AS user_email
  FROM refund_requests rr
  JOIN bookings b ON b.id = rr.booking_id
  JOIN rooms r ON r.id = b.room_id
  JOIN users u ON u.id = rr.user_id
`;

// ─── Service functions ───────────────────────────────────────────────────────

async function taoYeuCauHoanTien({ user, bookingCode, payload }) {
  await damBaoCauTrucVanHanh();

  const connection = await ketNoiDb.getConnection();

  try {
    await connection.beginTransaction();
    const [bookings] = await connection.query(
      `SELECT *
       FROM bookings
       WHERE (booking_code = ? OR id = ?) AND user_id = ?
       LIMIT 1
       FOR UPDATE`,
      [bookingCode, Number(bookingCode) || 0, user.id],
    );

    if (!bookings.length)
      throw taoLoi(404, "Khong tim thay don dat phong cua ban.");

    const booking = bookings[0];
    if (
      [
        TRANG_THAI_DAT_PHONG.CANCELLED,
        TRANG_THAI_DAT_PHONG.CHECKED_OUT,
        TRANG_THAI_DAT_PHONG.NO_SHOW,
      ].includes(booking.booking_status)
    ) {
      throw taoLoi(
        400,
        "Don nay da ket thuc, khong the tao yeu cau hoan tien.",
      );
    }

    if (
      booking.booking_status === TRANG_THAI_DAT_PHONG.CHECKED_IN &&
      booking.frontdesk_verified_at
    ) {
      throw taoLoi(
        400,
        "Don da duoc xac minh nhan phong, vui long lien he ho tro neu can thay doi luu tru.",
      );
    }

    const coTheHuyHoanTien =
      booking.booking_status === TRANG_THAI_DAT_PHONG.CONFIRMED ||
      (booking.booking_status === TRANG_THAI_DAT_PHONG.CHECKED_IN &&
        !booking.frontdesk_verified_at);

    if (!coTheHuyHoanTien) {
      throw taoLoi(
        400,
        "Chi co the tao yeu cau huy/hoan tien cho don da xac nhan hoac da mo nhan phong nhung chua xac minh.",
      );
    }

    if (booking.booking_status === TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED) {
      throw taoLoi(
        400,
        "Don nay dang co yeu cau huy/hoan tien cho admin xu ly.",
      );
    }

    if (
      booking.payment_status === TRANG_THAI_THANH_TOAN.UNPAID ||
      Number(booking.paid_amount || 0) <= 0
    ) {
      throw taoLoi(
        400,
        "Don chua thanh toan co the huy giu cho truc tiep, khong can yeu cau hoan tien.",
      );
    }

    const [existing] = await connection.query(
      "SELECT id FROM refund_requests WHERE booking_id = ? LIMIT 1",
      [booking.id],
    );

    if (existing.length) throw taoLoi(400, "Don nay da co yeu cau hoan tien.");

    const { paidAmount, cancelFeeAmount, refundAmount } = tinhChinhSachHoanTien(
      booking.paid_amount,
    );
    const refundCode = taoMaYeuCau("RF");

    await connection.query(
      `INSERT INTO refund_requests (
        refund_code,
        booking_id,
        user_id,
        paid_amount,
        cancel_fee_amount,
        refund_amount,
        bank_name,
        bank_account_name,
        bank_account_number,
        phone,
        email,
        reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        refundCode,
        booking.id,
        user.id,
        paidAmount,
        cancelFeeAmount,
        refundAmount,
        String(payload.bankName || "").trim(),
        String(payload.bankAccountName || "").trim(),
        String(payload.bankAccountNumber || "").trim(),
        String(payload.phone || "").trim(),
        String(payload.email || user.email || "").trim(),
        String(payload.reason || "").trim(),
      ],
    );

    await connection.query(
      `UPDATE bookings
       SET booking_status = ?,
           cancel_reason = ?
       WHERE id = ?`,
      [
        TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED,
        String(payload.reason || "Khach yeu cau huy/hoan tien").trim(),
        booking.id,
      ],
    );

    await connection.query(
      `INSERT INTO booking_status_logs (booking_id, old_status, new_status, note, changed_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        booking.id,
        booking.booking_status,
        TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED,
        "Khach tao yeu cau huy/hoan tien",
        user.id,
      ],
    );

    await connection.commit();
    return layYeuCauHoanTienCuaToi(user.id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function layYeuCauHoanTienCuaToi(userId) {
  await damBaoCauTrucVanHanh();

  const [rows] = await ketNoiDb.query(
    `${SELECT_HOAN_TIEN}
     WHERE rr.user_id = ?
     ORDER BY rr.requested_at DESC`,
    [userId],
  );

  return rows.map(mapYeuCauHoanTien);
}

async function layTatCaYeuCauHoanTien() {
  await damBaoCauTrucVanHanh();

  const [rows] = await ketNoiDb.query(
    `${SELECT_HOAN_TIEN}
     ORDER BY rr.requested_at DESC`,
  );

  return rows.map(mapYeuCauHoanTien);
}

async function capNhatYeuCauHoanTien({
  refundId,
  status,
  adminId,
  note = null,
}) {
  await damBaoCauTrucVanHanh();

  const connection = await ketNoiDb.getConnection();

  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT rr.*, b.booking_status, b.payment_status, b.rooms_count, b.room_id, b.id AS booking_id
       FROM refund_requests rr
       JOIN bookings b ON b.id = rr.booking_id
       WHERE rr.id = ?
       LIMIT 1
       FOR UPDATE`,
      [refundId],
    );

    if (!rows.length) throw taoLoi(404, "Khong tim thay yeu cau hoan tien.");
    const refund = rows[0];

    if (["completed", "rejected"].includes(refund.status)) {
      throw taoLoi(409, "Yeu cau hoan tien nay da ket thuc, khong the cap nhat tiep.");
    }

    if (refund.status === "approved" && status !== "completed") {
      throw taoLoi(409, "Yeu cau da duoc duyet chi co the chuyen sang da hoan tat.");
    }

    if (status === "rejected") {
      await connection.query(
        `UPDATE refund_requests
         SET status = 'rejected', admin_note = ?, processed_by = ?
         WHERE id = ?`,
        [note, adminId, refund.id],
      );
      await connection.query(
        `UPDATE bookings
         SET booking_status = 'confirmed'
         WHERE id = ? AND booking_status = ?`,
        [refund.booking_id, TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED],
      );
      await connection.query(
        `INSERT INTO booking_status_logs (booking_id, old_status, new_status, note, changed_by)
         VALUES (?, ?, 'confirmed', ?, ?)`,
        [
          refund.booking_id,
          TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED,
          note || "Admin tu choi yeu cau hoan tien",
          adminId,
        ],
      );
    } else if (["approved", "completed"].includes(status)) {
      const nextRefundStatus = status;
      await connection.query(
        `UPDATE refund_requests
         SET status = ?,
             admin_note = ?,
             processed_by = ?,
             approved_at = COALESCE(approved_at, NOW()),
             completed_at = CASE WHEN ? = 'completed' THEN NOW() ELSE completed_at END
         WHERE id = ?`,
        [nextRefundStatus, note, adminId, nextRefundStatus, refund.id],
      );

      if (!TRANG_THAI_GIAI_PHONG.has(refund.booking_status)) {
        await connection.query(
          `UPDATE rooms
           SET inventory_count = inventory_count + ?
           WHERE id = ?`,
          [Number(refund.rooms_count || 1), refund.room_id],
        );
      }

      await connection.query(
        `UPDATE bookings
         SET booking_status = 'cancelled',
             payment_status = 'refunded',
             remaining_amount = 0,
             cancelled_at = COALESCE(cancelled_at, NOW()),
             cancel_reason = COALESCE(cancel_reason, 'Admin duyet huy/hoan tien')
         WHERE id = ?`,
        [refund.booking_id],
      );
      await connection.query(
        `INSERT INTO booking_status_logs (booking_id, old_status, new_status, note, changed_by)
         VALUES (?, ?, 'cancelled', ?, ?)`,
        [
          refund.booking_id,
          refund.booking_status,
          note || "Admin duyet huy/hoan tien",
          adminId,
        ],
      );
    } else {
      throw taoLoi(400, "Trang thai yeu cau hoan tien khong hop le.");
    }

    await connection.commit();
    return layTatCaYeuCauHoanTien();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  taoYeuCauHoanTien,
  layYeuCauHoanTienCuaToi,
  layTatCaYeuCauHoanTien,
  capNhatYeuCauHoanTien,
};
