import { useState } from 'react';
import { Link } from 'react-router-dom';
import ThePhong from '../components/rooms/ThePhong';
import useKhoXacThuc from '../store/khoXacThuc';
import {
  TRANG_THAI_DAT_PHONG,
  NHAN_TRANG_THAI_DAT_PHONG,
  KIEU_DAT_PHONG,
  NHAN_KIEU_DAT_PHONG,
  NHAN_TRANG_THAI_THANH_TOAN,
  docDatPhongCuaToi,
  luuDanhGiaDatPhong,
} from '../utils/lichSuDatPhong';
import { dinhDangTien } from '../utils/dinhDang';
import { xoaPhongDaXem, docPhongYeuThich, docPhongDaXem } from '../utils/lichSuXemPhong';

const TAB_LICH_SU = [
  { key: 'viewed', label: 'Phòng đã xem' },
  { key: 'favorites', label: 'Phòng đã lưu' },
  { key: 'completed', label: 'Đặt phòng thành công' },
  { key: 'cancelled', label: 'Lịch sử hủy chỗ' },
];

function TheLichSuDatPhong({ booking, reviewDraft, onReviewChange, onSubmitReview }) {
  return (
    <article className="subtle-card grid overflow-hidden md:grid-cols-[220px_minmax(0,1fr)]">
      <img src={booking.image_url} alt={booking.hotel_name} className="h-52 w-full object-cover md:h-full" />
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {NHAN_TRANG_THAI_DAT_PHONG[booking.bookingStatus] || booking.bookingStatus}
          </span>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-brand-700">
            {NHAN_TRANG_THAI_THANH_TOAN[booking.paymentStatus] || booking.paymentStatus}
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">{booking.id}</span>
        </div>

        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{booking.hotel_name}</h2>
        <p className="mt-1 text-sm font-bold text-slate-600">{booking.room_name}</p>
        <p className="mt-2 text-sm leading-7 text-slate-500">{booking.address}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold text-slate-500">Hình thức</p>
            <p className="mt-1 text-sm font-black text-slate-950">{NHAN_KIEU_DAT_PHONG[booking.bookingType] || 'Qua đêm'}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold text-slate-500">Thời gian</p>
            <p className="mt-1 text-sm font-black text-slate-950">{booking.checkIn || 'Chưa chọn'}</p>
            {booking.bookingType === KIEU_DAT_PHONG.DAY_USE ? (
              <p className="mt-1 text-xs font-bold text-slate-500">{booking.timeSlot?.label} · {booking.timeSlot?.time}</p>
            ) : (
              <p className="mt-1 text-xs font-bold text-slate-500">Trả: {booking.checkOut || 'Chưa chọn'}</p>
            )}
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold text-slate-500">Tổng tiền</p>
            <p className="mt-1 text-sm font-black text-brand-700">{dinhDangTien(booking.totalPrice)}</p>
          </div>
        </div>

        <Link
          to={`/rooms/${booking.roomId}`}
          className="mt-5 inline-flex rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-bold text-brand-700 transition hover:bg-sky-50"
        >
          Xem lại khách sạn
        </Link>

        {booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_OUT && !booking.reviewId ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">Viết đánh giá</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)_120px]">
              <select
                value={reviewDraft?.rating || 5}
                onChange={(event) => onReviewChange(booking.id, { ...reviewDraft, rating: event.target.value })}
                className="field-shell px-3 py-3 text-sm font-bold outline-none"
              >
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} sao</option>)}
              </select>
              <input
                value={reviewDraft?.content || ''}
                onChange={(event) => onReviewChange(booking.id, { ...reviewDraft, content: event.target.value })}
                placeholder="Cảm nhận của bạn"
                className="field-shell px-3 py-3 text-sm font-semibold outline-none"
              />
              <button type="button" onClick={() => onSubmitReview(booking)} className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-black text-white">
                Gửi
              </button>
            </div>
          </div>
        ) : booking.reviewId ? (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">Đã đánh giá đơn này.</p>
        ) : null}
      </div>
    </article>
  );
}

function BangTrong({ title, description }) {
  return (
    <div className="surface-card mt-5 p-8 text-center">
      <p className="text-sm font-bold text-brand-700">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
    </div>
  );
}

