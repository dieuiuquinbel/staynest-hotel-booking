// Chức năng: Trang admin quản lý trạng thái đơn đặt phòng.
// Màn điều hành đơn đặt phòng cho quản lý.
// File này chỉ điều phối dữ liệu, chọn tab, lọc đơn và nối sự kiện với các component con.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  capNhatTrangThaiDatPhongAdminApi,
  layTatCaDatPhongAdminApi,
  luuGhiChuAdminApi,
  capNhatYeuCauHoanTienAdminApi,
} from '../../services/datPhongApi';
import BookingDetail from '../../components/admin/bookings/BookingDetail';
import BookingQueueItem from '../../components/admin/bookings/BookingQueueItem';
import CanXuLyPanel from '../../components/admin/bookings/CanXuLyPanel';
import { TABS_DAT_PHONG } from '../../components/admin/bookings/bookingConstants';
import {
  chonTabMacDinh,
  demDonTheoTab,
  khopNgayDatPhong,
  khopTabDatPhong,
  khopTimKiemDatPhong,
  laTabHopLe,
} from '../../components/admin/bookings/bookingHelpers';
import { TRANG_THAI_DAT_PHONG, TRANG_THAI_THANH_TOAN } from '../../utils/lichSuDatPhong';

export default function QuanLyDatPhong() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState('all');
  const [historySubTab, setHistorySubTab] = useState('success');
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [note, setNote] = useState('');
  const [refundDecisionNote, setRefundDecisionNote] = useState('');

  const filteredBookings = useMemo(
    () => bookings
      .filter((booking) => khopTabDatPhong(booking, tab))
      .filter((booking) => {
        if (tab === 'history') {
          if (historySubTab === 'success') {
            return booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_OUT;
          } else {
            return [
              TRANG_THAI_DAT_PHONG.CANCELLED,
              TRANG_THAI_DAT_PHONG.NO_SHOW,
              TRANG_THAI_DAT_PHONG.EXPIRED,
            ].includes(booking.bookingStatus) || booking.paymentStatus === 'refunded';
          }
        }
        return true;
      })
      .filter((booking) => khopTimKiemDatPhong(booking, query))
      .filter((booking) => khopNgayDatPhong(booking, dateFilter))
      .filter((booking) => !statusFilter || booking.bookingStatus === statusFilter),
    [bookings, dateFilter, query, tab, historySubTab, statusFilter],
  );

  const selectedBooking = filteredBookings.find((booking) => booking.id === selectedId) || filteredBookings[0] || null;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await layTatCaDatPhongAdminApi();
      setBookings(data);

      const requestedTab = searchParams.get('tab');
      setTab(laTabHopLe(requestedTab) ? requestedTab : chonTabMacDinh(data));
      setSelectedId((current) => (current && data.some((booking) => booking.id === current) ? current : data[0]?.id || null));
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Không tải được dữ liệu đặt phòng.');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (laTabHopLe(requestedTab)) {
      setTab(requestedTab);
    }
  }, [searchParams]);

  useEffect(() => {
    setSelectedId(null);
  }, [tab, query, dateFilter, statusFilter, historySubTab]);

  useEffect(() => {
    setNote(selectedBooking?.adminNote || '');
    setRefundDecisionNote(selectedBooking?.refundRequest?.adminNote || '');
  }, [selectedBooking?.adminNote, selectedBooking?.id, selectedBooking?.refundRequest?.adminNote]);

  const runBookingMutation = async (action, successMessage) => {
    if (!selectedBooking) return;

    setError('');
    try {
      const data = await action();
      setBookings(data);
      setSelectedId(selectedBooking.id);
      setNotice(successMessage);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Thao tác thất bại. Dữ liệu không được cập nhật.');
    }
  };

  const handleStatus = (bookingId, status, actionNote) =>
    runBookingMutation(() => capNhatTrangThaiDatPhongAdminApi(bookingId, status, actionNote), 'Đã cập nhật trạng thái đặt phòng.');

  const handleSaveNote = (bookingId) =>
    runBookingMutation(() => luuGhiChuAdminApi(bookingId, note), 'Đã lưu ghi chú nội bộ.');

  const handleRefundDecision = async (refundId, status) => {
    setError('');
    try {
      await capNhatYeuCauHoanTienAdminApi(refundId, status, refundDecisionNote);
      await refresh();
      setNotice(status === 'rejected' ? 'Đã từ chối yêu cầu hủy / hoàn tiền.' : 'Đã duyệt yêu cầu hủy / hoàn tiền.');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Không cập nhật được yêu cầu hủy / hoàn tiền.');
    }
  };

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    setSelectedId(null);
    if (nextTab === 'all') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab: nextTab }, { replace: true });
    }
  };

  return (
    <div className="grid gap-5">

      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Vận hành</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">Quản lý đặt phòng và lưu trú</h1>
        </div>
      </section>



      {/* Tabs */}
      <section className="rounded-full border-2 border-slate-200 bg-white p-2 shadow-md flex items-center gap-1.5 overflow-x-auto">
        {TABS_DAT_PHONG.map((item) => {
          const count = demDonTheoTab(bookings, item.key);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleTabChange(item.key)}
              className={`flex-1 rounded-full px-6 py-4 text-center transition-all duration-200 whitespace-nowrap font-black tracking-wide ${
                tab === item.key
                  ? 'bg-slate-950 text-white shadow-md text-base'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950 text-sm'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-base">{item.icon}</span>
                <span className="truncate">{item.label}</span>
                {count > 0 ? (
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm font-black ${
                    tab === item.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {count}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </section>

      {/* Search & Custom Multi-Criteria Filters */}
      <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-md">
        <div className="grid gap-3.5 xl:grid-cols-[1fr_200px_250px_60px] items-center mb-3.5">
          {/* Ô tìm kiếm thông minh */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                <path fillRule="evenodd" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM2 8a6 6 0 1 1 10.89 3.476l4.817 4.817a1 1 0 0 1-1.414 1.414l-4.816-4.816A6 6 0 0 1 2 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kiếm theo mã đặt phòng, tên khách, số điện thoại..."
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-10 text-sm font-black text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>
              </button>
            )}
          </div>

          {/* Chọn ngày nhận/trả cao cấp */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-10 text-xs font-black text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50 cursor-pointer"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-rose-600 transition"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>
              </button>
            )}
          </div>

          {/* Dropdown Trạng thái đặt phòng */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-black text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50 appearance-none animate-fade-in"
          >
            <option value="">Tất cả trạng thái hồ sơ</option>
            <option value={TRANG_THAI_DAT_PHONG.CONFIRMED}>Đã xác nhận (Confirmed)</option>
            <option value={TRANG_THAI_DAT_PHONG.CHECKED_IN}>Đang lưu trú (Checked-in)</option>
            <option value={TRANG_THAI_DAT_PHONG.CHECKED_OUT}>Đã trả phòng (Checked-out)</option>
            <option value={TRANG_THAI_DAT_PHONG.CANCELLED}>Đã hủy đơn (Cancelled)</option>
            <option value={TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED}>Yêu cầu hủy (Cancel Requested)</option>
          </select>

          {/* Nút Reset bộ lọc (Luôn có màu xanh Emerald) */}
          <button
            type="button"
            disabled={!query && !dateFilter && !statusFilter}
            onClick={() => {
              setQuery('');
              setDateFilter('');
              setStatusFilter('');
            }}
            className="group flex h-full items-center justify-center rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 px-5 py-3.5 text-sm font-black transition-all duration-200 hover:bg-emerald-100 hover:border-emerald-300 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-emerald-600 transition-transform duration-500 ease-out group-hover:rotate-180"
            >
              <path fillRule="evenodd" d="M4 2a1 1 0 0 1 1 1v2.101a7.002 7.002 0 0 1 11.601 2.566 1 1 0 1 1-1.885.666A5.002 5.002 0 0 0 5.999 7H9a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm.008 9.057a1 1 0 0 1 1.276.61A5.002 5.002 0 0 0 14.001 13H11a1 1 0 1 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-2.101a7.002 7.002 0 0 1-11.601-2.566 1 1 0 0 1 .61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

      </section>

      {/* Notices */}
      {notice ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-emerald-600">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-black text-emerald-700">{notice}</p>
        </div>
      ) : null}
      {error ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-rose-600">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-black text-rose-700">{error}</p>
        </div>
      ) : null}

      {/* Khi tab = action: render panel chuyên biệt Hoàn tiền / Khiếu nại */}
      {tab === 'action' ? (
        <CanXuLyPanel onGlobalRefresh={refresh} />
      ) : (
        /* Queue + Detail — 2 panel cuộn độc lập */
        <section className="grid gap-5 xl:grid-cols-2 items-start">

          {/* ===== Panel Trái: Hàng đợi công việc (cuộn độc lập) ===== */}
          <div className="rounded-xl border border-slate-200 bg-white flex flex-col" style={{ height: 'calc(100vh - 260px)', minHeight: '480px' }}>

            {/* Header cố định — không cuộn */}
            <div className="flex-none px-4 pt-4 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black text-slate-950">Hàng đợi công việc</h2>
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-400">Chọn đơn để xử lý nhanh.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-black text-slate-600">
                  {filteredBookings.length} đơn
                </span>
              </div>

              {/* Sub-tabs cho tab Lịch sử */}
              {tab === 'history' && (
                <div className="mt-3 flex gap-1 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setHistorySubTab('success')}
                    className={`flex-1 rounded-lg py-1.5 text-center text-xs font-black transition-all ${
                      historySubTab === 'success'
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    ✅ Đơn thành công
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistorySubTab('processed')}
                    className={`flex-1 rounded-lg py-1.5 text-center text-xs font-black transition-all ${
                      historySubTab === 'processed'
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🛠️ Đơn đã xử lý
                  </button>
                </div>
              )}
            </div>

            {/* Danh sách cuộn chứa các đơn đặt phòng */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <span className="text-3xl">📭</span>
                  <p className="mt-2 text-xs font-bold">Không tìm thấy đơn nào phù hợp.</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <BookingQueueItem
                    key={booking.id}
                    booking={booking}
                    isSelected={selectedBooking?.id === booking.id}
                    onClick={() => setSelectedId(booking.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ===== Panel Phải: Chi tiết đơn đang chọn ===== */}
          <BookingDetail
            booking={selectedBooking}
            activeTab={tab}
            note={note}
            refundDecisionNote={refundDecisionNote}
            setNote={setNote}
            setRefundDecisionNote={setRefundDecisionNote}
            onStatus={handleStatus}
            onSaveNote={handleSaveNote}
            onRefundDecision={handleRefundDecision}
          />

        </section>
      )}
    </div>
  );
}
