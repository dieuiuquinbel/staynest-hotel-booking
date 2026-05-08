import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useKhoXacThuc from '../store/khoXacThuc';
import {
  TRANG_THAI_DAT_PHONG,
  NHAN_TRANG_THAI_DAT_PHONG,
  KIEU_DAT_PHONG,
  NHAN_KIEU_DAT_PHONG,
  TRANG_THAI_THANH_TOAN,
  NHAN_TRANG_THAI_THANH_TOAN,
  taoHtmlHoaDon,
  docTatCaDatPhong,
  capNhatTrangThaiDatPhong,
} from '../utils/lichSuDatPhong';
import { dinhDangTien } from '../utils/dinhDang';

const TAB_QUAN_TRI = [
  { key: 'all', label: 'Tất cả' },
  { key: TRANG_THAI_DAT_PHONG.HOLDING, label: 'Giữ chỗ' },
  { key: TRANG_THAI_DAT_PHONG.CONFIRMED, label: 'Đã xác nhận' },
  { key: TRANG_THAI_DAT_PHONG.CHECKED_IN, label: 'Đang lưu trú' },
  { key: TRANG_THAI_DAT_PHONG.CHECKED_OUT, label: 'Đã trả phòng' },
  { key: TRANG_THAI_DAT_PHONG.CANCELLED, label: 'Đã hủy' },
];

const MAU_TRANG_THAI = {
  [TRANG_THAI_DAT_PHONG.HOLDING]: 'bg-amber-50 text-amber-700',
  [TRANG_THAI_DAT_PHONG.CONFIRMED]: 'bg-emerald-50 text-emerald-700',
  [TRANG_THAI_DAT_PHONG.CHECKED_IN]: 'bg-sky-50 text-sky-700',
  [TRANG_THAI_DAT_PHONG.CHECKED_OUT]: 'bg-slate-100 text-slate-700',
  [TRANG_THAI_DAT_PHONG.CANCELLED]: 'bg-rose-50 text-rose-700',
  [TRANG_THAI_DAT_PHONG.NO_SHOW]: 'bg-rose-50 text-rose-700',
};

const MAU_THANH_TOAN = {
  [TRANG_THAI_THANH_TOAN.UNPAID]: 'bg-rose-50 text-rose-700',
  [TRANG_THAI_THANH_TOAN.DEPOSIT_PAID]: 'bg-amber-50 text-amber-700',
  [TRANG_THAI_THANH_TOAN.PAID]: 'bg-emerald-50 text-emerald-700',
  [TRANG_THAI_THANH_TOAN.PAY_AT_COUNTER]: 'bg-sky-50 text-sky-700',
  [TRANG_THAI_THANH_TOAN.REFUNDED]: 'bg-slate-100 text-slate-700',
};

function lopHuyHieu(map, value) {
  return map[value] || 'bg-slate-100 text-slate-700';
}

function dinhDangNgayGio(value) {
  if (!value) return 'Chưa có';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function thoiGianDatPhong(booking) {
  if (booking.bookingType === KIEU_DAT_PHONG.DAY_USE) {
    return `${booking.checkIn || 'Chưa chọn'} · ${booking.timeSlot?.label || 'Trong ngày'} · ${booking.timeSlot?.time || ''}`;
  }

  return `${booking.checkIn || 'Chưa chọn'} - ${booking.checkOut || 'Chưa chọn'}`;
}

function datPhongKhopTimKiem(booking, query) {
  const value = query.trim().toLowerCase();
  if (!value) return true;

  return [
    booking.id,
    booking.paymentCode,
    booking.transferContent,
    booking.guestName,
    booking.guestEmail,
    booking.hotel_name,
    booking.room_name,
    booking.city,
  ]
    .filter(Boolean)
    .some((item) => String(item).toLowerCase().includes(value));
}

function TheThongKe({ label, value, hint }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/[0.03]">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
      {hint ? <p className="mt-1 text-xs font-semibold text-slate-500">{hint}</p> : null}
    </article>
  );
}

function HuyHieuTrangThai({ children, tone }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}>{children}</span>;
}

