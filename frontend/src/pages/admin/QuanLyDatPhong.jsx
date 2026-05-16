// Admin dat phong: loc danh sach don, cap nhat trang thai, thanh toan va ghi chu.
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  capNhatTrangThaiDatPhongAdminApi,
  layTatCaDatPhongAdminApi,
  luuGhiChuAdminApi,
  xacNhanThanhToanAdminApi,
} from '../../services/datPhongApi';
import { dinhDangNgay, dinhDangTien } from '../../utils/dinhDang';
import {
  NHAN_TRANG_THAI_DAT_PHONG,
  NHAN_TRANG_THAI_THANH_TOAN,
  PHUONG_THUC_THANH_TOAN,
  TRANG_THAI_DAT_PHONG,
  TRANG_THAI_THANH_TOAN,
} from '../../utils/lichSuDatPhong';
import { dinhDangNgayGio } from './QuanLyDatPhong-TienIch.jsx';

const FILTERS = [
  { key: 'need_action', label: 'Cáº§n xá»­ lÃ½' },
  { key: 'all', label: 'Táº¥t cáº£' },
  { key: TRANG_THAI_DAT_PHONG.HOLDING, label: 'Giá»¯ chá»—' },
  { key: TRANG_THAI_DAT_PHONG.CONFIRMED, label: 'ÄÃ£ xÃ¡c nháº­n' },
  { key: TRANG_THAI_DAT_PHONG.CHECKED_IN, label: 'Äang á»Ÿ' },
  { key: TRANG_THAI_DAT_PHONG.CHECKED_OUT, label: 'ÄÃ£ tráº£ phÃ²ng' },
  { key: TRANG_THAI_DAT_PHONG.CANCELLED, label: 'ÄÃ£ há»§y' },
  { key: TRANG_THAI_DAT_PHONG.NO_SHOW, label: 'No-show' },
];

const STATUS_TONE = {
  [TRANG_THAI_DAT_PHONG.HOLDING]: 'bg-amber-50 text-amber-700',
  [TRANG_THAI_DAT_PHONG.CONFIRMED]: 'bg-emerald-50 text-emerald-700',
  [TRANG_THAI_DAT_PHONG.CHECKED_IN]: 'bg-sky-50 text-sky-700',
  [TRANG_THAI_DAT_PHONG.CHECKED_OUT]: 'bg-slate-100 text-slate-700',
  [TRANG_THAI_DAT_PHONG.CANCELLED]: 'bg-rose-50 text-rose-700',
  [TRANG_THAI_DAT_PHONG.NO_SHOW]: 'bg-rose-50 text-rose-700',
};

const PAYMENT_TONE = {
  [TRANG_THAI_THANH_TOAN.UNPAID]: 'bg-rose-50 text-rose-700',
  [TRANG_THAI_THANH_TOAN.DEPOSIT_PAID]: 'bg-amber-50 text-amber-700',
  [TRANG_THAI_THANH_TOAN.PAID]: 'bg-emerald-50 text-emerald-700',
  [TRANG_THAI_THANH_TOAN.PAY_AT_COUNTER]: 'bg-sky-50 text-sky-700',
};

function Badge({ tone = 'bg-slate-100 text-slate-700', children }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>{children}</span>;
}

function bookingLabel(status) {
  return NHAN_TRANG_THAI_DAT_PHONG[status] || status || 'ChÆ°a cÃ³';
}

function paymentLabel(status) {
  return NHAN_TRANG_THAI_THANH_TOAN[status] || status || 'ChÆ°a cÃ³';
}

function isNeedAction(booking) {
  return (
    booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING ||
    booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID ||
    (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED && booking.paymentStatus === TRANG_THAI_THANH_TOAN.DEPOSIT_PAID)
  );
}

function matchesFilter(booking, filter) {
  if (filter === 'all') return true;
  if (filter === 'need_action') return isNeedAction(booking);
  return booking.bookingStatus === filter;
}

function matchesSearch(booking, query) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return true;

  return [
    booking.id,
    booking.databaseId,
    booking.guestName,
    booking.guestEmail,
    booking.hotel_name,
    booking.room_name,
    booking.city,
    booking.paymentCode,
    booking.transferContent,
    booking.adminNote,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(keyword));
}

function matchesDate(booking, date) {
  if (!date) return true;
  return booking.checkIn === date || booking.checkOut === date || String(booking.createdAt || '').startsWith(date);
}

