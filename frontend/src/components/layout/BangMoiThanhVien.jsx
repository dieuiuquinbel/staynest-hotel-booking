// Chức năng: Banner mời khách đăng nhập hoặc tạo tài khoản.
import { Link } from 'react-router-dom';
import useKhoXacThuc from '../../store/khoXacThuc';

function BangMoiThanhVien({ className = '' }) {
  const token = useKhoXacThuc((state) => state.token);

  if (token) return null;

  return (
    <div
      className={`rounded-[24px] border border-[#eadfe2] bg-gradient-to-r from-brand-50 via-white to-[#fff7e8] p-5 shadow-[0_20px_70px_-54px_rgba(146,23,77,0.44)] sm:flex sm:items-center sm:justify-between sm:gap-6 ${className}`}
    >
      <div>
        <p className="text-sm font-extrabold text-brand-700">Thành viên DieuBel</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Đăng nhập để đặt nhanh hơn</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
          Lưu lịch sử xem phòng, quản lý đặt chỗ và nhận gợi ý ưu đãi phù hợp với chuyến đi của bạn.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/auth?mode=login" className="btn-primary px-4 py-3">
            Đăng nhập
          </Link>
          <Link to="/auth?mode=register" className="btn-secondary px-4 py-3">
            Đăng ký
          </Link>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-white bg-white/90 p-5 text-center shadow-[0_16px_48px_-40px_rgba(36,31,33,0.5)] sm:mt-0 sm:w-52">
        <p className="text-4xl font-black text-brand-600">DB</p>
        <p className="mt-2 text-sm font-bold text-slate-600">Ưu đãi riêng cho thành viên</p>
      </div>
    </div>
  );
}

export default BangMoiThanhVien;
