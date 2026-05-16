// Admin dashboard: tong quan doanh thu, dat phong va cac chi so van hanh.
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { layTongQuanQuanTriApi } from '../../services/quanTriApi';
import { dinhDangTien } from '../../utils/dinhDang';

function StatCard({ label, value, hint, tone = 'text-slate-950' }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.03]">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-black ${tone}`}>{value}</p>
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
    { label: 'Tổng đơn', value: stats.totalBookings || 0, hint: 'Toàn bộ đơn đặt phòng' },
    { label: 'Cần xử lý', value: stats.pendingBookings || 0, hint: 'Giữ chỗ/chờ duyệt', tone: 'text-rose-600' },
    { label: 'Đã xác nhận', value: stats.confirmedBookings || 0, hint: 'Sẵn sàng check-in' },
    { label: 'Đang lưu trú', value: stats.checkedInBookings || 0 },
    { label: 'Khách hàng', value: stats.totalCustomers || 0, hint: `${stats.newCustomers7d || 0} mới trong 7 ngày` },
    { label: 'Doanh thu ghi nhận', value: dinhDangTien(stats.paidRevenue || 0), tone: 'text-brand-700' },
  ];

  if (isLoading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">Đang tải tổng quan...</div>;
  }

  if (isError) {
    return <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-700">Không tải được dữ liệu tổng quan admin.</div>;
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Tổng quan</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Trung tâm điều hành DieuBel</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              Admin tập trung vào duyệt đơn, kiểm tra khách hàng, xác nhận thanh toán và theo dõi vận hành. Các luồng đặt phòng, voucher và điểm thưởng của khách được tách khỏi khu vực này.
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

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-black text-slate-950">Đơn mới gần đây</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {(data?.recentBookings || []).map((booking) => (
            <article key={booking.booking_code} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_1fr_160px_160px]">
              <div>
                <p className="text-sm font-black text-slate-950">{booking.booking_code}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{booking.full_name} · {booking.email}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{booking.hotel_name}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{booking.room_name}</p>
              </div>
              <p className="text-sm font-bold text-slate-600">{booking.booking_status}</p>
              <p className="text-sm font-black text-brand-700">{dinhDangTien(booking.total_price)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-black text-slate-950">Sơ đồ mở rộng</h3>
        <div className="mt-4 overflow-x-auto rounded-xl bg-slate-50 p-4 text-sm font-semibold leading-7 text-slate-700">
          <pre className="min-w-[720px] whitespace-pre-wrap">{`AdminLayout
├─ Dashboard: thống kê, cảnh báo, đơn mới
├─ Bookings: duyệt đơn, thanh toán, check-in/out, ghi chú
├─ Customers: xem/sửa/khóa/xóa mềm khách hàng
├─ Invoices: tra cứu và tải hóa đơn
└─ Future modules: phòng, voucher, báo cáo, phân quyền nhân viên`}</pre>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
