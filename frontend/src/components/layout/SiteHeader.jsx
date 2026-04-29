import { Link, NavLink, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { buildLoginRedirectPath, buildRegisterRedirectPath } from '../../utils/routes';

function SiteHeader() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const authRedirect = new URLSearchParams(location.search).get('redirect');
  const currentPath = location.pathname === '/auth' ? authRedirect || '/' : `${location.pathname}${location.search}`;
  const firstName = user?.full_name?.split(' ').at(-1) || 'bạn';

  const navClass = ({ isActive }) =>
    `rounded-full px-4 py-2.5 transition ${
      isActive
        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
        : 'text-slate-600 hover:bg-sky-50 hover:text-brand-700'
    }`;

  return (
    <header className="premium-header">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="premium-logo">
            SN
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold tracking-tight text-slate-950">StayNest</p>
            <p className="hidden truncate text-xs font-semibold text-slate-500 sm:block">
              Căn hộ, khách sạn, resort
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1 text-sm font-bold lg:flex">
          <NavLink to="/" className={navClass}>
            Trang chủ
          </NavLink>
          <NavLink to="/rooms" className={navClass}>
            Tìm chỗ ở
          </NavLink>
          <NavLink to="/my-bookings" className={navClass}>
            Đặt chỗ của tôi
          </NavLink>
          <NavLink to="/history" className={navClass}>
            Lịch sử
          </NavLink>
        </nav>

        {user ? (
          <div className="flex items-center gap-2">
            <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-right shadow-sm sm:block">
              <p className="text-xs font-bold text-teal-700">Đã đăng nhập</p>
              <p className="text-sm font-extrabold text-slate-950">Xin chào, {firstName}</p>
            </div>
            <button
              type="button"
              onClick={clearSession}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to={buildLoginRedirectPath(currentPath)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
            >
              Đăng nhập
            </Link>
            <Link
              to={buildRegisterRedirectPath(currentPath)}
              className="hidden rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-700 sm:inline-flex"
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default SiteHeader;
