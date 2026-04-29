import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { cancelMyBooking, readMyBookings } from '../utils/bookingHistory';
import { formatCurrency } from '../utils/format';

function MyBookingsPage() {
  const user = useAuthStore((state) => state.user);
  const [refreshKey, setRefreshKey] = useState(0);
  const bookings = useMemo(() => readMyBookings(user?.id || user?.email), [refreshKey, user]);

  const refresh = () => setRefreshKey((current) => current + 1);

  return (
    <main className="history-page-bg">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Đặt chỗ của tôi</span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Quản lý các phòng bạn đã giữ chỗ
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Theo dõi trạng thái, ngày nhận phòng, ngày trả phòng và mở lại chi tiết khách sạn khi cần.
            </p>
          </div>
          <Link
            to="/rooms"
            className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-700"
          >
            Tìm thêm khách sạn
          </Link>
        </div>

        {bookings.length ? (
          <div className="mt-8 grid gap-5">
            {bookings.map((booking) => (
              <article key={booking.id} className="subtle-card grid overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)_220px]">
                <img
                  src={booking.image_url}
                  alt={booking.hotel_name}
                  className="h-56 w-full object-cover lg:h-full"
                />
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        booking.status === 'Đã hủy'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-brand-700">
                      {booking.id}
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                    {booking.hotel_name}
                  </h2>
                  <p className="mt-1 text-sm font-bold text-slate-600">{booking.room_name}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-500">{booking.address}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-bold text-slate-500">Nhận phòng</p>
                      <p className="mt-1 text-sm font-black text-slate-950">{booking.checkIn || 'Chưa chọn'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-bold text-slate-500">Trả phòng</p>
                      <p className="mt-1 text-sm font-black text-slate-950">{booking.checkOut || 'Chưa chọn'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-bold text-slate-500">Giá mỗi đêm</p>
                      <p className="mt-1 text-sm font-black text-slate-950">
                        {formatCurrency(booking.price_per_night)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid content-between gap-3 border-t border-sky-100 bg-sky-50/60 p-5 lg:border-l lg:border-t-0">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Khách đặt</p>
                    <p className="mt-2 text-sm font-black text-slate-950">{booking.guestName || 'Tài khoản hiện tại'}</p>
                    <p className="mt-1 text-sm text-slate-500">{booking.guestEmail}</p>
                  </div>
                  <div className="grid gap-3">
                    <Link
                      to={`/rooms/${booking.roomId}`}
                      className="rounded-xl border border-sky-200 bg-white px-4 py-3 text-center text-sm font-bold text-brand-700 transition hover:bg-sky-50"
                    >
                      Xem khách sạn
                    </Link>
                    <button
                      type="button"
                      disabled={booking.status === 'Đã hủy'}
                      onClick={() => {
                        cancelMyBooking(booking.id);
                        refresh();
                      }}
                      className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {booking.status === 'Đã hủy' ? 'Đã hủy' : 'Hủy giữ chỗ'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="surface-card mt-8 p-8 text-center">
            <p className="text-sm font-bold text-brand-700">Chưa có đặt chỗ</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
              Bạn chưa giữ chỗ khách sạn nào.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Mở một khách sạn còn phòng, nhấn đặt và giữ chỗ để danh sách hiển thị tại đây.
            </p>
            <Link to="/rooms" className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white">
              Tìm chỗ ở
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default MyBookingsPage;
