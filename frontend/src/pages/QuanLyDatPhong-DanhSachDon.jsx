import { dinhDangTien } from '../utils/dinhDang';
import { MAU_THANH_TOAN, MAU_TRANG_THAI, HuyHieu, lopHuyHieu, nhanKieuDat, nhanTrangThaiDatPhong, nhanTrangThaiThanhToan, thoiGianDatPhong } from './QuanLyDatPhong-TienIch.jsx';

function QuanLyDatPhongDanhSachDon({ bookings, selectedId, onSelect }) {
  if (!bookings.length) {
    return (
      <div className="surface-card p-8 text-center text-sm font-bold text-slate-500">
        Không có đơn phù hợp với bộ lọc hiện tại.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.03]">
      <div className="grid grid-cols-[1.2fr_1.1fr_0.9fr_0.9fr_150px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500 max-lg:hidden">
        <span>Đơn / khách</span>
        <span>Chỗ ở</span>
        <span>Thời gian</span>
        <span>Thanh toán</span>
        <span>Trạng thái</span>
      </div>

      <div className="divide-y divide-slate-100">
        {bookings.map((booking) => {
          const selected = selectedId === booking.id;
          return (
            <button
              key={booking.id}
              type="button"
              onClick={() => onSelect(booking.id)}
              className={`grid w-full gap-4 px-4 py-4 text-left transition hover:bg-sky-50/50 lg:grid-cols-[1.2fr_1.1fr_0.9fr_0.9fr_150px] ${
                selected ? 'bg-sky-50 ring-1 ring-inset ring-brand-200' : 'bg-white'
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">{booking.id}</p>
                <p className="mt-1 truncate text-sm font-bold text-slate-700">{booking.guestName || 'Khách hàng'}</p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-500">{booking.guestEmail || 'Chưa có email'}</p>
                {booking.latestCustomerFeedback ? (
                  <span className="mt-2 inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700">
                    Có phản hồi / khiếu nại
                  </span>
                ) : null}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">{booking.hotel_name}</p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-500">{booking.room_name}</p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-500">{booking.city || booking.address}</p>
              </div>

              <div className="text-sm font-bold text-slate-700">
                <p>{nhanKieuDat(booking)}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{thoiGianDatPhong(booking)}</p>
              </div>

              <div>
                <p className="text-sm font-black text-slate-950">{dinhDangTien(booking.totalPrice)}</p>
                <p className="mt-1 text-xs font-bold text-brand-700">Đã trả {dinhDangTien(booking.paidAmount)}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">Còn {dinhDangTien(booking.remainingAmount)}</p>
              </div>

              <div className="flex flex-wrap items-start gap-2 lg:block lg:space-y-2">
                <HuyHieu tone={lopHuyHieu(MAU_TRANG_THAI, booking.bookingStatus)}>{nhanTrangThaiDatPhong(booking)}</HuyHieu>
                <HuyHieu tone={lopHuyHieu(MAU_THANH_TOAN, booking.paymentStatus)}>{nhanTrangThaiThanhToan(booking)}</HuyHieu>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuanLyDatPhongDanhSachDon;
