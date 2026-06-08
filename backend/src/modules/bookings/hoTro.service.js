// Chức năng: Nghiệp vụ xử lý yêu cầu hỗ trợ (support tickets) và phản hồi khách hàng.
// Tách từ quanLyDatPhong.service.js để giảm độ phức tạp của file gốc.
const ketNoiDb = require("../../config/coSoDuLieu");
const { damBaoCauTrucVanHanh } = require("../system/cauTrucVanHanh.service");
const { guiMail } = require("../notifications/thuDienTu.service");

// ─── Hàm tiện ích nội bộ ─────────────────────────────────────────────────────

function taoLoi(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function taoMaYeuCau(prefix) {
  return `${prefix}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Date.now()).slice(-6)}`;
}

// ─── Email phản hồi khiếu nại ───────────────────────────────────────────────

async function guiEmailPhanHoiKhieuNai({ toEmail, guestName, ticketTitle, ticketContent, adminReply }) {
  try {
    await guiMail({
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
    console.warn("[SMTP] Gui email phan hoi khieu nai that bai:", emailErr.message);
  }
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

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

// ─── Service functions ───────────────────────────────────────────────────────

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

  // Gửi email SMTP nếu có nội dung trả lời
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

  // Import hàm layDatPhongCuaNguoiDung từ file gốc để trả kết quả
  const { layDatPhongCuaNguoiDung } = require("./quanLyDatPhong.service");
  return layDatPhongCuaNguoiDung(user.id);
}

module.exports = {
  guiYeuCauHoTro,
  layYeuCauHoTroCuaToi,
  layTatCaYeuCauHoTro,
  capNhatYeuCauHoTro,
  guiPhanHoiKhachHang,
};
