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
    { label: 'Tá»•ng Ä‘Æ¡n', value: stats.totalBookings || 0, hint: 'ToÃ n bá»™ Ä‘Æ¡n Ä‘áº·t phÃ²ng' },
    { label: 'Cáº§n xá»­ lÃ½', value: stats.pendingBookings || 0, hint: 'Giá»¯ chá»—/chá» duyá»‡t', tone: 'text-rose-600' },
    { label: 'ÄÃ£ xÃ¡c nháº­n', value: stats.confirmedBookings || 0, hint: 'Sáºµn sÃ ng check-in' },
    { label: 'Äang lÆ°u trÃº', value: stats.checkedInBookings || 0 },
    { label: 'KhÃ¡ch hÃ ng', value: stats.totalCustomers || 0, hint: `${stats.newCustomers7d || 0} má»›i trong 7 ngÃ y` },
    { label: 'Doanh thu ghi nháº­n', value: dinhDangTien(stats.paidRevenue || 0), tone: 'text-brand-700' },
  ];

  if (isLoading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">Äang táº£i tá»•ng quan...</div>;
  }

  if (isError) {
    return <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-700">KhÃ´ng táº£i Ä‘Æ°á»£c dá»¯ liá»‡u tá»•ng quan admin.</div>;
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Tá»•ng quan</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Trung tÃ¢m Ä‘iá»u hÃ nh DieuBel</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              Admin táº­p trung vÃ o duyá»‡t Ä‘Æ¡n, kiá»ƒm tra khÃ¡ch hÃ ng, xÃ¡c nháº­n thanh toÃ¡n vÃ  theo dÃµi váº­n hÃ nh. CÃ¡c luá»“ng Ä‘áº·t phÃ²ng, voucher vÃ  Ä‘iá»ƒm thÆ°á»Ÿng cá»§a khÃ¡ch Ä‘Æ°á»£c tÃ¡ch khá»i khu vá»±c nÃ y.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/bookings" className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800">
              Xá»­ lÃ½ Ä‘Æ¡n
            </Link>
            <Link to="/admin/customers" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700">
              KhÃ¡ch hÃ ng
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
          <h3 className="text-lg font-black text-slate-950">ÄÆ¡n má»›i gáº§n Ä‘Ã¢y</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {(data?.recentBookings || []).map((booking) => (
            <article key={booking.booking_code} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_1fr_160px_160px]">
              <div>
                <p className="text-sm font-black text-slate-950">{booking.booking_code}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{booking.full_name} Â· {booking.email}</p>
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
        <h3 className="text-lg font-black text-slate-950">SÆ¡ Ä‘á»“ má»Ÿ rá»™ng</h3>
        <div className="mt-4 overflow-x-auto rounded-xl bg-slate-50 p-4 text-sm font-semibold leading-7 text-slate-700">
          <pre className="min-w-[720px] whitespace-pre-wrap">{`AdminLayout
â”œâ”€ Dashboard: thá»‘ng kÃª, cáº£nh bÃ¡o, Ä‘Æ¡n má»›i
â”œâ”€ Bookings: duyá»‡t Ä‘Æ¡n, thanh toÃ¡n, check-in/out, ghi chÃº
â”œâ”€ Customers: xem/sá»­a/khÃ³a/xÃ³a má»m khÃ¡ch hÃ ng
â”œâ”€ Invoices: tra cá»©u vÃ  táº£i hÃ³a Ä‘Æ¡n
â””â”€ Future modules: phÃ²ng, voucher, bÃ¡o cÃ¡o, phÃ¢n quyá»n nhÃ¢n viÃªn`}</pre>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
