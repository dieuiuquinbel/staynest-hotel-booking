import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import useKhoXacThuc from '../../store/khoXacThuc';
import { taoDuongDanDangNhapChuyenHuong } from '../../utils/duongDan';
import { laQuanTriVien } from '../../utils/phanQuyen';

function TuyenDuongBaoVe({ yeuCauAdmin = false }) {
  const location = useLocation();
  const token = useKhoXacThuc((state) => state.token);
  const user = useKhoXacThuc((state) => state.user);
  const isAuthReady = useKhoXacThuc((state) => state.isAuthReady);

  if (!isAuthReady) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="surface-card flex min-h-[280px] items-center justify-center p-10">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
        </div>
      </main>
    );
  }

  if (!token) {
    const redirectPath = `${location.pathname}${location.search}`;
    return <Navigate to={taoDuongDanDangNhapChuyenHuong(redirectPath)} replace />;
  }

  if (yeuCauAdmin && !laQuanTriVien(user)) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="surface-card p-8 text-center">
          <p className="text-sm font-bold text-brand-700">Admin</p>
          <h1 className="mt-3 text-2xl font-black text-slate-950">Bạn không có quyền hạn này</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Tài khoản khách hàng vẫn có thể đặt phòng và dùng các trang còn lại, nhưng không thể vào khu vực quản trị.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </main>
    );
  }

  return <Outlet />;
}

export default TuyenDuongBaoVe;