function buildStats(bookings) {
  const paidBookings = bookings.filter((booking) => [TRANG_THAI_THANH_TOAN.PAID, TRANG_THAI_THANH_TOAN.DEPOSIT_PAID].includes(booking.paymentStatus));

  return [
    { label: 'Tá»•ng Ä‘Æ¡n', value: bookings.length },
    { label: 'Cáº§n xá»­ lÃ½', value: bookings.filter(isNeedAction).length, tone: 'text-rose-600' },
    { label: 'ÄÃ£ xÃ¡c nháº­n', value: bookings.filter((booking) => booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED).length },
    { label: 'Äang á»Ÿ', value: bookings.filter((booking) => booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN).length },
    { label: 'HoÃ n táº¥t', value: bookings.filter((booking) => booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_OUT).length },
    { label: 'Doanh thu', value: dinhDangTien(paidBookings.reduce((sum, booking) => sum + Number(booking.paidAmount || 0), 0)), tone: 'text-brand-700' },
  ];
}

function exportCsv(bookings) {
  const header = [
    'MÃ£ Ä‘Æ¡n',
    'KhÃ¡ch',
    'Email',
    'KhÃ¡ch sáº¡n',
    'PhÃ²ng',
    'Nháº­n phÃ²ng',
    'Tráº£ phÃ²ng',
    'Tráº¡ng thÃ¡i Ä‘áº·t',
    'Tráº¡ng thÃ¡i thanh toÃ¡n',
    'Tá»•ng tiá»n',
    'ÄÃ£ thanh toÃ¡n',
    'CÃ²n láº¡i',
    'Ghi chÃº admin',
  ];
  const rows = bookings.map((booking) => [
    booking.id,
    booking.guestName,
    booking.guestEmail,
    booking.hotel_name,
    booking.room_name,
    booking.checkIn,
    booking.checkOut,
    booking.bookingStatus,
    booking.paymentStatus,
    booking.totalPrice,
    booking.paidAmount,
    booking.remainingAmount,
    booking.adminNote,
  ]);
  const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `admin-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function DetailRow({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-slate-950">{value || 'ChÆ°a cÃ³'}</p>
    </div>
  );
}

function BookingDetail({ booking, note, setNote, onStatus, onPayment, onSaveNote }) {
  if (!booking) {
    return (
      <aside className="rounded-xl border border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">
        Chá»n má»™t Ä‘Æ¡n Ä‘áº·t phÃ²ng Ä‘á»ƒ xem chi tiáº¿t, lá»‹ch sá»­ xá»­ lÃ½ vÃ  thao tÃ¡c duyá»‡t phÃ²ng.
      </aside>
    );
  }

  const canConfirm = booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING;
  const canDeposit = booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID;
  const canFullPay = booking.paymentStatus !== TRANG_THAI_THANH_TOAN.PAID;
  const canCheckIn =
    booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED &&
    [TRANG_THAI_THANH_TOAN.PAID, TRANG_THAI_THANH_TOAN.DEPOSIT_PAID].includes(booking.paymentStatus);
  const canCheckOut = booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN;
  const canCancel = ![TRANG_THAI_DAT_PHONG.CHECKED_OUT, TRANG_THAI_DAT_PHONG.CANCELLED, TRANG_THAI_DAT_PHONG.NO_SHOW].includes(booking.bookingStatus);

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.03] xl:sticky xl:top-24 xl:self-start">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand-700">Chi tiáº¿t Ä‘Æ¡n</p>
          <h3 className="mt-2 break-all text-xl font-black text-slate-950">{booking.id}</h3>
          <p className="mt-1 text-sm font-bold text-slate-500">{booking.guestName} Â· {booking.guestEmail}</p>
        </div>
        <Badge tone={STATUS_TONE[booking.bookingStatus]}>{bookingLabel(booking.bookingStatus)}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button disabled={!canConfirm} onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CONFIRMED)} className="rounded-lg bg-slate-950 px-3 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">
          Duyá»‡t Ä‘Æ¡n
        </button>
        <button disabled={!canDeposit} onClick={() => onPayment(booking.id, PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT)} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">
          XÃ¡c nháº­n cá»c
        </button>
        <button disabled={!canFullPay} onClick={() => onPayment(booking.id, PHUONG_THUC_THANH_TOAN.ONLINE_FULL)} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">
          Thanh toÃ¡n Ä‘á»§
        </button>
        <button disabled={!canCheckIn} onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_IN)} className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm font-black text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">
          Check-in
        </button>
        <button disabled={!canCheckOut} onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_OUT)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-black text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">
          Check-out
        </button>
        <button disabled={!canCancel} onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CANCELLED)} className="rounded-lg border border-rose-200 bg-white px-3 py-2.5 text-sm font-black text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">
          Há»§y Ä‘Æ¡n
        </button>
      </div>

      <section className="mt-5 grid grid-cols-2 gap-2">
        <DetailRow label="KhÃ¡ch sáº¡n" value={booking.hotel_name} />
        <DetailRow label="PhÃ²ng" value={booking.room_name} />
        <DetailRow label="Nháº­n phÃ²ng" value={dinhDangNgay(booking.checkIn)} />
        <DetailRow label="Tráº£ phÃ²ng" value={dinhDangNgay(booking.checkOut)} />
        <DetailRow label="Sá»‘ khÃ¡ch" value={booking.guests} />
        <DetailRow label="Sá»‘ phÃ²ng" value={booking.rooms} />
        <DetailRow label="Tá»•ng tiá»n" value={dinhDangTien(booking.totalPrice)} />
        <DetailRow label="CÃ²n láº¡i" value={dinhDangTien(booking.remainingAmount)} />
        <DetailRow label="MÃ£ thanh toÃ¡n" value={booking.paymentCode || booking.transferContent} />
        <DetailRow label="QR check-in" value={booking.qrToken} />
      </section>

      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-black text-slate-950">Timeline xá»­ lÃ½</p>
        <div className="mt-3 grid gap-2 text-sm">
          {[
            ['Táº¡o Ä‘Æ¡n', booking.createdAt],
            ['XÃ¡c nháº­n', booking.confirmedAt],
            ['Thanh toÃ¡n', booking.paidAt],
            ['Check-in', booking.checkedInAt],
            ['Check-out', booking.checkedOutAt],
            ['Há»§y/no-show', booking.cancelledAt || booking.noShowAt],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-bold text-slate-600">{label}</span>
              <span className="text-right font-black text-slate-950">{dinhDangNgayGio(value)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-black text-slate-950">Lá»‹ch sá»­ tráº¡ng thÃ¡i</p>
        <div className="mt-3 grid gap-2">
          {(booking.statusLogs || []).length ? (
            booking.statusLogs.map((log) => (
              <div key={`${log.id}-${log.changedAt}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <p className="font-black text-slate-950">
                  {bookingLabel(log.oldStatus)} {'->'} {bookingLabel(log.newStatus)}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-500">{dinhDangNgayGio(log.changedAt)} Â· {log.note || 'KhÃ´ng cÃ³ ghi chÃº'}</p>
              </div>
            ))
          ) : (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-500">ChÆ°a cÃ³ log tráº¡ng thÃ¡i.</p>
          )}
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-950">Ghi chÃº admin</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-brand-500" />
        </label>
        <button onClick={() => onSaveNote(booking.id)} className="mt-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700">
          LÆ°u ghi chÃº
        </button>
      </section>
    </aside>
  );
}

