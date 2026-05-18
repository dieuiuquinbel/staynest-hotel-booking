import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import useKhoXacThuc from '../../store/khoXacThuc';

const NAV_ITEMS = [
  { to: '/admin/overview', label: 'Tổng quan', short: 'TQ', hint: 'Dashboard' },
  { to: '/admin/bookings', label: 'Đặt phòng', short: 'DP', hint: 'Duyệt đơn' },
  { to: '/admin/operations', label: 'Vận hành', short: 'VH', hint: 'Check-in/out' },
  { to: '/admin/customers', label: 'Khách hàng', short: 'KH', hint: 'Tài khoản' },
  { to: '/admin/invoices', label: 'Hóa đơn', short: 'HD', hint: 'Thanh toán' },
];

function AdminLayout() {
  const navigate = useNavigate();
  const user = useKhoXacThuc((state) => state.user);
  const clearSession = useKhoXacThuc((state) => state.clearSession);

  const logout = () => {
    clearSession();
    navigate('/auth?mode=login', { replace: true });
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[264px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 bg-white">
          <div className="sticky top-0 flex min-h-screen flex-col p-4">
            <Link to="/admin/overview" className="flex items-center gap-3 rounded-2xl px-2 py-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-sm font-black text-white shadow-sm shadow-brand-500/25">DB</span>
              <span className="min-w-0">
                <span className="block truncate text-lg font-black text-slate-950">DieuBel Admin</span>
                <span className="block truncate text-xs font-bold text-slate-500">Điều hành đặt phòng</span>
              </span>
            </Link>

            <nav className="mt-7 grid gap-2">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                      isActive ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }`
                  }
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-current/10 bg-white/5 text-[11px] font-black">{item.short}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black">{item.label}</span>
                    <span className="block text-[11px] font-bold opacity-70">{item.hint}</span>
                  </span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Tài khoản quản trị</p>
                <p className="mt-2 truncate text-sm font-black text-slate-950">{user?.full_name || user?.username || 'Admin'}</p>
                <p className="mt-1 truncate text-xs font-bold text-slate-500">{user?.email || 'Đăng nhập quản trị'}</p>
              </div>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-xs font-black text-rose-700 transition hover:bg-rose-50"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand-700">Bảng điều khiển</p>
                <h1 className="mt-1 text-xl font-black text-slate-950">Quản trị DieuBel</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700">
                  {user?.username || 'admin'}
                </span>
              </div>
            </div>
          </header>

          <div className="p-5 lg:p-7">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminLayout;
