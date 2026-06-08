// Chức năng: Hiển thị chi tiết đơn đặt phòng và các thao tác admin.
// Panel chi tiết đơn đặt phòng cho quản lý — 2 tab cục bộ, ghi chú gộp vào Tab 1.
import { useState, useEffect } from 'react';
import { dinhDangNgay, dinhDangNgayGio, dinhDangTien } from '../../../utils/dinhDang';
import {
  TRANG_THAI_DAT_PHONG,
  TRANG_THAI_THANH_TOAN,
} from '../../../utils/lichSuDatPhong';
import {
  MAU_TRANG_THAI_DAT_PHONG,
  MAU_TRANG_THAI_HOAN_TIEN,
  MAU_TRANG_THAI_THANH_TOAN,
} from './bookingConstants';
import {
  laDonChoNgayNhanPhong,
  laDonConPhaiThu,
  laDonNhanPhongHomNay,
  nhanDatPhong,
  nhanHoanTien,
  nhanThanhToan,
} from './bookingHelpers';
import { BadgeDatPhong } from './BookingShared';

function IconCheckin() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M3 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-.293.707L12 11.414V15a1 1 0 0 1-.293.707l-2 2A1 1 0 0 1 8 17v-5.586L3.293 6.707A1 1 0 0 1 3 6V3z" clipRule="evenodd" />
    </svg>
  );
}

function IconCheckout() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414 0l-6-6a1 1 0 1 1 1.414-1.414L9 14.586V3a1 1 0 0 1 2 0v11.586l4.293-4.293a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function IconCancel() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414z" clipRule="evenodd" />
    </svg>
  );
}

const MILESTONES = [
  ['Tạo đơn', 'createdAt'],
  ['Xác nhận', 'confirmedAt'],
  ['Thanh toán', 'paidAt'],
  ['Check-in', 'checkedInAt'],
  ['Check-out', 'checkedOutAt'],
  ['Hủy / no-show', 'cancelledAt'],
];