function LichSu() {
  const user = useKhoXacThuc((state) => state.user);
  const [, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('viewed');
  const [reviewByBooking, setReviewByBooking] = useState({});
  const viewedRooms = docPhongDaXem();
  const favoriteRooms = docPhongYeuThich();
  const bookings = docDatPhongCuaToi(user?.id || user?.email);
  const completedBookings = bookings.filter((booking) =>
    [TRANG_THAI_DAT_PHONG.CONFIRMED, TRANG_THAI_DAT_PHONG.CHECKED_IN, TRANG_THAI_DAT_PHONG.CHECKED_OUT].includes(booking.bookingStatus),
  );
  const cancelledBookings = bookings.filter((booking) =>
    [TRANG_THAI_DAT_PHONG.CANCELLED, TRANG_THAI_DAT_PHONG.NO_SHOW].includes(booking.bookingStatus),
  );

  const refresh = () => setRefreshKey((current) => current + 1);
  const updateReviewDraft = (bookingId, draft) => setReviewByBooking((current) => ({ ...current, [bookingId]: draft }));
  const submitReview = (booking) => {
    luuDanhGiaDatPhong({ booking, ...(reviewByBooking[booking.id] || { rating: 5, content: '' }) });
    refresh();
  };

  const renderContent = () => {
    if (activeTab === 'favorites') {
      return favoriteRooms.length ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3" onClick={refresh}>
          {favoriteRooms.map((room) => <ThePhong key={`favorite-${room.id}`} room={room} layout="vertical" />)}
        </div>
      ) : <BangTrong title="Chưa có phòng đã lưu" description="Nhấn nút yêu thích ở trang chi tiết hoặc thẻ khách sạn để lưu lại." />;
    }

    if (activeTab === 'completed') {
      return completedBookings.length ? (
        <div className="mt-5 grid gap-5">
          {completedBookings.map((booking) => (
            <TheLichSuDatPhong
              key={`completed-${booking.id}`}
              booking={booking}
              reviewDraft={reviewByBooking[booking.id]}
              onReviewChange={updateReviewDraft}
              onSubmitReview={submitReview}
            />
          ))}
        </div>
      ) : <BangTrong title="Chưa có lịch sử đặt phòng thành công" description="Các đơn đã thanh toán/cọc hoặc đã trả phòng sẽ được lưu ở đây." />;
    }

    if (activeTab === 'cancelled') {
      return cancelledBookings.length ? (
        <div className="mt-5 grid gap-5">
          {cancelledBookings.map((booking) => <TheLichSuDatPhong key={`cancelled-${booking.id}`} booking={booking} />)}
        </div>
      ) : <BangTrong title="Chưa có lịch sử hủy chỗ" description="Khi bạn hủy giữ chỗ, đơn sẽ rời khỏi Đặt chỗ của tôi và nằm tại đây." />;
    }

    return viewedRooms.length ? (
      <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3" onClick={refresh}>
        {viewedRooms.map((room) => <ThePhong key={`viewed-${room.id}`} room={room} layout="vertical" />)}
      </div>
    ) : <BangTrong title="Chưa có lịch sử xem" description="Mở một khách sạn bất kỳ để hệ thống lưu vào tab này." />;
  };

  return (
    <main className="history-page-bg flex-1">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Lịch sử</span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Nhật ký phòng và đặt chỗ</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Lưu lại phòng đã xem, phòng đã lưu, các đơn thành công và những đơn đã hủy để bạn kiểm tra lại khi cần.
            </p>
          </div>
          {activeTab === 'viewed' ? (
            <button
              type="button"
              onClick={() => {
                xoaPhongDaXem();
                refresh();
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
            >
              Xóa lịch sử xem
            </button>
          ) : null}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="self-start rounded-2xl border border-slate-200 bg-white p-3 lg:sticky lg:top-28">
            {TAB_LICH_SU.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`mb-2 w-full rounded-xl px-4 py-3 text-left text-sm font-black transition last:mb-0 ${
                  activeTab === tab.key ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20' : 'text-slate-600 hover:bg-sky-50 hover:text-brand-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </aside>

          <section className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-slate-950">{TAB_LICH_SU.find((tab) => tab.key === activeTab)?.label}</h2>
            </div>
            {renderContent()}
          </section>
        </div>
      </section>
    </main>
  );
}

export default LichSu;
