// Chức năng: Reset dữ liệu giao dịch test mà không xóa dữ liệu nền như phòng, voucher và tài khoản.
require("dotenv").config();

const ketNoiDb = require("../src/config/coSoDuLieu");

const args = new Set(process.argv.slice(2));
const isDryRun = args.has("--dry-run") || !args.has("--yes");

const TRANG_THAI_DA_GIAI_PHONG = new Set([
  "checked_out",
  "cancelled",
  "expired",
  "no_show",
]);

async function demBang(connection, tableName) {
  const [rows] = await connection.query(`SELECT COUNT(*) AS total FROM ${tableName}`);
  return Number(rows[0]?.total || 0);
}

async function layThongKe(connection) {
  const [bookingRows] = await connection.query(`
    SELECT
      COUNT(*) AS totalBookings,
      COALESCE(SUM(CASE WHEN booking_status NOT IN ('checked_out', 'cancelled', 'expired', 'no_show') THEN rooms_count ELSE 0 END), 0) AS roomsToRelease
    FROM bookings
  `);

  return {
    bookings: Number(bookingRows[0]?.totalBookings || 0),
    roomsToRelease: Number(bookingRows[0]?.roomsToRelease || 0),
    refundRequests: await demBang(connection, "refund_requests"),
    paymentTransactions: await demBang(connection, "payment_transactions"),
    bookingStatusLogs: await demBang(connection, "booking_status_logs"),
    invoices: await demBang(connection, "invoices"),
    bookingServices: await demBang(connection, "booking_services"),
    customerFeedbacks: await demBang(connection, "customer_feedbacks"),
    supportTicketsWithBooking: Number(
      (await connection.query("SELECT COUNT(*) AS total FROM support_tickets WHERE booking_id IS NOT NULL"))[0][0]?.total || 0,
    ),
    roomReviewsWithBooking: Number(
      (await connection.query("SELECT COUNT(*) AS total FROM room_reviews WHERE booking_id IS NOT NULL"))[0][0]?.total || 0,
    ),
    userVouchersWithBooking: Number(
      (await connection.query("SELECT COUNT(*) AS total FROM user_vouchers WHERE booking_id IS NOT NULL"))[0][0]?.total || 0,
    ),
  };
}

function inThongKe(title, stats) {
  console.log(title);
  console.table({
    bookings: stats.bookings,
    roomsToRelease: stats.roomsToRelease,
    refundRequests: stats.refundRequests,
    paymentTransactions: stats.paymentTransactions,
    bookingStatusLogs: stats.bookingStatusLogs,
    invoices: stats.invoices,
    bookingServices: stats.bookingServices,
    customerFeedbacks: stats.customerFeedbacks,
    supportTicketsWithBooking: stats.supportTicketsWithBooking,
    roomReviewsWithBooking: stats.roomReviewsWithBooking,
    userVouchersWithBooking: stats.userVouchersWithBooking,
  });
}

async function resetTestData() {
  const connection = await ketNoiDb.getConnection();

  try {
    const beforeStats = await layThongKe(connection);
    inThongKe(isDryRun ? "Dry-run: dữ liệu sẽ được reset" : "Reset dữ liệu đặt phòng", beforeStats);

    if (isDryRun) {
      console.log("Chưa xóa dữ liệu. Chạy `npm run reset:test-data` để reset thật.");
      return;
    }

    await connection.beginTransaction();

    const [activeBookings] = await connection.query(`
      SELECT id, room_id, rooms_count, booking_status
      FROM bookings
      FOR UPDATE
    `);

    for (const booking of activeBookings) {
      if (TRANG_THAI_DA_GIAI_PHONG.has(booking.booking_status)) continue;

      await connection.query(
        "UPDATE rooms SET inventory_count = inventory_count + ? WHERE id = ?",
        [Number(booking.rooms_count || 1), booking.room_id],
      );
    }

    await connection.query(`
      UPDATE user_vouchers
      SET status = 'saved',
          used_at = NULL,
          booking_id = NULL
      WHERE booking_id IS NOT NULL
    `);

    await connection.query("UPDATE room_reviews SET booking_id = NULL WHERE booking_id IS NOT NULL");
    await connection.query("DELETE FROM customer_feedbacks");
    await connection.query("DELETE FROM support_tickets WHERE booking_id IS NOT NULL");
    await connection.query("DELETE FROM refund_requests");
    await connection.query("DELETE FROM booking_status_logs");
    await connection.query("DELETE FROM payment_transactions");
    await connection.query("DELETE FROM booking_services");
    await connection.query("DELETE FROM invoices");
    await connection.query("DELETE FROM bookings");

    await connection.query("ALTER TABLE bookings AUTO_INCREMENT = 1");
    await connection.query("ALTER TABLE refund_requests AUTO_INCREMENT = 1");
    await connection.query("ALTER TABLE booking_status_logs AUTO_INCREMENT = 1");
    await connection.query("ALTER TABLE payment_transactions AUTO_INCREMENT = 1");
    await connection.query("ALTER TABLE booking_services AUTO_INCREMENT = 1");
    await connection.query("ALTER TABLE invoices AUTO_INCREMENT = 1");
    await connection.query("ALTER TABLE customer_feedbacks AUTO_INCREMENT = 1");

    await connection.commit();

    const afterStats = await layThongKe(connection);
    inThongKe("Đã reset xong", afterStats);
  } catch (error) {
    if (!isDryRun) await connection.rollback();
    console.error(`Reset test data failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    connection.release();
    await ketNoiDb.end();
  }
}

resetTestData();
