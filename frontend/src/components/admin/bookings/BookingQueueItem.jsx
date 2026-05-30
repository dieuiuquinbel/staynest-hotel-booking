// Chức năng: Hiển thị một dòng đơn trong hàng đợi quản lý đặt phòng.
// Thẻ đại diện cho một đơn trong hàng đợi công việc của quản lý — phiên bản nâng cấp.
import { dinhDangNgay, dinhDangTien } from '../../../utils/dinhDang';
import { MAU_TRANG_THAI_DAT_PHONG, MAU_TRANG_THAI_THANH_TOAN } from './bookingConstants';
import { nhanDatPhong, nhanThanhToan, tomTatHanhDong, laDonNhanPhongHomNay, tinhSoNgayChoDuyet } from './bookingHelpers';
import { BadgeDatPhong } from './BookingShared';

export default function BookingQueueItem({ booking, selected, isSelected, onSelect, onClick }) {
  const selectedState = selected ?? isSelected;
  const handleSelect = onSelect || onClick;
  const summary = tomTatHanhDong(booking);
  const isUrgent = laDonNhanPhongHomNay(booking)
    || booking.bookingStatus === 'cancel_requested'
    || booking.refundRequest?.status === 'pending';

  return (
    <button
      type="button"
      onClick={handleSelect}
      className={`w-full rounded-2xl border px-5 py-5 text-left transition-all duration-150 active:scale-[0.99] ${
        selectedState
          ? 'border-sky-400 bg-sky-50/50 shadow-md ring-2 ring-sky-100'
          : isUrgent
            ? 'border-rose-200 bg-white hover:border-rose-300 hover:bg-rose-50/40'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40'
      }`}
    >
      {/* Top row: booking code + badges */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isUrgent && !selectedState ? (
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500 animate-pulse" />
            ) : null}
            <p className="break-all font-mono text-sm font-black tracking-wider text-slate-800">
              {booking.bookingCode || booking.id}
            </p>
          </div>
          <p className="mt-1.5 text-base font-black text-slate-900">{booking.guestName}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{booking.hotel_name} · {booking.room_name}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <BadgeDatPhong tone={MAU_TRANG_THAI_DAT_PHONG[booking.bookingStatus]}>
            {nhanDatPhong(booking.bookingStatus)}
          </BadgeDatPhong>
          <BadgeDatPhong tone={MAU_TRANG_THAI_THANH_TOAN[booking.paymentStatus]}>
            {nhanThanhToan(booking.paymentStatus)}
          </BadgeDatPhong>
        </div>
      </div>

      {/* Bottom row: action needed + dates + money */}
      <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3 border border-slate-100">
        <div className="border-r border-slate-200/70 pr-2 last:border-0 sm:block flex justify-between items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Nghiệp vụ lễ tân</p>
          <p className={`mt-1 text-sm font-black ${summary.tone} leading-tight`}>{summary.label}</p>
          {summary.hint ? (
            <p className="mt-1 text-[11px] font-bold text-slate-400 leading-snug">{summary.hint}</p>
          ) : null}
        </div>
        <div className="border-r border-slate-200/70 pr-2 last:border-0 sm:block flex justify-between items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Thời gian lưu trú</p>
          <p className="mt-1 text-sm font-black text-slate-800">Check-in: {dinhDangNgay(booking.checkIn)}</p>
          <p className="mt-0.5 text-xs font-bold text-slate-500">Check-out: {dinhDangNgay(booking.checkOut)}</p>
        </div>
        <div className="pr-2 sm:block flex justify-between items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Đối soát tài chính</p>
          <p className="mt-1 text-sm font-black text-slate-900">{dinhDangTien(booking.totalPrice)}</p>
          <p className="mt-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded w-fit">Đã nhận: {dinhDangTien(booking.paidAmount)}</p>
        </div>
        {booking.refundRequest?.status === 'pending' ? (
          <div className="col-span-full flex items-center gap-2 pt-2.5 border-t border-slate-200 mt-1">
            <span className="rounded-full bg-rose-100 px-3 py-1 text-[10px] font-black text-rose-700">
              Yêu cầu hoàn chờ duyệt {tinhSoNgayChoDuyet(booking.refundRequest)} ngày
            </span>
            {booking.refundRequest.refundAmount ? (
              <span className="text-xs font-black text-emerald-700">
                Phê duyệt hoàn: {dinhDangTien(booking.refundRequest.refundAmount)}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </button>
  );
}
