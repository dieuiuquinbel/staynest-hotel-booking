const fs = require('fs/promises');
const path = require('path');

const INVOICE_DIR = path.resolve(process.env.INVOICE_DIR || path.join(__dirname, '../../storage/invoices'));

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')} VND`;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildInvoiceHtml({ invoiceCode, booking, room, user, servicesText }) {
  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(invoiceCode)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #0f172a; margin: 40px; }
      h1 { margin: 0 0 8px; color: #1d4ed8; }
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      td, th { border: 1px solid #dbe4ef; padding: 12px; text-align: left; }
      th { background: #eff6ff; }
      .total { font-size: 20px; font-weight: 800; color: #1d4ed8; }
    </style>
  </head>
  <body>
    <h1>Hoa don StayNest</h1>
    <p>Ma hoa don: <strong>${escapeHtml(invoiceCode)}</strong></p>
    <p>Ma dat phong: <strong>${escapeHtml(booking.booking_code)}</strong></p>
    <table>
      <tr><th>Khach hang</th><td>${escapeHtml(user.full_name)} (${escapeHtml(user.email)})</td></tr>
      <tr><th>Khach san</th><td>${escapeHtml(room.hotel_name)}</td></tr>
      <tr><th>Phong</th><td>${escapeHtml(room.room_name)}</td></tr>
      <tr><th>Loai phong</th><td>${escapeHtml(room.room_type)}</td></tr>
      <tr><th>Ngay nhan phong</th><td>${escapeHtml(booking.check_in_date)}</td></tr>
      <tr><th>Ngay tra phong</th><td>${escapeHtml(booking.check_out_date)}</td></tr>
      <tr><th>So khach / so phong</th><td>${escapeHtml(booking.guests)} khach / ${escapeHtml(booking.rooms_count)} phong</td></tr>
      <tr><th>Dich vu da chon</th><td>${escapeHtml(servicesText || 'Khong co')}</td></tr>
      <tr><th>Tong tien</th><td class="total">${formatMoney(booking.total_price)}</td></tr>
    </table>
  </body>
</html>`;
}

async function createInvoiceFile({ booking, room, user, servicesText }) {
  await fs.mkdir(INVOICE_DIR, { recursive: true });

  const invoiceCode = `INV-${booking.id}-${Date.now()}`;
  const filePath = path.join(INVOICE_DIR, `${invoiceCode}.html`);
  const html = buildInvoiceHtml({ invoiceCode, booking, room, user, servicesText });

  await fs.writeFile(filePath, html, 'utf8');

  return {
    invoiceCode,
    filePath,
  };
}

module.exports = {
  createInvoiceFile,
  formatMoney,
};