export default function BookingDetail({
  booking,
  note,
  refundDecisionNote,
  activeTab,
  setNote,
  setRefundDecisionNote,
  onStatus,
  onSaveNote,
  onRefundDecision,
}) {
  const [localTab, setLocalTab] = useState('overview');

  // Reset tab về overview khi đổi đơn hàng khác
  useEffect(() => {
    setLocalTab('overview');
  }, [booking?.id]);

  if (!booking) {
    return (
      <aside className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm" style={{ minHeight: '320px' }}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-10 w-10 text-slate-300">
          <path fillRule="evenodd" d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zm0 6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6zm8 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2zm0 6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2z" clipRule="evenodd" />
        </svg>
        <p className="text-sm font-bold text-slate-400">Chọn một đơn ở danh sách bên trái để kiểm tra chi tiết</p>
      </aside>
    );
  }

  const canCheckIn = laDonNhanPhongHomNay(booking) || (laDonConPhaiThu(booking) && !laDonChoNgayNhanPhong(booking));
  const canVerifyLan = booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN && !booking.frontdeskVerifiedAt;
  const canCheckOut = booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN && Boolean(booking.frontdeskVerifiedAt);
  const canCancelHold = booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING
    && booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID;
  const refundRequest = booking.refundRequest || null;
  const canApproveRefund = refundRequest?.status === 'pending';
  const noAction = !canCheckIn && !canVerifyLan && !canCheckOut && !canCancelHold;

  // Timeline
  const milestones = MILESTONES.map(([label, key]) => ({
    label,
    value: booking[key] || (key === 'cancelledAt' ? booking.noShowAt : null),
  }));
  const activeMilestones = milestones.filter((m) => m.value);
  const pendingMilestones = milestones.filter((m) => !m.value);

  return (
    <aside className="rounded-2xl border-2 border-slate-200 bg-white shadow-md overflow-hidden">

      <div className="border-b border-slate-100 p-5 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Thông tin điều hành</p>
            <h3 className="mt-1 font-mono text-lg font-black tracking-wider text-slate-900 break-all">
              {booking.bookingCode || booking.id}
            </h3>
            <p className="mt-1.5 text-base font-black text-slate-900 truncate">{booking.guestName}</p>
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
      </div>

      <div className="border-b border-slate-100 bg-slate-50/50 p-2 flex gap-1.5">
        <button
          type="button"
          onClick={() => setLocalTab('overview')}
          className={`flex-1 rounded-xl py-3.5 text-center font-black transition-all text-sm ${
            localTab === 'overview'
              ? 'bg-slate-950 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          📋 Thông tin phòng
        </button>
        <button
          type="button"
          onClick={() => setLocalTab('finance')}
          className={`flex-1 rounded-xl py-3.5 text-center font-black transition-all relative text-sm ${
            localTab === 'finance'
              ? 'bg-slate-950 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          💳 Tài chính & Hoàn tiền
          {refundRequest?.status === 'pending' && (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>
      </div>

      <div className="p-5">

        {localTab === 'overview' && (
          <div className="grid gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Khách lưu trú</p>
              <div className="mt-2.5 flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-200/80 text-sm">👤</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-800">{booking.guestName}</p>
                  <p className="text-[11px] font-bold text-slate-400 truncate mt-0.5">{booking.guestEmail}</p>
                  {booking.guestPhone && (
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">📞 {booking.guestPhone}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">Nhận phòng 📅</p>
                <p className="mt-1 text-sm font-black text-slate-800">{dinhDangNgay(booking.checkIn)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">Trả phòng 📅</p>
                <p className="mt-1 text-sm font-black text-slate-800">{dinhDangNgay(booking.checkOut)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Chi tiết phòng</p>
              <div className="mt-2.5 grid grid-cols-2 gap-y-3 gap-x-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400">Khách sạn</p>
                  <p className="text-xs font-black text-slate-800 truncate mt-0.5">{booking.hotel_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400">Phòng ở</p>
                  <p className="text-xs font-black text-slate-800 truncate mt-0.5">{booking.room_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400">Quy mô đặt</p>
                  <p className="text-xs font-black text-slate-800 mt-0.5">{booking.rooms} phòng · {booking.guests} khách</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400">Mã phòng gán</p>
                  <p className="text-xs font-black text-slate-800 mt-0.5">{booking.roomCode || 'Hệ thống xếp khi Check-in'}</p>
                </div>
              </div>
            </div>

            {canCheckIn && booking.paymentStatus === 'deposit_paid' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm text-left">
                <div className="flex gap-3">
                  <span className="text-xl shrink-0">⚠</span>
                  <div>
                    <p className="text-xs font-black text-amber-950">Chưa thanh toán đủ tiền phòng!</p>
                    <p className="text-[11px] font-bold text-amber-800 mt-1 leading-relaxed">
                      Đơn này mới thanh toán cọc 10% ({dinhDangTien(booking.paidAmount)}). Lễ tân vui lòng thu nốt <span className="font-black text-amber-950 text-xs">{dinhDangTien(booking.totalPrice - booking.paidAmount)}</span> tiền mặt hoặc chuyển khoản QR tại quầy trước khi giao phòng!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              {canCheckIn && (
                <button
                  onClick={() => {
                    if (booking.paymentStatus === 'deposit_paid') {
                      if (!window.confirm(`Đơn này mới đặt cọc 10%. Bạn xác nhận đã thu đủ số tiền nốt 90% còn thiếu là ${dinhDangTien(booking.totalPrice - booking.paidAmount)} từ khách và tiến hành nhận phòng?`)) {
                        return;
                      }
                    }
                    onStatus(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_IN, 'Admin check-in tại khách sạn');
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-sky-700 active:scale-[.98]"
                >
                  <IconCheckin /> Nhận phòng (Check-in)
                </button>
              )}
              {canVerifyLan && (
                <button
                  onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_IN, 'Admin xác minh nhận phòng qua LAN')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-brand-700 active:scale-[.98]"
                >
                  <IconCheckin /> Xác minh nhận phòng LAN
                </button>
              )}
              {canCheckOut && (
                <button
                  onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_OUT, 'Admin check-out')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-[.98]"
                >
                  <IconCheckout /> Trả phòng (Check-out)
                </button>
              )}
              {canCancelHold && (
                <button
                  onClick={() => {
                    if (window.confirm(`Xác nhận hủy giữ chỗ đơn ${booking.bookingCode || booking.id}?`)) {
                      onStatus(booking.id, TRANG_THAI_DAT_PHONG.CANCELLED, 'Admin hủy giữ chỗ');
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-xs font-black text-rose-700 transition hover:bg-rose-50 active:scale-[.98]"
                >
                  <IconCancel /> Hủy giữ chỗ
                </button>
              )}
              {noAction && activeTab !== 'action' && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 py-3 text-center text-xs font-bold text-slate-400">
                  Đơn đã được xác nhận thanh toán tự động
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 mb-2">Ghi chú nội bộ</p>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                placeholder="Thêm ghi chú lưu ý nội bộ..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none transition focus:border-sky-400 resize-none"
              />
              <button
                onClick={() => onSaveNote(booking.id)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50 active:scale-[.98]"
              >
                💾 Lưu ghi chú
              </button>
            </div>
          </div>
        )}

        {localTab === 'finance' && (
          <div className="grid gap-4">

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.08em] text-slate-400">Tổng tiền</p>
                <p className="mt-1 text-[11px] font-black text-slate-900">{dinhDangTien(booking.totalPrice)}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-3 text-center shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.08em] text-emerald-600">Đã thu</p>
                <p className="mt-1 text-[11px] font-black text-emerald-700">{dinhDangTien(booking.paidAmount)}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-3 text-center shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.08em] text-amber-600">Còn lại</p>
                <p className="mt-1 text-[11px] font-black text-amber-700">{dinhDangTien(booking.remainingAmount)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Phương thức thanh toán</p>
              <div className="mt-2.5 grid grid-cols-2 gap-y-3 gap-x-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400">Hình thức GD</p>
                  <p className="text-xs font-black text-slate-800 mt-0.5">Mã QR</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400">Nền tảng</p>
                  <p className="text-xs font-black text-sky-700 mt-0.5 font-mono tracking-wider">VietQR</p>
                </div>
              </div>
            </div>

            {refundRequest ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3.5 grid gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-rose-950">Yêu cầu hoàn tiền</p>
                    <p className="font-mono text-[10px] font-bold text-rose-500 mt-0.5">{refundRequest.code}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${MAU_TRANG_THAI_HOAN_TIEN[refundRequest.status]}`}>
                    {nhanHoanTien(refundRequest.status)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <div className="rounded-lg bg-white/90 p-2 text-center shadow-sm">
                    <p className="text-[9px] font-bold text-rose-500">Đã cọc</p>
                    <p className="mt-0.5 text-xs font-black text-rose-900">{dinhDangTien(refundRequest.paidAmount)}</p>
                  </div>
                  <div className="rounded-lg bg-white/90 p-2 text-center shadow-sm">
                    <p className="text-[9px] font-bold text-rose-500">Phí hủy (20%)</p>
                    <p className="mt-0.5 text-xs font-black text-rose-900">{dinhDangTien(refundRequest.cancelFeeAmount)}</p>
                  </div>
                  <div className="rounded-lg bg-white/90 p-2 text-center shadow-sm border border-emerald-100">
                    <p className="text-[9px] font-bold text-emerald-600">Hoàn lại (80%)</p>
                    <p className="mt-0.5 text-xs font-black text-emerald-700">{dinhDangTien(refundRequest.refundAmount)}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-white p-2.5 border border-slate-200 text-slate-700">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tài khoản nhận hoàn tiền</p>
                  <p className="text-xs font-black text-slate-800 mt-1">{refundRequest.bankName}</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">Số TK: {refundRequest.bankAccountNumber}</p>
                  <p className="text-xs font-bold text-slate-700">Chủ TK: {refundRequest.bankAccountName}</p>
                </div>

                {refundRequest.reason && (
                  <p className="text-xs font-semibold text-rose-800">
                    Lý do hủy: <span className="italic">{refundRequest.reason}</span>
                  </p>
                )}

                {canApproveRefund && (
                  <div className="grid gap-2 border-t border-rose-200/50 pt-3">
                    <textarea
                      value={refundDecisionNote}
                      onChange={(event) => setRefundDecisionNote(event.target.value)}
                      rows={2}
                      placeholder="Nhập ghi chú phản hồi..."
                      className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-rose-400 resize-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          if (window.confirm(`Duyệt hoàn ${dinhDangTien(refundRequest.refundAmount)} cho khách ${booking.guestName}?`)) {
                            onRefundDecision(refundRequest.id, 'approved');
                          }
                        }}
                        className="rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 active:scale-95 shadow-sm"
                      >
                        ✓ Duyệt hoàn
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Từ chối hoàn tiền cho khách ${booking.guestName}?`)) {
                            onRefundDecision(refundRequest.id, 'rejected');
                          }
                        }}
                        className="rounded-xl border border-rose-300 bg-white py-2.5 text-xs font-black text-rose-700 transition hover:bg-rose-50 active:scale-95"
                      >
                        ✕ Từ chối
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 py-4 text-center text-xs font-bold text-slate-400">
                Không có yêu cầu hủy / hoàn tiền cho đơn này
              </div>
            )}

            {activeMilestones.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3.5">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 mb-3">Dòng thời gian</p>
                <div className="relative pl-5">
                  {activeMilestones.length > 1 && (
                    <div className="absolute left-[4px] top-2 bottom-2 w-px bg-slate-200" />
                  )}
                  <div className="grid gap-3">
                    {activeMilestones.map((m) => (
                      <div key={m.label} className="flex items-start gap-3 text-left relative">
                        <span className="absolute mt-1 h-[9px] w-[9px] rounded-full border-2 border-white bg-emerald-500 shadow-sm" style={{ left: '-20px' }} />
                        <div>
                          <p className="text-xs font-black text-slate-700">{m.label}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{dinhDangNgayGio(m.value)}</p>
                        </div>
                      </div>
                    ))}
                    {pendingMilestones.map((m) => (
                      <div key={m.label} className="flex items-start gap-3 opacity-40 text-left relative">
                        <span className="absolute mt-1 h-[9px] w-[9px] rounded-full border-2 border-slate-300 bg-white" style={{ left: '-20px' }} />
                        <div>
                          <p className="text-xs font-bold text-slate-400">{m.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
