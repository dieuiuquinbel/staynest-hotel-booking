// Chức năng: Nghiệp vụ quản lý trạng thái đơn, thanh toán, hoàn tiền và doanh thu.
//Quản lý trạng thái, hoàn tiền, doanh thu, thanh toán
const ketNoiDb = require("../../config/coSoDuLieu");
const { damBaoCauTrucVanHanh } = require("../system/cauTrucVanHanh.service");
const nodemailer = require("nodemailer");

const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function guiEmailPhanHoiKhieuNai({ toEmail, guestName, ticketTitle, ticketContent, adminReply }) {
  try {
    await smtpTransporter.sendMail({
      from: process.env.MAIL_FROM || `"Khách Sạn DieuBel" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `[DieuBel] Phản hồi khiếu nại của bạn`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px 24px;">
          <div style="background: #0f172a; border-radius: 12px 12px 0 0; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 20px; margin: 0; font-weight: 700; letter-spacing: 0.05em;">DIEUBEL HOTEL</h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0;">Phản hồi từ quản lý</p>
          </div>
          <div style="background: #ffffff; border-radius: 0 0 12px 12px; padding: 28px 24px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="color: #475569; font-size: 15px; margin: 0 0 16px;">Kính gửi <strong style="color: #0f172a;">${guestName}</strong>,</p>
            <p style="color: #475569; font-size: 14px; margin: 0 0 24px;">Cảm ơn quý khách đã liên hệ với chúng tôi. Dưới đây là phản hồi của đội ngũ quản lý:</p>
            
            <div style="background: #f1f5f9; border-radius: 8px; padding: 16px 18px; margin-bottom: 20px; border-left: 3px solid #94a3b8;">
              <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px;">Nội dung khiếu nại của bạn</p>
              <p style="color: #475569; font-size: 14px; margin: 0; line-height: 1.6;">${ticketContent}</p>
            </div>

            <div style="background: #ecfdf5; border-radius: 8px; padding: 16px 18px; border-left: 3px solid #10b981;">
              <p style="color: #065f46; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px;">Đội ngũ quản lý phản hồi</p>
              <p style="color: #1e3a2a; font-size: 14px; margin: 0; line-height: 1.6;">${adminReply}</p>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">Nếu cần hỗ trợ thêm, vui lòng liên hệ lại qua email này.<br/>Trân trọng, Đội ngũ DieuBel Hotel.</p>
          </div>
        </div>
      `,
    });
  } catch (emailErr) {
    // Không dừng process nếu gửụi email lỗi, chỉ log cảnh báo
    console.warn("[SMTP] Gời email phản hồi khiếu nại thất bại:", emailErr.message);
  }
}

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
  return `PAY-${String(bookingCode).replace(/[^a-zA-Z0-9]/g, "")}-${String(Date.now()).slice(-6)}`;
}

function taoMaYeuCau(prefix) {
  return `${prefix}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Date.now()).slice(-6)}`;
}

