// Admin dashboard: tổng quan doanh thu, đặt phòng và các chỉ số vận hành.
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { layTongQuanQuanTriApi } from '../../services/quanTriApi';
import { dinhDangTien } from '../../utils/dinhDang';

const TRANG_THAI_DAT_PHONG = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  checked_in: 'Đang lưu trú',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
  cancel_requested: 'Chờ duyệt hủy',
};

const LOP_TRANG_THAI_DAT_PHONG = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-100',
  confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  checked_in: 'bg-sky-50 text-sky-700 ring-sky-100',
  completed: 'bg-slate-100 text-slate-700 ring-slate-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-100',
  cancel_requested: 'bg-orange-50 text-orange-700 ring-orange-100',
};

function nhanTrangThaiDatPhong(status) {
  return TRANG_THAI_DAT_PHONG[status] || status || 'Chưa cập nhật';
}

function lopTrangThaiDatPhong(status) {
  return LOP_TRANG_THAI_DAT_PHONG[status] || 'bg-slate-100 text-slate-700 ring-slate-200';
}

function StatCard({ label, value, hint, tone = 'text-slate-950', accent = 'bg-slate-300', icon = '•' }) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.03]">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className={`mt-3 text-3xl font-black ${tone}`}>{value}</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-sm font-black text-slate-700 ring-1 ring-slate-200">
          {icon}
        </span>
      </div>
      {hint ? <p className="mt-2 text-sm font-semibold text-slate-500">{hint}</p> : null}
    </article>
  );
}

function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: layTongQuanQuanTriApi,
    staleTime: 60 * 1000,
  });

  const stats = data?.stats || {};
  const cards = [
    { label: 'Tổng đơn', value: stats.totalBookings || 0, hint: 'Toàn bộ đơn đặt phòng', accent: 'bg-slate-950', icon: 'Đ' },
    { label: 'Cần xử lý', value: stats.pendingBookings || 0, hint: 'Giữ chỗ/chờ duyệt', tone: 'text-rose-600', accent: 'bg-rose-500', icon: '!' },
    { label: 'Đã xác nhận', value: stats.confirmedBookings || 0, hint: 'Sẵn sàng check-in', accent: 'bg-emerald-500', icon: '✓' },
    { label: 'Đang lưu trú', value: stats.checkedInBookings || 0, hint: 'Khách đang ở', accent: 'bg-sky-500', icon: 'IN' },
    { label: 'Khách hàng', value: stats.totalCustomers || 0, hint: `${stats.newCustomers7d || 0} mới trong 7 ngày`, accent: 'bg-indigo-500', icon: 'KH' },
    { label: 'Doanh thu ghi nhận', value: dinhDangTien(stats.paidRevenue || 0), tone: 'text-brand-700', hint: 'Đã thanh toán', accent: 'bg-brand-600', icon: '₫' },
  ];

  if (isLoading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">Đang tải tổng quan...</div>;
  }

  if (isError) {
    return <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-700">Không tải được dữ liệu tổng quan admin.</div>;
  }

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">Tổng quan</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Trung tâm điều hành DieuBel</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              Theo dõi đơn đặt phòng, khách hàng, thanh toán và các yêu cầu cần xử lý trong ngày.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/bookings" className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800">
              Xử lý đơn
            </Link>
            <Link to="/admin/customers" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700">
              Khách hàng
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-black text-slate-950">Đơn mới gần đây</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">Các đơn mới nhất cần admin theo dõi.</p>
          </div>
          <Link to="/admin/bookings" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700">
            Xem tất cả
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full text-left">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-5 py-3">Mã đơn</th>
                <th className="px-5 py-3">Khách hàng</th>
                <th className="px-5 py-3">Phòng</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.recentBookings || []).map((booking) => (
                <tr key={booking.booking_code} className="align-top transition hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <p className="text-sm font-black text-slate-950">{booking.booking_code}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-900">{booking.full_name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{booking.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-900">{booking.hotel_name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{booking.room_name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${lopTrangThaiDatPhong(booking.booking_status)}`}>
                      {nhanTrangThaiDatPhong(booking.booking_status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-black text-brand-700">{dinhDangTien(booking.total_price)}</td>
                </tr>
              ))}
              {!data?.recentBookings?.length ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm font-bold text-slate-500">
                    Chưa có đơn mới.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
