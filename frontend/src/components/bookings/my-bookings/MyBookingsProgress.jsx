// Chức năng: Thanh tiến trình trạng thái của một đơn đặt phòng.
import { TRANG_THAI_DAT_PHONG, TRANG_THAI_THANH_TOAN } from '../../../utils/lichSuDatPhong';

const CAC_BUOC = ['Giữ chỗ', 'Thanh toán', 'Xác nhận', 'Nhận phòng', 'Trả phòng'];

function layTrangThaiBuoc(booking, index) {
  const daThanhToan = [TRANG_THAI_THANH_TOAN.PAID, TRANG_THAI_THANH_TOAN.DEPOSIT_PAID].includes(booking.paymentStatus);
  const daXacNhan = [
    TRANG_THAI_DAT_PHONG.CONFIRMED,
    TRANG_THAI_DAT_PHONG.CHECKED_IN,
    TRANG_THAI_DAT_PHONG.CHECKED_OUT,
  ].includes(booking.bookingStatus);
  const daNhanPhong = booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN || booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_OUT;
  const daXacMinhNhanPhong = Boolean(booking.frontdeskVerifiedAt);
  const daTraPhong = booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_OUT;

  if (index === 0) return 'done';
  if (index === 1) return daThanhToan ? 'done' : 'current';
  if (index === 2) {
    if (daXacNhan) return 'done';
    return daThanhToan ? 'current' : 'pending';
  }
  if (index === 3) {
    if (daTraPhong || (daNhanPhong && daXacMinhNhanPhong)) return 'done';
    if (daNhanPhong && !daXacMinhNhanPhong) return 'half';
    return daXacNhan ? 'current' : 'pending';
  }
  if (index === 4) {
    if (daTraPhong) return 'done';
    if (daNhanPhong && daXacMinhNhanPhong) return 'current';
    return 'pending';
  }

  return 'pending';
}

export default function MyBookingsProgress({ booking }) {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-5">
        {CAC_BUOC.map((label, index) => {
          const trangThai = layTrangThaiBuoc(booking, index);
          const daQua = trangThai === 'done';
          const hienTai = trangThai === 'current';
          const moMotPhan = trangThai === 'half';

          return (
            <div key={label} className="flex items-center gap-2 sm:block">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black sm:mx-auto transition-colors duration-300 ${
                  daQua
                    ? 'bg-emerald-50 text-emerald-600'
                    : hienTai
                      ? 'bg-brand-600 text-white shadow-[0_0_0_4px_rgba(var(--brand-500),0.1)]'
                      : moMotPhan
                        ? 'text-white shadow-[0_0_0_4px_rgba(var(--brand-500),0.08)]'
                        : 'bg-slate-100 text-slate-400'
                }`}
                style={moMotPhan ? { background: 'linear-gradient(90deg, #ff385c 50%, #e2e8f0 50%)' } : undefined}
              >
                {daQua ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <p className={`text-xs font-bold sm:mt-2 sm:text-center ${daQua ? 'text-emerald-700' : hienTai || moMotPhan ? 'text-brand-700' : 'text-slate-400'}`}>
                {moMotPhan ? 'Đã mở nhận phòng' : label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
