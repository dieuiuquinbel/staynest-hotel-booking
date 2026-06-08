const ketNoiDb = require("../../src/config/coSoDuLieu");
const {
  xacNhanThanhToan,
} = require("../../src/modules/bookings/quanLyDatPhong.service");

async function taoUserTest() {
  const unique = Date.now();
  const [result] = await ketNoiDb.query(
    `INSERT INTO users (full_name, username, email, password_hash, phone, email_verified, role, status)
     VALUES (?, ?, ?, ?, ?, TRUE, 'customer', 'active')`,
    [
      "Khách Payment",
      `payment${unique}`,
      `payment-${unique}@dieubel.test`,
      "$2a$10$wJ7Qk1oBzp1EFQ0iJWpYt.6yQJ6gMdQnN4Q9fB3u6KzqY9x2S9s0e",
      "0900000001",
    ],
  );

  return result.insertId;
}

async function taoBookingChoThanhToan({ userId, totalPrice = 1000000 }) {
  const bookingCode = `DBPAY${Date.now()}`;
  const paymentDeadline = new Date(Date.now() + 15 * 60 * 1000);

  const [bookingResult] = await ketNoiDb.query(
    `INSERT INTO bookings (
      booking_code,
      user_id,
      room_id,
      check_in_date,
      check_out_date,
      guests,
      rooms_count,
      nights,
      room_price,
      service_price,
      original_total_price,
      discount_amount,
      total_price,
      deposit_amount,
      paid_amount,
      remaining_amount,
      booking_status,
      payment_status,
      payment_method,
      payment_deadline,
      note
    ) VALUES (?, ?, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 8 DAY), 2, 1, 1, ?, 0, ?, 0, ?, ?, 0, ?, 'holding', 'unpaid', 'pay_at_hotel', ?, 'Test booking')`,
    [
      bookingCode,
      userId,
      totalPrice,
      totalPrice,
      totalPrice,
      Math.ceil(totalPrice * 0.1),
      totalPrice,
      paymentDeadline,
    ],
  );

  const invoiceCode = `INV-${bookingCode}`;
  await ketNoiDb.query(
    `INSERT INTO invoices (booking_id, invoice_code, file_path, total_amount)
     VALUES (?, ?, ?, ?)`,
    [bookingResult.insertId, invoiceCode, `storage/test-invoices/${invoiceCode}.html`, totalPrice],
  );

  return {
    id: bookingResult.insertId,
    code: bookingCode,
  };
}

afterAll(async () => {
  await ketNoiDb.end();
});

describe("payment confirmation", () => {
  test("confirms full online payment, applies voucher, updates invoice, and blocks duplicate confirmation", async () => {
    const userId = await taoUserTest();
    const booking = await taoBookingChoThanhToan({ userId, totalPrice: 1000000 });

    await xacNhanThanhToan({
      bookingCode: booking.id,
      method: "online_full",
      userId,
      paymentCode: "PAYMENT_TEST_FULL",
      voucherCode: "DIEUBEL10",
    });

    const [[updatedBooking]] = await ketNoiDb.query(
      `SELECT booking_status, payment_status, voucher_code, total_price, paid_amount, remaining_amount, payment_code
       FROM bookings
       WHERE id = ?`,
      [booking.id],
    );

    expect(updatedBooking.booking_status).toBe("confirmed");
    expect(updatedBooking.payment_status).toBe("paid");
    expect(updatedBooking.voucher_code).toBe("DIEUBEL10");
    expect(Number(updatedBooking.total_price)).toBe(900000);
    expect(Number(updatedBooking.paid_amount)).toBe(900000);
    expect(Number(updatedBooking.remaining_amount)).toBe(0);
    expect(updatedBooking.payment_code).toBe("PAYMENT_TEST_FULL");

    const [[invoice]] = await ketNoiDb.query(
      "SELECT total_amount FROM invoices WHERE booking_id = ?",
      [booking.id],
    );
    expect(Number(invoice.total_amount)).toBe(900000);

    const [transactions] = await ketNoiDb.query(
      "SELECT amount, payment_status FROM payment_transactions WHERE booking_id = ?",
      [booking.id],
    );
    expect(transactions).toHaveLength(1);
    expect(Number(transactions[0].amount)).toBe(900000);
    expect(transactions[0].payment_status).toBe("confirmed");

    await expect(
      xacNhanThanhToan({
        bookingCode: booking.id,
        method: "online_full",
        userId,
        paymentCode: "PAYMENT_TEST_FULL",
        voucherCode: "DIEUBEL10",
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: "Đơn này không còn ở trạng thái chờ khách thanh toán QR.",
    });
  });
});