function XemTruocQr({ token }) {
  if (!token) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">
        Chưa có QR nhận phòng. QR sẽ được tạo sau khi khách thanh toán hoặc đặt cọc.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
      <div className="grid h-24 w-24 shrink-0 grid-cols-5 grid-rows-5 gap-1 rounded-xl bg-white p-3">
        {Array.from({ length: 25 }).map((_, index) => (
          <span
            key={`${token}-${index}`}
            className={`rounded-[2px] ${(token.charCodeAt(index % token.length) + index) % 3 === 0 ? 'bg-slate-950' : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black text-emerald-800">QR nhận phòng</p>
        <p className="mt-1 break-all text-xs font-bold text-emerald-900">{token}</p>
      </div>
    </div>
  );
}

function DongChiTiet({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-slate-950">{value || 'Chưa có'}</p>
    </div>
  );
}

function TheDatPhong({ booking, selected, onSelect }) {
  return (
    <article
      className={`subtle-card cursor-pointer overflow-hidden p-0 transition ${
        selected ? 'border-brand-400 ring-4 ring-sky-100' : 'hover:border-brand-300'
      }`}
      onClick={() => onSelect(booking.id)}
    >
      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)_230px]">
        <img src={booking.image_url} alt={booking.hotel_name} className="h-52 w-full object-cover lg:h-full" />

        <div className="min-w-0 p-5">
          <div className="flex flex-wrap gap-2">
            <HuyHieuTrangThai tone={lopHuyHieu(MAU_TRANG_THAI, booking.bookingStatus)}>
              {NHAN_TRANG_THAI_DAT_PHONG[booking.bookingStatus] || booking.bookingStatus}
            </HuyHieuTrangThai>
            <HuyHieuTrangThai tone={lopHuyHieu(MAU_THANH_TOAN, booking.paymentStatus)}>
              {NHAN_TRANG_THAI_THANH_TOAN[booking.paymentStatus] || booking.paymentStatus}
            </HuyHieuTrangThai>
            <HuyHieuTrangThai tone="bg-white text-slate-500">{booking.id}</HuyHieuTrangThai>
          </div>

          <h2 className="mt-3 text-xl font-black text-slate-950">{booking.hotel_name}</h2>
          <p className="mt-1 text-sm font-bold text-slate-600">{booking.room_name}</p>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {booking.guestName || 'Khách hàng'} · {booking.guestEmail || 'Chưa có email'}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {NHAN_KIEU_DAT_PHONG[booking.bookingType] || 'Qua đêm'} · {thoiGianDatPhong(booking)}
          </p>
        </div>

        <div className="border-t border-slate-200 bg-slate-50/70 p-5 lg:border-l lg:border-t-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Tổng tiền</p>
          <p className="mt-1 text-xl font-black text-slate-950">{dinhDangTien(booking.totalPrice)}</p>
          <p className="mt-4 text-sm font-bold text-brand-700">Đã trả {dinhDangTien(booking.paidAmount)}</p>
          <p className="mt-1 text-sm font-bold text-slate-500">Còn {dinhDangTien(booking.remainingAmount)}</p>
          <p className="mt-4 break-all text-xs font-bold text-slate-500">Mã HD: {booking.paymentCode || 'Chưa có'}</p>
        </div>
      </div>
    </article>
  );
}

function BangChiTiet({ booking, onClear, onStatus, onInvoice }) {
  if (!booking) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">
        Chọn một đơn ở danh sách bên trái để xem chi tiết.
      </aside>
    );
  }

  const canCheckIn =
    booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED &&
    [TRANG_THAI_THANH_TOAN.PAID, TRANG_THAI_THANH_TOAN.DEPOSIT_PAID].includes(booking.paymentStatus);
  const canCheckOut = booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN;
  const canCancel = ![TRANG_THAI_DAT_PHONG.CHECKED_IN, TRANG_THAI_DAT_PHONG.CHECKED_OUT, TRANG_THAI_DAT_PHONG.CANCELLED].includes(booking.bookingStatus);

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.03] xl:sticky xl:top-28 xl:self-start">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Chi tiết đơn</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">{booking.id}</h2>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-brand-500 hover:text-brand-700"
        >
          Bỏ chọn
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <DongChiTiet label="Trạng thái" value={NHAN_TRANG_THAI_DAT_PHONG[booking.bookingStatus] || booking.bookingStatus} />
          <DongChiTiet label="Thanh toán" value={NHAN_TRANG_THAI_THANH_TOAN[booking.paymentStatus] || booking.paymentStatus} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DongChiTiet label="Tạo lúc" value={dinhDangNgayGio(booking.createdAt)} />
          <DongChiTiet label="Thanh toán lúc" value={dinhDangNgayGio(booking.paidAt)} />
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="font-black text-slate-950">{booking.guestName || 'Khách hàng'}</p>
          <p className="mt-1 break-words text-sm text-slate-500">{booking.guestEmail}</p>
          <p className="mt-1 text-sm text-slate-500">{booking.guests || 1} khách · {booking.rooms || 1} phòng</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="font-black text-slate-950">{booking.hotel_name}</p>
          <p className="mt-1 text-sm text-slate-500">{booking.room_name}</p>
          <p className="mt-1 text-sm text-slate-500">{booking.address}</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
          <p><strong>Loại đặt:</strong> {NHAN_KIEU_DAT_PHONG[booking.bookingType] || 'Qua đêm'}</p>
          <p><strong>Thời gian:</strong> {thoiGianDatPhong(booking)}</p>
          <p><strong>Hạn thanh toán:</strong> {dinhDangNgayGio(booking.paymentDeadline)}</p>
          <p><strong>Mã chuyển khoản:</strong> {booking.paymentCode || booking.transferContent || 'Chưa có'}</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
          <p><strong>Tổng:</strong> {dinhDangTien(booking.totalPrice)}</p>
          <p><strong>Cọc 10%:</strong> {dinhDangTien(booking.depositAmount)}</p>
          <p><strong>Đã trả:</strong> {dinhDangTien(booking.paidAmount)}</p>
          <p><strong>Còn lại:</strong> {dinhDangTien(booking.remainingAmount)}</p>
          <p><strong>Voucher:</strong> {booking.voucherCode || 'Không áp dụng'}</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="font-black text-slate-950">Dịch vụ đã chọn</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {(booking.services || []).map((service) => `${service.title} (${dinhDangTien(service.priceValue || service.price)})`).join(', ') ||
              'Không có dịch vụ thêm'}
          </p>
        </div>

        <XemTruocQr token={booking.qrToken} />

        {booking.paymentQrUrl ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <p className="mb-3 text-sm font-black text-slate-950">VietQR thanh toán</p>
            <img src={booking.paymentQrUrl} alt="VietQR thanh toán" className="mx-auto w-full max-w-[260px] rounded-xl" />
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={() => onInvoice(booking)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
        >
          Xem hóa đơn
        </button>
        <button
          type="button"
          disabled={!canCheckIn}
          onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_IN)}
          className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-black text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Xác nhận check-in
        </button>
        <button
          type="button"
          disabled={!canCheckOut}
          onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_OUT)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          Xác nhận check-out
        </button>
        <button
          type="button"
          disabled={!canCancel}
          onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CANCELLED)}
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          Hủy đơn
        </button>
      </div>
    </aside>
  );
}

function QuanLyDatPhong() {
  const user = useKhoXacThuc((state) => state.user);
  const [bookings, setBookings] = useState(() => docTatCaDatPhong());
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filteredBookings = useMemo(
    () =>
      bookings
        .filter((booking) => (activeTab === 'all' ? true : booking.bookingStatus === activeTab))
        .filter((booking) => datPhongKhopTimKiem(booking, query)),
    [activeTab, bookings, query],
  );
  const selectedBooking = filteredBookings.find((booking) => booking.id === selectedId) || filteredBookings[0] || null;
  const paidBookings = bookings.filter((booking) => [TRANG_THAI_THANH_TOAN.PAID, TRANG_THAI_THANH_TOAN.DEPOSIT_PAID].includes(booking.paymentStatus));

  const stats = [
    { label: 'Tổng đơn', value: bookings.length, hint: 'Tất cả đơn local demo' },
    { label: 'Chờ thanh toán', value: bookings.filter((booking) => booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID).length },
    { label: 'Đã thanh toán/cọc', value: paidBookings.length },
    { label: 'Đang lưu trú', value: bookings.filter((booking) => booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN).length },
    { label: 'Đã hủy', value: bookings.filter((booking) => booking.bookingStatus === TRANG_THAI_DAT_PHONG.CANCELLED).length },
    { label: 'Doanh thu demo', value: dinhDangTien(paidBookings.reduce((sum, booking) => sum + Number(booking.paidAmount || 0), 0)) },
  ];

  const refresh = () => setBookings(docTatCaDatPhong());

  const setStatus = (bookingId, status) => {
    capNhatTrangThaiDatPhong(bookingId, status);
    setSelectedId(bookingId);
    refresh();
  };

  const openInvoice = (booking) => {
    const invoiceUrl = URL.createObjectURL(new Blob([taoHtmlHoaDon(booking)], { type: 'text/html;charset=utf-8' }));
    window.open(invoiceUrl, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(invoiceUrl), 30000);
  };

  if (user?.role !== 'admin') {
    return (
      <main className="history-page-bg flex-1">
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="surface-card p-8 text-center">
            <span className="eyebrow">Admin</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Bạn không có quyền truy cập trang quản lý</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Trang này chỉ dành cho tài khoản có vai trò admin. Nếu cần thử giao diện quản lý, hãy đổi role tài khoản trong database sang admin.
            </p>
            <Link to="/" className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700">
              Về trang chủ
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="history-page-bg flex-1">
      <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Admin</span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Quản lý đặt phòng</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Theo dõi giữ chỗ, thanh toán, QR nhận phòng và thao tác check-in/check-out trong một màn hình.
            </p>
          </div>

          <label className="field-shell flex w-full max-w-md items-center px-4 py-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm mã đơn, mã HD, khách, email, khách sạn"
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {stats.map((item) => (
            <TheThongKe key={item.label} {...item} />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm shadow-slate-950/[0.03]">
          {TAB_QUAN_TRI.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                activeTab === tab.key ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-brand-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="grid gap-4">
            {filteredBookings.map((booking) => (
              <TheDatPhong
                key={booking.id}
                booking={booking}
                selected={selectedBooking?.id === booking.id}
                onSelect={setSelectedId}
              />
            ))}

            {!filteredBookings.length ? (
              <div className="surface-card p-8 text-center text-sm font-bold text-slate-500">
                Không có đơn phù hợp với bộ lọc hiện tại.
              </div>
            ) : null}
          </div>

          <BangChiTiet
            booking={selectedBooking}
            onClear={() => setSelectedId(null)}
            onStatus={setStatus}
            onInvoice={openInvoice}
          />
        </div>
      </section>
    </main>
  );
}

export default QuanLyDatPhong;
