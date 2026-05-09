import { useEffect, useMemo, useState } from 'react';
import QuanLyDatPhongBangTongQuan from './QuanLyDatPhong-BangTongQuan';
import QuanLyDatPhongChiTietDon from './QuanLyDatPhong-ChiTietDon';
import QuanLyDatPhongDanhSachDon from './QuanLyDatPhong-DanhSachDon';
import useKhoXacThuc from '../store/khoXacThuc';
import { dinhDangTien } from '../utils/dinhDang';
import {
  PHUONG_THUC_THANH_TOAN,
  TRANG_THAI_DAT_PHONG,
  TRANG_THAI_THANH_TOAN,
  capNhatTrangThaiDatPhong,
  docTatCaDatPhong,
  luuGhiChuAdmin,
  taoHtmlHoaDon,
  xacNhanThanhToanAdmin,
} from '../utils/lichSuDatPhong';
import { laQuanTriVien } from '../utils/phanQuyen';
import {
  capNhatTrangThaiDatPhongAdminApi,
  layTatCaDatPhongAdminApi,
  luuGhiChuAdminApi,
  xacNhanThanhToanAdminApi,
} from '../services/datPhongApi';

const TAB_QUAN_TRI = [
  { key: 'can_xu_ly', label: 'Cần xử lý' },
  { key: 'all', label: 'Tất cả' },
  { key: TRANG_THAI_DAT_PHONG.HOLDING, label: 'Giữ chỗ' },
  { key: TRANG_THAI_DAT_PHONG.CONFIRMED, label: 'Đã xác nhận' },
  { key: TRANG_THAI_DAT_PHONG.CHECKED_IN, label: 'Đang lưu trú' },
  { key: TRANG_THAI_DAT_PHONG.CHECKED_OUT, label: 'Đã trả phòng' },
  { key: TRANG_THAI_DAT_PHONG.CANCELLED, label: 'Đã hủy' },
  { key: TRANG_THAI_DAT_PHONG.NO_SHOW, label: 'No-show' },
];

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
    booking.adminNote,
    booking.latestCustomerFeedback?.content,
    ...(booking.customerFeedbacks || []).map((feedback) => feedback.content),
  ]
    .filter(Boolean)
    .some((item) => String(item).toLowerCase().includes(value));
}

function datPhongKhopTab(booking, activeTab) {
  if (activeTab === 'all') return true;
  if (activeTab === 'can_xu_ly') {
    return (
      booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID ||
      booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING ||
      (booking.paymentStatus === TRANG_THAI_THANH_TOAN.DEPOSIT_PAID && booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED)
    );
  }

  return booking.bookingStatus === activeTab;
}

function datPhongKhopNgay(booking, dateFilter) {
  if (!dateFilter) return true;
  return booking.checkIn === dateFilter || String(booking.createdAt || '').startsWith(dateFilter);
}

function tinhThongKe(bookings) {
  const paidBookings = bookings.filter((booking) => [TRANG_THAI_THANH_TOAN.PAID, TRANG_THAI_THANH_TOAN.DEPOSIT_PAID].includes(booking.paymentStatus));
  const canXuLy = bookings.filter((booking) => datPhongKhopTab(booking, 'can_xu_ly'));

  return [
    { label: 'Tổng đơn', value: bookings.length, hint: 'Tất cả đơn local demo' },
    { label: 'Cần xử lý', value: canXuLy.length, tone: 'text-rose-600', hint: 'Giữ chỗ/chờ thanh toán' },
    { label: 'Đã cọc/đã trả', value: paidBookings.length, tone: 'text-emerald-700' },
    { label: 'Đang lưu trú', value: bookings.filter((booking) => booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN).length },
    { label: 'Đã hủy/no-show', value: bookings.filter((booking) => [TRANG_THAI_DAT_PHONG.CANCELLED, TRANG_THAI_DAT_PHONG.NO_SHOW].includes(booking.bookingStatus)).length },
    { label: 'Doanh thu demo', value: dinhDangTien(paidBookings.reduce((sum, booking) => sum + Number(booking.paidAmount || 0), 0)), tone: 'text-brand-700' },
  ];
}

function taoDongCsv(values) {
  return values.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',');
}

