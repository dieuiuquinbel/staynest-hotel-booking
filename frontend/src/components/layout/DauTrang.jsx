// Chức năng: Header và điều hướng chính cho trang khách hàng.
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import useKhoXacThuc from '../../store/khoXacThuc';
import { taoDuongDanDangNhapChuyenHuong, taoDuongDanDangKyChuyenHuong } from '../../utils/duongDan';

function DauTrang() {
  const location = useLocation();
  const user = useKhoXacThuc((state) => state.user);
  const previousUserId = useRef(user?.id || null);
  const [welcomeUser, setWelcomeUser] = useState(null);
  const authRedirect = new URLSearchParams(location.search).get('redirect');
  const currentPath = location.pathname === '/auth' ? authRedirect || '/' : `${location.pathname}${location.search}`;
  const firstName = user?.full_name?.split(' ').at(-1) || 'bạn';

  useEffect(() => {
    if (user?.id && previousUserId.current !== user.id) {
      setWelcomeUser(user);
      const timer = window.setTimeout(() => setWelcomeUser(null), 3200);
      previousUserId.current = user.id;
      return () => window.clearTimeout(timer);
    }

    if (!user) {
      previousUserId.current = null;
    }

    return undefined;
  }, [user]);

  const navClass = ({ isActive }) =>
    `rounded-full px-4 py-2.5 text-[15px] font-bold transition ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-[#6a6a6a] hover:bg-[#fff4f6] hover:text-[#222222]'
    }`;

  return (
    <>
      <header className="premium-header">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="premium-logo">DB</div>
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-normal text-brand-600">DieuBel</p>
              <p className="hidden truncate text-xs font-normal text-[#6a6a6a] sm:block">Căn hộ, khách sạn, resort</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-[#eadfe2] bg-white/78 p-1 text-sm shadow-[0_16px_50px_-42px_rgba(36,31,33,0.55)] lg:flex">
            <NavLink to="/" className={navClass}>
              Trang chủ
            </NavLink>
            <NavLink to="/rooms" className={navClass}>
              Tìm chỗ ở
            </NavLink>
            {user ? (
              <>
                <NavLink to="/my-bookings" className={navClass}>
                  Đặt chỗ của tôi
                </NavLink>
                <NavLink to="/history" className={navClass}>
                  Lịch sử
                </NavLink>
                <NavLink to="/me" className={navClass}>
                  Tôi
                </NavLink>
              </>
            ) : null}
          </nav>

          {user ? (
            <Link
              to="/me"
              className="rounded-2xl border border-[#eadfe2] bg-white/90 px-4 py-2 text-right shadow-[0_16px_45px_-38px_rgba(36,31,33,0.45)] transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50/45 focus:outline-none focus:ring-4 focus:ring-brand-100"
            >
              <p className="text-xs font-medium text-[#6a6a6a]">Đã đăng nhập</p>
              <p className="text-sm font-semibold text-[#222222]">Xin chào, {firstName}</p>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to={taoDuongDanDangNhapChuyenHuong(currentPath)}
                className="btn-secondary"
              >
                Đăng nhập
              </Link>
              <Link
                to={taoDuongDanDangKyChuyenHuong(currentPath)}
                className="btn-primary hidden sm:inline-flex"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto border-t border-[#eadfe2] px-4 py-2 text-sm sm:px-6 lg:hidden">
          <NavLink to="/" className={navClass}>
            Trang chủ
          </NavLink>
          <NavLink to="/rooms" className={navClass}>
            Tìm chỗ ở
          </NavLink>
          {user ? (
            <>
              <NavLink to="/my-bookings" className={navClass}>
                Đặt chỗ
              </NavLink>
              <NavLink to="/me" className={navClass}>
                Tôi
              </NavLink>
            </>
          ) : null}
        </nav>
      </header>

      {welcomeUser ? (
        <div className="surface-card fixed right-4 top-24 z-[80] max-w-sm p-4">
          <p className="text-sm font-semibold text-brand-600">Chào mừng</p>
          <p className="mt-1 text-base font-semibold text-[#222222]">
            Chào mừng {welcomeUser.full_name} quay trở lại DieuBel!
          </p>
          <button
            type="button"
            onClick={() => setWelcomeUser(null)}
            className="btn-secondary mt-3 px-3 py-2 text-xs"
          >
            Đóng
          </button>
        </div>
      ) : null}
    </>
  );
}

export default DauTrang;
