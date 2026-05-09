const ketNoiDb = require('../config/coSoDuLieu');

const TRANG_THAI_DAT_PHONG = {
  HOLDING: 'holding',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

const TRANG_THAI_THANH_TOAN = {
  UNPAID: 'unpaid',
  DEPOSIT_PAID: 'deposit_paid',
  PAID: 'paid',
};

const PHUONG_THUC_THANH_TOAN = {
  ONLINE_FULL: 'online_full',
  COUNTER_DEPOSIT: 'counter_deposit',
};

function taoLoi(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function tachMangJson(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function taoMaQr(bookingCode) {
  return `CHECKIN-${bookingCode}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function taoMaGiaoDich(bookingCode) {
  return `PAY-${String(bookingCode).replace(/[^a-zA-Z0-9]/g, '')}-${String(Date.now()).slice(-6)}`;
}

function mapBooking(row) {
  const feedbacks = tachMangJson(row.customer_feedbacks_json);
  const latestCustomerFeedback = feedbacks[0] || null;

  return {
    id: row.booking_code,
    databaseId: row.id,
    userId: row.user_id,
    guestName: row.full_name,
    guestEmail: row.email,
    roomId: row.room_id,
    hotel_name: row.hotel_name,
    room_name: row.room_name,
    city: row.city,
    address: row.address,
    image_url: row.image_url,
    price_per_night: Number(row.price_per_night || row.room_price || 0),
    originalTotalPrice: Number(row.original_total_price || row.total_price || 0),
    discountAmount: Number(row.discount_amount || 0),
    totalPrice: Number(row.total_price || 0),
    depositAmount: Number(row.deposit_amount || Math.ceil(Number(row.total_price || 0) * 0.1)),
    paidAmount: Number(row.paid_amount || 0),
    remainingAmount: Number(row.remaining_amount || 0),
    nights: Number(row.nights || 0),
    bookingType: row.booking_type || 'overnight',
    guests: row.guests,
    rooms: row.rooms_count,
    services: [],
    checkIn: row.check_in_date,
    checkOut: row.check_out_date,
    bookingStatus: row.booking_status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    paymentCode: row.payment_code,
    transferContent: row.transfer_content,
    voucherCode: row.voucher_code,
    qrToken: row.checkin_qr_token,
    paymentDeadline: row.payment_deadline,
    createdAt: row.booked_at,
    confirmedAt: row.confirmed_at,
    paidAt: row.paid_at,
    checkedInAt: row.checked_in_at,
    checkedOutAt: row.checked_out_at,
    cancelledAt: row.cancelled_at,
    cancelReason: row.cancel_reason,
    adminNote: row.admin_note,
    latestCustomerFeedback,
    customerFeedbacks: feedbacks,
  };
}

const SELECT_BOOKINGS = `
  SELECT
    b.*,
    DATE_FORMAT(b.check_in_date, '%Y-%m-%d') AS check_in_date,
    DATE_FORMAT(b.check_out_date, '%Y-%m-%d') AS check_out_date,
    u.full_name,
    u.email,
    r.hotel_name,
    r.room_name,
    r.city,
    r.address,
    r.image_url,
    r.price_per_night,
    COALESCE(
      JSON_ARRAYAGG(
        CASE
          WHEN cf.id IS NULL THEN NULL
          ELSE JSON_OBJECT(
            'id', cf.feedback_code,
            'type', cf.feedback_type,
            'title', cf.title,
            'content', cf.content,
            'status', cf.status,
            'adminReply', cf.admin_reply,
            'createdAt', cf.created_at
          )
        END
      ),
      JSON_ARRAY()
    ) AS customer_feedbacks_json
  FROM bookings b
  JOIN users u ON u.id = b.user_id
  JOIN rooms r ON r.id = b.room_id
  LEFT JOIN customer_feedbacks cf ON cf.booking_id = b.id
`;

async function layDatPhongCuaNguoiDung(userId) {
  const [rows] = await ketNoiDb.query(
    `${SELECT_BOOKINGS}
     WHERE b.user_id = ?
     GROUP BY b.id
     ORDER BY b.booked_at DESC`,
    [userId],
  );

  return rows.map(mapBooking);
}

async function layTatCaDatPhong() {
  const [rows] = await ketNoiDb.query(
    `${SELECT_BOOKINGS}
     GROUP BY b.id
     ORDER BY b.booked_at DESC`,
  );

  return rows.map(mapBooking);
}

async function timDatPhongTheoMa(connection, bookingCode) {
  const [rows] = await connection.query(
    'SELECT * FROM bookings WHERE booking_code = ? OR id = ? LIMIT 1',
    [bookingCode, Number(bookingCode) || 0],
  );

  if (!rows.length) throw taoLoi(404, 'Khong tim thay don dat phong.');
  return rows[0];
}

async function capNhatTrangThaiDatPhong({ bookingCode, status, adminId = null, note = null }) {
  const connection = await ketNoiDb.getConnection();

  try {
    await connection.beginTransaction();
    const booking = await timDatPhongTheoMa(connection, bookingCode);
    const updates = ['booking_status = ?'];
    const values = [status];

    if (status === TRANG_THAI_DAT_PHONG.CONFIRMED) updates.push('confirmed_at = NOW()');
    if (status === TRANG_THAI_DAT_PHONG.CHECKED_IN) updates.push('checked_in_at = NOW()');
    if (status === TRANG_THAI_DAT_PHONG.CHECKED_OUT) updates.push('checked_out_at = NOW()', 'payment_status = ?', 'paid_amount = total_price', 'remaining_amount = 0');
    if (status === TRANG_THAI_DAT_PHONG.CHECKED_OUT) values.push(TRANG_THAI_THANH_TOAN.PAID);
    if (status === TRANG_THAI_DAT_PHONG.CANCELLED) updates.push('cancelled_at = NOW()', 'cancel_reason = COALESCE(?, cancel_reason)');
    if (status === TRANG_THAI_DAT_PHONG.CANCELLED) values.push(note || 'Admin huy don');
    if (status === TRANG_THAI_DAT_PHONG.NO_SHOW) updates.push('no_show_at = NOW()', 'cancel_reason = COALESCE(?, cancel_reason)');
    if (status === TRANG_THAI_DAT_PHONG.NO_SHOW) values.push(note || 'Khach khong den nhan phong');

    values.push(booking.id);
    await connection.query(`UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`, values);
    await connection.query(
      `INSERT INTO booking_status_logs (booking_id, old_status, new_status, note, changed_by)
       VALUES (?, ?, ?, ?, ?)`,
      [booking.id, booking.booking_status, status, note, adminId],
    );
    await connection.commit();
    return layTatCaDatPhong();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function xacNhanThanhToan({ bookingCode, method, adminId = null, paymentCode = null, voucherCode = null }) {
  const connection = await ketNoiDb.getConnection();

  try {
    await connection.beginTransaction();
    const booking = await timDatPhongTheoMa(connection, bookingCode);
    const isDeposit = method === PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT;
    let totalPrice = Number(booking.total_price || 0);
    let discountAmount = Number(booking.discount_amount || 0);
    let nextVoucherCode = booking.voucher_code || null;

    if (voucherCode && !booking.voucher_code) {
      const [vouchers] = await connection.query(
        `SELECT * FROM vouchers
         WHERE code = ? AND is_active = TRUE AND (end_at IS NULL OR end_at > NOW())
         LIMIT 1`,
        [voucherCode],
      );

      if (vouchers.length && Number(booking.total_price || 0) >= Number(vouchers[0].min_order_amount || 0)) {
        nextVoucherCode = vouchers[0].code;
        if (vouchers[0].discount_type === 'percent') {
          discountAmount = Math.round(Number(booking.total_price || 0) * Number(vouchers[0].discount_value || 0));
          if (vouchers[0].max_discount_amount != null) {
            discountAmount = Math.min(discountAmount, Number(vouchers[0].max_discount_amount || 0));
          }
        } else if (vouchers[0].discount_type === 'fixed') {
          discountAmount = Number(vouchers[0].discount_value || 0);
        }
        discountAmount = Math.max(0, Math.min(Number(booking.total_price || 0), discountAmount));
        totalPrice = Math.max(0, Number(booking.total_price || 0) - discountAmount);
      }
    }

    const depositAmount = Math.ceil(totalPrice * 0.1);
    const paidAmount = isDeposit ? depositAmount : totalPrice;
    const paymentStatus = isDeposit ? TRANG_THAI_THANH_TOAN.DEPOSIT_PAID : TRANG_THAI_THANH_TOAN.PAID;
    const nextPaymentCode = paymentCode || booking.payment_code || taoMaGiaoDich(booking.booking_code);
    const nextQrToken = booking.checkin_qr_token || taoMaQr(booking.booking_code);

    await connection.query(
      `UPDATE bookings
       SET booking_status = 'confirmed',
           payment_status = ?,
           payment_method = ?,
           payment_code = ?,
           transfer_content = ?,
           voucher_code = COALESCE(?, voucher_code),
           original_total_price = COALESCE(original_total_price, total_price),
           discount_amount = ?,
           total_price = ?,
           deposit_amount = ?,
           paid_amount = ?,
           remaining_amount = GREATEST(total_price - ?, 0),
           checkin_qr_token = ?,
           confirmed_at = COALESCE(confirmed_at, NOW()),
           paid_at = NOW()
       WHERE id = ?`,
      [paymentStatus, method, nextPaymentCode, nextPaymentCode, nextVoucherCode, discountAmount, totalPrice, depositAmount, paidAmount, paidAmount, nextQrToken, booking.id],
    );

    if (nextVoucherCode) {
      await connection.query(
        `UPDATE user_vouchers uv
         JOIN vouchers v ON v.id = uv.voucher_id
         SET uv.status = 'used', uv.used_at = NOW(), uv.booking_id = ?
         WHERE uv.user_id = ? AND v.code = ?`,
        [booking.id, booking.user_id, nextVoucherCode],
      );
    }

    await connection.query(
      `INSERT INTO payment_transactions (
        booking_id, transaction_code, amount, payment_method, payment_status, transfer_content, confirmed_by, confirmed_at
      ) VALUES (?, ?, ?, ?, 'confirmed', ?, ?, NOW())
      ON DUPLICATE KEY UPDATE payment_status = 'confirmed', confirmed_by = VALUES(confirmed_by), confirmed_at = NOW()`,
      [booking.id, nextPaymentCode, paidAmount, method, nextPaymentCode, adminId],
    );

    await connection.query(
      `INSERT INTO booking_status_logs (booking_id, old_status, new_status, note, changed_by)
       VALUES (?, ?, 'confirmed', ?, ?)`,
      [booking.id, booking.booking_status, `Xac nhan thanh toan ${paymentStatus}`, adminId],
    );

    await connection.commit();
    return layTatCaDatPhong();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function luuGhiChuAdmin({ bookingCode, note, adminId }) {
  const [result] = await ketNoiDb.query(
    'UPDATE bookings SET admin_note = ? WHERE booking_code = ? OR id = ?',
    [String(note || '').trim(), bookingCode, Number(bookingCode) || 0],
  );

  if (!result.affectedRows) throw taoLoi(404, 'Khong tim thay don dat phong.');

  await ketNoiDb.query(
    `INSERT INTO admin_audit_logs (admin_id, action_type, target_table, target_id, description)
     VALUES (?, 'save_note', 'bookings', ?, ?)`,
    [adminId, bookingCode, 'Cap nhat ghi chu admin'],
  );

  return layTatCaDatPhong();
}

async function guiPhanHoiKhachHang({ user, bookingCode, payload }) {
  const [bookings] = await ketNoiDb.query(
    'SELECT * FROM bookings WHERE (booking_code = ? OR id = ?) AND user_id = ? LIMIT 1',
    [bookingCode, Number(bookingCode) || 0, user.id],
  );

  if (!bookings.length) throw taoLoi(404, 'Khong tim thay don dat phong cua ban.');

  const content = String(payload.content || '').trim();
  if (!content) throw taoLoi(400, 'Vui long nhap noi dung phan hoi.');

  const feedbackCode = `FB-${Date.now()}`;
  await ketNoiDb.query(
    `INSERT INTO customer_feedbacks (feedback_code, booking_id, user_id, feedback_type, title, content)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [feedbackCode, bookings[0].id, user.id, payload.type || 'feedback', payload.title || null, content],
  );

  return layDatPhongCuaNguoiDung(user.id);
}

module.exports = {
  TRANG_THAI_DAT_PHONG,
  TRANG_THAI_THANH_TOAN,
  PHUONG_THUC_THANH_TOAN,
  layDatPhongCuaNguoiDung,
  layTatCaDatPhong,
  capNhatTrangThaiDatPhong,
  xacNhanThanhToan,
  luuGhiChuAdmin,
  guiPhanHoiKhachHang,
};