function xuatCsv(bookings) {
  const rows = [
    taoDongCsv(['Mã đơn', 'Khách', 'Email', 'Khách sạn', 'Phòng', 'Nhận', 'Trả', 'Trạng thái', 'Thanh toán', 'Tổng', 'Đã trả', 'Còn lại', 'Voucher', 'Ghi chú admin']),
    ...bookings.map((booking) =>
      taoDongCsv([
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
        booking.voucherCode,
        booking.adminNote,
      ]),
    ),
  ];
  const blob = new Blob([`\uFEFF${rows.join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dieubel-dat-phong-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function QuanLyDatPhong() {
  const user = useKhoXacThuc((state) => state.user);
  const [bookings, setBookings] = useState(() => docTatCaDatPhong());
  const [activeTab, setActiveTab] = useState('can_xu_ly');
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [notice, setNotice] = useState('');

  const filteredBookings = useMemo(
    () =>
      bookings
        .filter((booking) => datPhongKhopTab(booking, activeTab))
        .filter((booking) => datPhongKhopNgay(booking, dateFilter))
        .filter((booking) => datPhongKhopTimKiem(booking, query)),
    [activeTab, bookings, dateFilter, query],
  );
  const selectedBooking = filteredBookings.find((booking) => booking.id === selectedId) || filteredBookings[0] || null;
  const stats = useMemo(() => tinhThongKe(bookings), [bookings]);

  const refresh = async () => {
    try {
      const data = await layTatCaDatPhongAdminApi();
      setBookings(data);
    } catch {
      setBookings(docTatCaDatPhong());
    }
  };

  useEffect(() => {
    if (laQuanTriVien(user)) {
      refresh();
    }
  }, [user?.id, user?.email, user?.role]);

  const handleStatus = async (bookingId, status) => {
    try {
      const data = await capNhatTrangThaiDatPhongAdminApi(bookingId, status);
      setBookings(data);
    } catch {
      capNhatTrangThaiDatPhong(bookingId, status);
      setBookings(docTatCaDatPhong());
    }
    setSelectedId(bookingId);
    setNotice('Đã cập nhật trạng thái đơn.');
  };

  const handlePayment = async (bookingId, method) => {
    try {
      const data = await xacNhanThanhToanAdminApi(bookingId, method);
      setBookings(data);
    } catch {
      xacNhanThanhToanAdmin(bookingId, method);
      setBookings(docTatCaDatPhong());
    }
    setSelectedId(bookingId);
    setNotice(method === PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT ? 'Đã xác nhận khách đã cọc.' : 'Đã xác nhận khách thanh toán đủ.');
  };

  const handleSaveNote = async (bookingId, note) => {
    try {
      const data = await luuGhiChuAdminApi(bookingId, note);
      setBookings(data);
    } catch {
      luuGhiChuAdmin(bookingId, note);
      setBookings(docTatCaDatPhong());
    }
    setSelectedId(bookingId);
    setNotice('Đã lưu ghi chú admin.');
  };

  const openInvoice = (booking) => {
    const invoiceUrl = URL.createObjectURL(new Blob([taoHtmlHoaDon(booking)], { type: 'text/html;charset=utf-8' }));
    window.open(invoiceUrl, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(invoiceUrl), 30000);
  };

  if (!laQuanTriVien(user)) {
    return (
      <main className="history-page-bg flex-1">
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="surface-card p-8 text-center">
            <span className="eyebrow">Admin</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Bạn không có quyền hạn này</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Tài khoản khách hàng vẫn sử dụng được các chức năng đặt phòng, nhưng không thể vào khu vực quản trị.
            </p>
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
              Danh sách đơn compact, thao tác thanh toán, check-in/check-out, ghi chú nội bộ và xuất CSV.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => xuatCsv(filteredBookings)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
            >
              Xuất CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setDateFilter('');
                setActiveTab('can_xu_ly');
                setNotice('');
              }}
              className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Làm mới lọc
            </button>
          </div>
        </div>

        <div className="mt-8">
          <QuanLyDatPhongBangTongQuan stats={stats} />
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/[0.03]">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <label className="field-shell flex items-center px-4 py-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm mã đơn, mã HD, khách, email, khách sạn, ghi chú"
                className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
              />
            </label>
            <label className="field-shell flex items-center px-4 py-3">
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="w-full bg-transparent text-sm font-semibold outline-none"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
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
        </div>

        {notice ? (
          <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {notice}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
          <QuanLyDatPhongDanhSachDon bookings={filteredBookings} selectedId={selectedBooking?.id} onSelect={setSelectedId} />

          <QuanLyDatPhongChiTietDon
            booking={selectedBooking}
            onClear={() => setSelectedId(null)}
            onStatus={handleStatus}
            onPayment={handlePayment}
            onInvoice={openInvoice}
            onSaveNote={handleSaveNote}
          />
        </div>
      </section>
    </main>
  );
}

export default QuanLyDatPhong;