function layNgayHomNayYmd() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function chuyenNgayThanhYmd(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function daDenNgayNhanPhong(checkInDate) {
  const checkInYmd = chuyenNgayThanhYmd(checkInDate);
  return Boolean(checkInYmd && checkInYmd <= layNgayHomNayYmd());
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

async function traPhongVeKhoNeuCan(connection, booking, nextStatus) {
  if (
    !TRANG_THAI_GIAI_PHONG.has(nextStatus) ||
    TRANG_THAI_GIAI_PHONG.has(booking.booking_status)
  )
    return;

  await connection.query(
    `UPDATE rooms
     SET inventory_count = inventory_count + ?
     WHERE id = ?`,
    [Number(booking.rooms_count || 1), booking.room_id],
  );
}

async function ghiLogTrangThai(connection, bookingId, oldStatus, newStatus, note, changedBy = null) {
  await connection.query(
    `INSERT INTO booking_status_logs (booking_id, old_status, new_status, note, changed_by)
     VALUES (?, ?, ?, ?, ?)`,
    [bookingId, oldStatus, newStatus, note, changedBy],
  );
}

async function dongBoTrangThaiDatPhongTheoThoiGian() {
  const connection = await ketNoiDb.getConnection();

  try {
    await connection.beginTransaction();

    const [expiredRows] = await connection.query(
      `SELECT id, room_id, rooms_count, booking_status
       FROM bookings
       WHERE booking_status = 'holding'
         AND payment_status = 'unpaid'
         AND payment_deadline IS NOT NULL
         AND payment_deadline < NOW()
       FOR UPDATE`,
    );

    for (const booking of expiredRows) {
      await connection.query(
        `UPDATE bookings
         SET booking_status = 'expired',
             remaining_amount = 0,
             cancelled_at = COALESCE(cancelled_at, NOW()),
             cancel_reason = COALESCE(cancel_reason, 'Qua han thanh toan giu cho')
         WHERE id = ?`,
        [booking.id],
      );
      await connection.query(
        `UPDATE rooms
         SET inventory_count = inventory_count + ?
         WHERE id = ?`,
        [Number(booking.rooms_count || 1), booking.room_id],
      );
      await ghiLogTrangThai(
        connection,
        booking.id,
        booking.booking_status,
        TRANG_THAI_DAT_PHONG.EXPIRED,
        "Tu dong huy giu cho do qua han thanh toan",
      );
    }

    const [checkInRows] = await connection.query(
      `SELECT id, booking_status
       FROM bookings
       WHERE booking_status = 'confirmed'
         AND payment_status = 'paid'
         AND check_in_date <= CURDATE()
       FOR UPDATE`,
    );

    for (const booking of checkInRows) {
      await connection.query(
        `UPDATE bookings
         SET booking_status = 'checked_in',
             checked_in_at = COALESCE(checked_in_at, NOW())
         WHERE id = ?`,
        [booking.id],
      );
      await ghiLogTrangThai(
        connection,
        booking.id,
        booking.booking_status,
        TRANG_THAI_DAT_PHONG.CHECKED_IN,
        "He thong mo nhan phong tu dong tu 00:00 ngay check-in",
      );
    }

    const [checkOutRows] = await connection.query(
      `SELECT id, room_id, rooms_count, booking_status
       FROM bookings
       WHERE booking_status = 'checked_in'
         AND TIMESTAMP(check_out_date) + INTERVAL 23 HOUR + INTERVAL 59 MINUTE <= NOW()
       FOR UPDATE`,
    );

    for (const booking of checkOutRows) {
      await connection.query(
        `UPDATE bookings
         SET booking_status = 'checked_out',
             checked_out_at = COALESCE(checked_out_at, NOW()),
             payment_status = 'paid',
             paid_amount = total_price,
             remaining_amount = 0
         WHERE id = ?`,
        [booking.id],
      );
      await connection.query(
        `UPDATE rooms
         SET inventory_count = inventory_count + ?
         WHERE id = ?`,
        [Number(booking.rooms_count || 1), booking.room_id],
      );
      await ghiLogTrangThai(
        connection,
        booking.id,
        booking.booking_status,
        TRANG_THAI_DAT_PHONG.CHECKED_OUT,
        "He thong tu dong tra phong khi het thoi gian luu tru",
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

let boDemQuetTrangThaiDatPhong = null;

function khoiDongQuetTrangThaiDatPhongNen(intervalMs = Number(process.env.BOOKING_STATUS_SCANNER_INTERVAL_MS) || 60_000) {
  if (boDemQuetTrangThaiDatPhong) return boDemQuetTrangThaiDatPhong;

  const quetTrangThai = async () => {
    try {
      await dongBoTrangThaiDatPhongTheoThoiGian();
    } catch (error) {
      console.warn(`Booking status scanner skipped: ${error.message}`);
    }
  };

  quetTrangThai();
  boDemQuetTrangThaiDatPhong = setInterval(quetTrangThai, intervalMs);
  if (typeof boDemQuetTrangThaiDatPhong.unref === "function") {
    boDemQuetTrangThaiDatPhong.unref();
  }

  return boDemQuetTrangThaiDatPhong;
}

function mapBooking(row) {
  const feedbacks = tachMangJson(row.customer_feedbacks_json);
  const latestCustomerFeedback = feedbacks[0] || null;
  const statusLogs = tachMangJson(row.status_logs_json);
  const paymentTransactions = tachMangJson(row.payment_transactions_json);

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
    originalTotalPrice: Number(
      row.original_total_price || row.total_price || 0,
    ),
    discountAmount: Number(row.discount_amount || 0),
    totalPrice: Number(row.total_price || 0),
    depositAmount: Number(
      row.deposit_amount || Math.ceil(Number(row.total_price || 0) * 0.1),
    ),
    paidAmount: Number(row.paid_amount || 0),
    remainingAmount: Number(row.remaining_amount || 0),
    nights: Number(row.nights || 0),
    bookingType: row.booking_type || "overnight",
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
    voucherTitle: row.voucher_title,
    qrToken: row.checkin_qr_token,
    paymentDeadline: row.payment_deadline,
    createdAt: row.booked_at,
    confirmedAt: row.confirmed_at,
    paidAt: row.paid_at,
    checkedInAt: row.checked_in_at,
    checkedOutAt: row.checked_out_at,
    frontdeskVerifiedAt: row.frontdesk_verified_at,
    frontdeskVerifiedNote: row.frontdesk_verified_note,
    cancelledAt: row.cancelled_at,
    cancelReason: row.cancel_reason,
    adminNote: row.admin_note,
    noShowAt: row.no_show_at,
    refundRequest: row.refund_request_id
      ? {
          id: row.refund_request_id,
          code: row.refund_code,
          paidAmount: Number(row.refund_paid_amount || 0),
          cancelFeeAmount: Number(row.refund_cancel_fee_amount || 0),
          refundAmount: Number(row.refund_amount || 0),
          status: row.refund_status,
          reason: row.refund_reason,
          adminNote: row.refund_admin_note,
          requestedAt: row.refund_requested_at,
          approvedAt: row.refund_approved_at,
          completedAt: row.refund_completed_at,
        }
      : null,
    statusLogs,
    paymentTransactions,
    latestCustomerFeedback,
    customerFeedbacks: feedbacks,
    reviewId: row.review_id || null,
  };
}

const SELECT_BOOKINGS = `
  SELECT
    b.*,
    DATE_FORMAT(b.check_in_date, '%Y-%m-%d') AS check_in_date,
    DATE_FORMAT(b.check_out_date, '%Y-%m-%d') AS check_out_date,
    MAX(rv.id) AS review_id,
    u.full_name,
    u.email,
    r.hotel_name,
    r.room_name,
    r.city,
    r.address,
    r.image_url,
    r.price_per_night,
    v.title AS voucher_title,
    rr.id AS refund_request_id,
    rr.refund_code,
    rr.paid_amount AS refund_paid_amount,
    rr.cancel_fee_amount AS refund_cancel_fee_amount,
    rr.refund_amount,
    rr.status AS refund_status,
    rr.reason AS refund_reason,
    rr.admin_note AS refund_admin_note,
    rr.requested_at AS refund_requested_at,
    rr.approved_at AS refund_approved_at,
    rr.completed_at AS refund_completed_at,
    (
      SELECT COALESCE(
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', bsl.id,
            'oldStatus', bsl.old_status,
            'newStatus', bsl.new_status,
            'note', bsl.note,
            'changedBy', bsl.changed_by,
            'changedAt', bsl.changed_at
          )
        ),
        JSON_ARRAY()
      )
      FROM booking_status_logs bsl
      WHERE bsl.booking_id = b.id
    ) AS status_logs_json,
    (
      SELECT COALESCE(
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pt.id,
            'transactionCode', pt.transaction_code,
            'amount', pt.amount,
            'method', pt.payment_method,
            'status', pt.payment_status,
            'transferContent', pt.transfer_content,
            'confirmedBy', pt.confirmed_by,
            'confirmedAt', pt.confirmed_at,
            'createdAt', pt.created_at
          )
        ),
        JSON_ARRAY()
      )
      FROM payment_transactions pt
      WHERE pt.booking_id = b.id
    ) AS payment_transactions_json,
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
  LEFT JOIN vouchers v ON v.code = b.voucher_code
  LEFT JOIN refund_requests rr ON rr.booking_id = b.id
  LEFT JOIN customer_feedbacks cf ON cf.booking_id = b.id
  LEFT JOIN room_reviews rv ON rv.booking_id = b.id
`;

async function layDatPhongCuaNguoiDung(userId) {
  await damBaoCauTrucVanHanh();
  await dongBoTrangThaiDatPhongTheoThoiGian();

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
  await damBaoCauTrucVanHanh();
  await dongBoTrangThaiDatPhongTheoThoiGian();

  const [rows] = await ketNoiDb.query(
    `${SELECT_BOOKINGS}
     GROUP BY b.id
     ORDER BY b.booked_at DESC`,
  );

  return rows.map(mapBooking);
}

async function timDatPhongTheoMa(connection, bookingCode, userId = null) {
  const values = [bookingCode, Number(bookingCode) || 0];
  const ownerClause = userId ? " AND user_id = ?" : "";
  if (userId) values.push(userId);

  const [rows] = await connection.query(
    `SELECT * FROM bookings WHERE (booking_code = ? OR id = ?)${ownerClause} LIMIT 1`,
    values,
  );

  if (!rows.length)
    throw taoLoi(
      404,
      userId
        ? "Khong tim thay don dat phong cua ban."
        : "Khong tim thay don dat phong.",
    );
  return rows[0];
}

function mapKetQuaQuetCheckIn(booking, verificationStatus) {
  return {
    bookingCode: booking.booking_code,
    guestName: booking.full_name,
    guestEmail: booking.email,
    roomName: booking.room_name,
    hotelName: booking.hotel_name,
    checkIn: booking.check_in_ymd,
    checkOut: booking.check_out_ymd,
    bookingStatus: booking.booking_status,
    paymentStatus: booking.payment_status,
    frontdeskVerifiedAt: booking.frontdesk_verified_at,
    verificationStatus,
    activeFrom: `${booking.check_in_ymd} 00:00:00`,
  };
}

async function xacMinhCheckInCongKhai({ token }) {
  await damBaoCauTrucVanHanh();
  await dongBoTrangThaiDatPhongTheoThoiGian();

  const connection = await ketNoiDb.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT
         b.*,
         DATE_FORMAT(b.check_in_date, '%Y-%m-%d') AS check_in_ymd,
         DATE_FORMAT(b.check_out_date, '%Y-%m-%d') AS check_out_ymd,
         b.check_in_date <= CURDATE() AS da_den_ngay_nhan_phong,
         r.room_name,
         r.hotel_name,
         u.full_name,
         u.email
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       JOIN users u ON u.id = b.user_id
       WHERE b.checkin_qr_token = ?
       LIMIT 1
       FOR UPDATE`,
      [token],
    );

    if (!rows.length) {
      throw taoLoi(404, "Ma QR check-in khong hop le hoac khong ton tai.");
    }

    const booking = rows[0];

    if (!Number(booking.da_den_ngay_nhan_phong)) {
      await connection.commit();
      return {
        message: "Ma nhan phong hop le nhung chua den thoi gian hieu luc.",
        data: mapKetQuaQuetCheckIn(booking, "early"),
      };
    }

    if (booking.booking_status === TRANG_THAI_DAT_PHONG.CHECKED_OUT) {
      await connection.commit();
      return {
        message: "Don nay da tra phong, khong can xac minh nhan phong.",
        data: mapKetQuaQuetCheckIn(booking, "checked_out"),
      };
    }

    if (
      booking.booking_status !== TRANG_THAI_DAT_PHONG.CONFIRMED &&
      booking.booking_status !== TRANG_THAI_DAT_PHONG.CHECKED_IN
    ) {
      throw taoLoi(
        400,
        `Don hang o trang thai '${booking.booking_status}', khong the xac minh check-in.`,
      );
    }

    if (booking.booking_status === TRANG_THAI_DAT_PHONG.CONFIRMED) {
      await connection.query(
        `UPDATE bookings
         SET booking_status = 'checked_in',
             checked_in_at = COALESCE(checked_in_at, NOW()),
             frontdesk_verified_at = COALESCE(frontdesk_verified_at, NOW()),
             frontdesk_verified_note = COALESCE(frontdesk_verified_note, 'Le tan xac minh QR qua mang LAN'),
             payment_status = CASE WHEN ? = 'deposit_paid' THEN 'paid' ELSE payment_status END,
             paid_amount = CASE WHEN ? = 'deposit_paid' THEN total_price ELSE paid_amount END,
             remaining_amount = CASE WHEN ? = 'deposit_paid' THEN 0 ELSE remaining_amount END
         WHERE id = ?`,
        [booking.payment_status, booking.payment_status, booking.payment_status, booking.id],
      );
      await ghiLogTrangThai(
        connection,
        booking.id,
        booking.booking_status,
        TRANG_THAI_DAT_PHONG.CHECKED_IN,
        "Le tan xac minh QR qua mang LAN",
        booking.user_id,
      );
      booking.booking_status = TRANG_THAI_DAT_PHONG.CHECKED_IN;
      booking.frontdesk_verified_at = new Date();
    } else if (!booking.frontdesk_verified_at) {
      await connection.query(
        `UPDATE bookings
         SET frontdesk_verified_at = NOW(),
             frontdesk_verified_note = COALESCE(frontdesk_verified_note, 'Le tan xac minh QR qua mang LAN')
         WHERE id = ?`,
        [booking.id],
      );
      await ghiLogTrangThai(
        connection,
        booking.id,
        booking.booking_status,
        booking.booking_status,
        "Le tan xac minh QR qua mang LAN",
        booking.user_id,
      );
      booking.frontdesk_verified_at = new Date();
    }

    await connection.commit();

    return {
      message: booking.frontdesk_verified_at
        ? "Xac minh nhan phong thanh cong."
        : "Quy khach da nhan phong tu truoc.",
      data: mapKetQuaQuetCheckIn(booking, "verified"),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function capNhatTrangThaiDatPhong({
  bookingCode,
  status,
  adminId = null,
  userId = null,
  note = null,
}) {
  await damBaoCauTrucVanHanh();

  const connection = await ketNoiDb.getConnection();

  try {
    await connection.beginTransaction();
    const booking = await timDatPhongTheoMa(connection, bookingCode, userId);

    if (adminId && !userId) {
      const trangThaiAdminDuocCapNhat = new Set([
        TRANG_THAI_DAT_PHONG.CHECKED_IN,
        TRANG_THAI_DAT_PHONG.CHECKED_OUT,
        TRANG_THAI_DAT_PHONG.CANCELLED,
        TRANG_THAI_DAT_PHONG.NO_SHOW,
      ]);

      if (!trangThaiAdminDuocCapNhat.has(status)) {
        throw taoLoi(
          403,
          "Admin khong cap nhat trang thai nay. Thanh toan QR do khach xac nhan, hoan tien xu ly o hang doi hoan tien.",
        );
      }

      if (
        status === TRANG_THAI_DAT_PHONG.CHECKED_IN &&
        (!(
          booking.booking_status === TRANG_THAI_DAT_PHONG.CONFIRMED ||
          (booking.booking_status === TRANG_THAI_DAT_PHONG.CHECKED_IN && !booking.frontdesk_verified_at)
        ) ||
          (booking.payment_status !== TRANG_THAI_THANH_TOAN.PAID &&
            booking.payment_status !== "deposit_paid"))
      ) {
        throw taoLoi(400, "Chi check-in hoac xac minh don da den giai doan nhan phong.");
      }

      if (
        status === TRANG_THAI_DAT_PHONG.CHECKED_OUT &&
        booking.booking_status !== TRANG_THAI_DAT_PHONG.CHECKED_IN
      ) {
        throw taoLoi(400, "Chi check-out don dang luu tru.");
      }

      if (
        status === TRANG_THAI_DAT_PHONG.CANCELLED &&
        ![
          TRANG_THAI_DAT_PHONG.HOLDING,
          TRANG_THAI_DAT_PHONG.PENDING,
        ].includes(booking.booking_status)
      ) {
        throw taoLoi(400, "Admin chi huy truc tiep don chua thanh toan.");
      }

      if (
        status === TRANG_THAI_DAT_PHONG.NO_SHOW &&
        booking.booking_status !== TRANG_THAI_DAT_PHONG.CONFIRMED
      ) {
        throw taoLoi(400, "Chi danh dau no-show cho don da xac nhan.");
      }
    }

    if (
      status === TRANG_THAI_DAT_PHONG.CANCELLED &&
      booking.payment_status !== TRANG_THAI_THANH_TOAN.UNPAID &&
      booking.booking_status !== TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED
    ) {
      throw taoLoi(
        400,
        "Don da thanh toan can tao yeu cau huy/hoan tien de admin duyet, khong huy truc tiep.",
      );
    }

    if (
      userId &&
      status === TRANG_THAI_DAT_PHONG.CHECKED_OUT &&
      !booking.frontdesk_verified_at
    ) {
      throw taoLoi(
        400,
        "Vui long xac minh nhan phong bang QR LAN truoc khi tu tra phong.",
      );
    }

    if (
      status === TRANG_THAI_DAT_PHONG.CHECKED_OUT &&
      !daDenNgayNhanPhong(booking.check_in_date)
    ) {
      throw taoLoi(400, "Chua den ngay nhan phong nen khong the tra phong.");
    }

    const updates = ["booking_status = ?"];
    const values = [status];

    if (status === TRANG_THAI_DAT_PHONG.CONFIRMED)
      updates.push("confirmed_at = NOW()");
    if (status === TRANG_THAI_DAT_PHONG.CHECKED_IN) {
      updates.push(
        "checked_in_at = NOW()",
        "frontdesk_verified_at = COALESCE(frontdesk_verified_at, NOW())",
        "frontdesk_verified_note = COALESCE(frontdesk_verified_note, ?)",
      );
      values.push(note || "Admin xac minh nhan phong");
      if (booking.payment_status === "deposit_paid") {
        updates.push(
          "payment_status = 'paid'",
          "paid_amount = total_price",
          "remaining_amount = 0"
        );
      }
    }
    if (status === TRANG_THAI_DAT_PHONG.CHECKED_OUT)
      updates.push(
        "checked_out_at = NOW()",
        "payment_status = ?",
        "paid_amount = total_price",
        "remaining_amount = 0",
      );
    if (status === TRANG_THAI_DAT_PHONG.CHECKED_OUT)
      values.push(TRANG_THAI_THANH_TOAN.PAID);
    if (status === TRANG_THAI_DAT_PHONG.CANCELLED)
      updates.push(
        "cancelled_at = NOW()",
        "remaining_amount = 0",
        "cancel_reason = COALESCE(?, cancel_reason)",
      );
    if (status === TRANG_THAI_DAT_PHONG.CANCELLED)
      values.push(note || "Admin huy don");
    if (status === TRANG_THAI_DAT_PHONG.NO_SHOW)
      updates.push(
        "no_show_at = NOW()",
        "cancel_reason = COALESCE(?, cancel_reason)",
      );
    if (status === TRANG_THAI_DAT_PHONG.NO_SHOW)
      values.push(note || "Khach khong den nhan phong");

    values.push(booking.id);
    await traPhongVeKhoNeuCan(connection, booking, status);
    await connection.query(
      `UPDATE bookings SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );
    await connection.query(
      `INSERT INTO booking_status_logs (booking_id, old_status, new_status, note, changed_by)
       VALUES (?, ?, ?, ?, ?)`,
      [booking.id, booking.booking_status, status, note, adminId || userId],
    );
    await connection.commit();
    return userId ? layDatPhongCuaNguoiDung(userId) : layTatCaDatPhong();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

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

async function layYeuCauHoanTienCuaToi(userId) {
  await damBaoCauTrucVanHanh();

  const [rows] = await ketNoiDb.query(
    `SELECT
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
     WHERE rr.user_id = ?
     ORDER BY rr.requested_at DESC`,
    [userId],
  );

  return rows.map(mapYeuCauHoanTien);
}

async function layTatCaYeuCauHoanTien() {
  await damBaoCauTrucVanHanh();

  const [rows] = await ketNoiDb.query(
    `SELECT
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

function mapHoTro(row) {
  return {
    id: row.id,
    code: row.ticket_code,
    bookingId: row.booking_code,
    userId: row.user_id,
    guestName: row.full_name,
    guestEmail: row.email,
    category: row.category,
    title: row.title,
    content: row.content,
    status: row.status,
    adminReply: row.admin_reply,
    createdAt: row.created_at,
    repliedAt: row.replied_at,
  };
}

async function guiYeuCauHoTro({ user, payload }) {
  await damBaoCauTrucVanHanh();

  const title = String(payload.title || "").trim();
  const content = String(payload.content || "").trim();
  if (!title || !content)
    throw taoLoi(400, "Vui long nhap tieu de va noi dung ho tro.");

  let bookingId = null;
  if (payload.bookingCode) {
    const [bookings] = await ketNoiDb.query(
      "SELECT id FROM bookings WHERE (booking_code = ? OR id = ?) AND user_id = ? LIMIT 1",
      [payload.bookingCode, Number(payload.bookingCode) || 0, user.id],
    );
    bookingId = bookings[0]?.id || null;
  }

  await ketNoiDb.query(
    `INSERT INTO support_tickets (ticket_code, user_id, booking_id, category, title, content)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      taoMaYeuCau("SP"),
      user.id,
      bookingId,
      payload.category || "other",
      title,
      content,
    ],
  );

  return layYeuCauHoTroCuaToi(user.id);
}

async function layYeuCauHoTroCuaToi(userId) {
  await damBaoCauTrucVanHanh();

  const [rows] = await ketNoiDb.query(
    `SELECT st.*, b.booking_code, u.full_name, u.email
     FROM support_tickets st
     JOIN users u ON u.id = st.user_id
     LEFT JOIN bookings b ON b.id = st.booking_id
     WHERE st.user_id = ?
     ORDER BY st.created_at DESC`,
    [userId],
  );

  return rows.map(mapHoTro);
}

async function layTatCaYeuCauHoTro() {
  await damBaoCauTrucVanHanh();

  const [rows] = await ketNoiDb.query(
    `SELECT st.*, b.booking_code, u.full_name, u.email
     FROM support_tickets st
     JOIN users u ON u.id = st.user_id
     LEFT JOIN bookings b ON b.id = st.booking_id
     ORDER BY st.created_at DESC`,
  );

  return rows.map(mapHoTro);
}

async function capNhatYeuCauHoTro({ ticketId, status, reply, adminId }) {
  await damBaoCauTrucVanHanh();

  // Lấy thông tin ticket trước để gửi email
  const [ticketRows] = await ketNoiDb.query(
    `SELECT st.*, u.full_name, u.email
     FROM support_tickets st
     JOIN users u ON u.id = st.user_id
     WHERE st.id = ? LIMIT 1`,
    [ticketId],
  );

  const ticket = ticketRows[0] || null;

  const [result] = await ketNoiDb.query(
    `UPDATE support_tickets
     SET status = COALESCE(?, status),
         admin_reply = COALESCE(?, admin_reply),
         replied_by = ?,
         replied_at = NOW()
     WHERE id = ?`,
    [status || null, reply || null, adminId, ticketId],
  );

  if (!result.affectedRows) throw taoLoi(404, "Khong tim thay yeu cau ho tro.");

  // Gửụi email SMTP nếu có nội dung trả lời
  if (reply && ticket?.email) {
    await guiEmailPhanHoiKhieuNai({
      toEmail: ticket.email,
      guestName: ticket.full_name || "Quý khách",
      ticketTitle: ticket.title || "",
      ticketContent: ticket.content || "",
      adminReply: reply,
    });
  }

  return layTatCaYeuCauHoTro();
}

function chuanHoaNgayBaoCao(value, fallback) {
  if (!value) return fallback;
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return fallback;
  return text;
}

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

async function xacNhanThanhToan({
  bookingCode,
  method,
  userId = null,
  paymentCode = null,
  voucherCode = null,
}) {
  await damBaoCauTrucVanHanh();

  if (
    ![
      PHUONG_THUC_THANH_TOAN.ONLINE_FULL,
      PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT,
    ].includes(method)
  ) {
    throw taoLoi(400, "Phuong thuc thanh toan khong hop le.");
  }

  const connection = await ketNoiDb.getConnection();

  try {
    await connection.beginTransaction();
    const booking = await timDatPhongTheoMa(connection, bookingCode, userId);

    if (
      booking.booking_status !== TRANG_THAI_DAT_PHONG.HOLDING ||
      booking.payment_status !== TRANG_THAI_THANH_TOAN.UNPAID
    ) {
      throw taoLoi(
        409,
        "Don nay khong con o trang thai cho khach thanh toan QR.",
      );
    }

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

      if (!vouchers.length) {
        throw taoLoi(400, "Ma giam gia khong hop le hoac da het han.");
      }

      if (
        Number(booking.total_price || 0) <
        Number(vouchers[0].min_order_amount || 0)
      ) {
        throw taoLoi(
          400,
          `Don can toi thieu ${Number(vouchers[0].min_order_amount || 0).toLocaleString("vi-VN")} d de dung ma nay.`,
        );
      }

      nextVoucherCode = vouchers[0].code;
      if (vouchers[0].discount_type === "percent") {
        discountAmount = Math.round(
          Number(booking.total_price || 0) *
            Number(vouchers[0].discount_value || 0),
        );
        if (vouchers[0].max_discount_amount != null) {
          discountAmount = Math.min(
            discountAmount,
            Number(vouchers[0].max_discount_amount || 0),
          );
        }
      } else if (vouchers[0].discount_type === "fixed") {
        discountAmount = Number(vouchers[0].discount_value || 0);
      }
      discountAmount = Math.max(
        0,
        Math.min(Number(booking.total_price || 0), discountAmount),
      );
      totalPrice = Math.max(
        0,
        Number(booking.total_price || 0) - discountAmount,
      );
    }

    const depositAmount = Math.ceil(totalPrice * 0.1);
    const paidAmount = isDeposit ? depositAmount : totalPrice;
    const paymentStatus = isDeposit
      ? TRANG_THAI_THANH_TOAN.DEPOSIT_PAID
      : TRANG_THAI_THANH_TOAN.PAID;
    const nextPaymentCode =
      paymentCode ||
      booking.payment_code ||
      taoMaGiaoDich(booking.booking_code);
    const nextQrToken =
      booking.checkin_qr_token || taoMaQr(booking.booking_code);

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
      [
        paymentStatus,
        method,
        nextPaymentCode,
        nextPaymentCode,
        nextVoucherCode,
        discountAmount,
        totalPrice,
        depositAmount,
        paidAmount,
        paidAmount,
        nextQrToken,
        booking.id,
      ],
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
        booking_id, transaction_code, amount, payment_method, payment_status, transfer_content, confirmed_at
      ) VALUES (?, ?, ?, ?, 'confirmed', ?, NOW())
      ON DUPLICATE KEY UPDATE payment_status = 'confirmed', confirmed_at = NOW()`,
      [
        booking.id,
        nextPaymentCode,
        paidAmount,
        method,
        nextPaymentCode,
      ],
    );

    await connection.query(
      `INSERT INTO booking_status_logs (booking_id, old_status, new_status, note, changed_by)
       VALUES (?, ?, 'confirmed', ?, ?)`,
      [
        booking.id,
        booking.booking_status,
        `Xac nhan thanh toan ${paymentStatus}`,
        userId,
      ],
    );

    await connection.commit();
    return userId ? layDatPhongCuaNguoiDung(userId) : layTatCaDatPhong();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function luuGhiChuAdmin({ bookingCode, note, adminId }) {
  const [result] = await ketNoiDb.query(
    "UPDATE bookings SET admin_note = ? WHERE booking_code = ? OR id = ?",
    [String(note || "").trim(), bookingCode, Number(bookingCode) || 0],
  );

  if (!result.affectedRows) throw taoLoi(404, "Khong tim thay don dat phong.");

  await ketNoiDb.query(
    `INSERT INTO admin_audit_logs (admin_id, action_type, target_table, target_id, description)
     VALUES (?, 'save_note', 'bookings', ?, ?)`,
    [adminId, bookingCode, "Cap nhat ghi chu admin"],
  );

  return layTatCaDatPhong();
}

async function guiPhanHoiKhachHang({ user, bookingCode, payload }) {
  const [bookings] = await ketNoiDb.query(
    "SELECT * FROM bookings WHERE (booking_code = ? OR id = ?) AND user_id = ? LIMIT 1",
    [bookingCode, Number(bookingCode) || 0, user.id],
  );

  if (!bookings.length)
    throw taoLoi(404, "Khong tim thay don dat phong cua ban.");

  const content = String(payload.content || "").trim();
  if (!content) throw taoLoi(400, "Vui long nhap noi dung phan hoi.");

  const feedbackCode = `FB-${Date.now()}`;
  await ketNoiDb.query(
    `INSERT INTO customer_feedbacks (feedback_code, booking_id, user_id, feedback_type, title, content)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      feedbackCode,
      bookings[0].id,
      user.id,
      payload.type || "feedback",
      payload.title || null,
      content,
    ],
  );

  return layDatPhongCuaNguoiDung(user.id);
}

module.exports = {
  TRANG_THAI_DAT_PHONG,
  TRANG_THAI_THANH_TOAN,
  PHUONG_THUC_THANH_TOAN,
  layDatPhongCuaNguoiDung,
  layTatCaDatPhong,
  khoiDongQuetTrangThaiDatPhongNen,
  capNhatTrangThaiDatPhong,
  xacNhanThanhToan,
  xacMinhCheckInCongKhai,
  luuGhiChuAdmin,
  guiPhanHoiKhachHang,
  taoYeuCauHoanTien,
  layYeuCauHoanTienCuaToi,
  layTatCaYeuCauHoanTien,
  capNhatYeuCauHoanTien,
  guiYeuCauHoTro,
  layYeuCauHoTroCuaToi,
  layTatCaYeuCauHoTro,
  capNhatYeuCauHoTro,
  layBaoCaoDoanhThu,
};