function QuanLyDatPhong() {
  const [bookings, setBookings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('need_action');
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [note, setNote] = useState('');

  const filteredBookings = useMemo(
    () => bookings.filter((booking) => matchesFilter(booking, filter)).filter((booking) => matchesSearch(booking, query)).filter((booking) => matchesDate(booking, dateFilter)),
    [bookings, dateFilter, filter, query],
  );
  const selectedBooking = filteredBookings.find((booking) => booking.id === selectedId) || filteredBookings[0] || null;
  const stats = useMemo(() => buildStats(bookings), [bookings]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await layTatCaDatPhongAdminApi();
      setBookings(data);
      setSelectedId((current) => (current && data.some((booking) => booking.id === current) ? current : data[0]?.id || null));
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'KhÃ´ng táº£i Ä‘Æ°á»£c dá»¯ liá»‡u Ä‘áº·t phÃ²ng tá»« MySQL. HÃ£y kiá»ƒm tra backend vÃ  database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setNote(selectedBooking?.adminNote || '');
  }, [selectedBooking?.adminNote, selectedBooking?.id]);

  const runMutation = async (action, successMessage) => {
    if (!selectedBooking) return;
    setError('');
    try {
      const data = await action();
      setBookings(data);
      setSelectedId(selectedBooking.id);
      setNotice(successMessage);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Thao tÃ¡c tháº¥t báº¡i. Dá»¯ liá»‡u khÃ´ng Ä‘Æ°á»£c cáº­p nháº­t.');
    }
  };

  const handleStatus = (bookingId, status) => runMutation(() => capNhatTrangThaiDatPhongAdminApi(bookingId, status), 'ÄÃ£ cáº­p nháº­t tráº¡ng thÃ¡i Ä‘áº·t phÃ²ng.');
  const handlePayment = (bookingId, method) => runMutation(() => xacNhanThanhToanAdminApi(bookingId, method), 'ÄÃ£ xÃ¡c nháº­n thanh toÃ¡n.');
  const handleSaveNote = (bookingId) => runMutation(() => luuGhiChuAdminApi(bookingId, note), 'ÄÃ£ lÆ°u ghi chÃº admin.');

  return (
    <div className="grid gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand-700">Äáº·t phÃ²ng</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Duyá»‡t phÃ²ng vÃ  lá»‹ch sá»­ lÆ°u trÃº</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              Báº£ng nÃ y chá»‰ Ä‘á»c/ghi dá»¯ liá»‡u tháº­t tá»« MySQL qua API admin. Náº¿u backend hoáº·c database lá»—i, há»‡ thá»‘ng sáº½ bÃ¡o lá»—i thay vÃ¬ láº¥y dá»¯ liá»‡u táº¡m.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={refresh} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700">
              Táº£i láº¡i
            </button>
            <button onClick={() => exportCsv(filteredBookings)} className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800">
              Xuáº¥t CSV
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {stats.map((item) => (
          <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
            <p className={`mt-2 text-2xl font-black ${item.tone || 'text-slate-950'}`}>{item.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_190px]">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="TÃ¬m mÃ£ Ä‘Æ¡n, khÃ¡ch, email, khÃ¡ch sáº¡n, mÃ£ thanh toÃ¡n..." className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500" />
          <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button key={item.key} onClick={() => setFilter(item.key)} className={`rounded-lg px-3 py-2 text-sm font-black transition ${filter === item.key ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {notice ? <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">{notice}</div> : null}
      {error ? <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">{error}</div> : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">MÃ£ Ä‘Æ¡n / khÃ¡ch</th>
                  <th className="px-4 py-3">PhÃ²ng</th>
                  <th className="px-4 py-3">Nháº­n - tráº£</th>
                  <th className="px-4 py-3">Thanh toÃ¡n</th>
                  <th className="px-4 py-3">Tráº¡ng thÃ¡i</th>
                  <th className="px-4 py-3">Xá»­ lÃ½</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center font-bold text-slate-500">Äang táº£i dá»¯ liá»‡u Ä‘áº·t phÃ²ng tá»« MySQL...</td></tr>
                ) : filteredBookings.length ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} onClick={() => setSelectedId(booking.id)} className={`cursor-pointer transition hover:bg-sky-50 ${selectedBooking?.id === booking.id ? 'bg-sky-50' : 'bg-white'}`}>
                      <td className="px-4 py-4 align-top">
                        <p className="font-black text-slate-950">{booking.id}</p>
                        <p className="mt-1 font-bold text-slate-700">{booking.guestName}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">{booking.guestEmail}</p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="font-black text-slate-950">{booking.hotel_name}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">{booking.room_name}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">{booking.city || booking.address}</p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="font-black text-slate-950">{dinhDangNgay(booking.checkIn)}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">{dinhDangNgay(booking.checkOut)}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">{booking.guests} khÃ¡ch Â· {booking.rooms} phÃ²ng</p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="font-black text-brand-700">{dinhDangTien(booking.totalPrice)}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">ÄÃ£ tráº£ {dinhDangTien(booking.paidAmount)}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">CÃ²n {dinhDangTien(booking.remainingAmount)}</p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="grid gap-2">
                          <Badge tone={STATUS_TONE[booking.bookingStatus]}>{bookingLabel(booking.bookingStatus)}</Badge>
                          <Badge tone={PAYMENT_TONE[booking.paymentStatus]}>{paymentLabel(booking.paymentStatus)}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedId(booking.id); }} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700">
                          Chi tiáº¿t
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="px-4 py-8 text-center font-bold text-slate-500">KhÃ´ng cÃ³ Ä‘Æ¡n Ä‘áº·t phÃ²ng phÃ¹ há»£p.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <BookingDetail booking={selectedBooking} note={note} setNote={setNote} onStatus={handleStatus} onPayment={handlePayment} onSaveNote={handleSaveNote} />
      </section>
    </div>
  );
}

export default QuanLyDatPhong;
