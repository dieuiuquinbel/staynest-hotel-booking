import { useEffect, useState } from 'react';
import { dinhDangTien } from '../utils/dinhDang';
import { PHUONG_THUC_THANH_TOAN, TRANG_THAI_DAT_PHONG, TRANG_THAI_THANH_TOAN } from '../utils/lichSuDatPhong';
import QuanLyDatPhongTienTrinh from './QuanLyDatPhong-TienTrinh';
import { dinhDangNgayGio, nhanKieuDat, nhanTrangThaiDatPhong, nhanTrangThaiThanhToan, thoiGianDatPhong } from './QuanLyDatPhong-TienIch.jsx';

function DongChiTiet({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-slate-950">{value || 'Chưa có'}</p>
    </div>
  );
}

function XemTruocQr({ token }) {
  if (!token) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">
        Chưa có QR nhận phòng. QR sẽ được tạo sau khi admin xác nhận thanh toán hoặc cọc.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
      <div className="grid h-24 w-24 shrink-0 grid-cols-5 grid-rows-5 gap-1 rounded-xl bg-white p-3">
        {Array.from({ length: 25 }).map((_, index) => (
          <span
            key={`${token}-${index}`}
            className={`rounded-[2px] ${(token.charCodeAt(index % token.length) + index) % 3 === 0 ? 'bg-slate-950' : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black text-emerald-800">QR nhận phòng</p>
        <p className="mt-1 break-all text-xs font-bold text-emerald-900">{token}</p>
      </div>
    </div>
  );
}

function nhanLoaiPhanHoi(type) {
  const labels = {
    feedback: 'Phản hồi dịch vụ',
    complaint: 'Khiếu nại đặt phòng',
    payment: 'Vấn đề thanh toán',
    support: 'Cần hỗ trợ thêm',
  };

  return labels[type] || 'Phản hồi';
}

function NhomThaoTacNhanh({
  booking,
  canConfirmPayment,
  canConfirmFull,
  canCheckIn,
  canCheckOut,
  canCancel,
  canNoShow,
  onStatus,
  onPayment,
  onInvoice,
}) {
  const primaryAction =
    canConfirmFull ? 'payment' : canCheckIn ? 'checkin' : canCheckOut ? 'checkout' : canConfirmPayment ? 'deposit' : '';

  const primaryClass = 'bg-brand-600 text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300';
  const secondaryClass = 'border border-slate-300 bg-white text-slate-700 hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400';
  const dangerClass = 'border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400';

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!canConfirmPayment}
          onClick={() => onPayment(booking.id, PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT)}
          className={`rounded-xl px-3 py-3 text-sm font-black transition ${primaryAction === 'deposit' ? primaryClass : secondaryClass}`}
        >
          Xác nhận cọc
        </button>
        <button
          type="button"
          disabled={!canConfirmFull}
          onClick={() => onPayment(booking.id, PHUONG_THUC_THANH_TOAN.ONLINE_FULL)}
          className={`rounded-xl px-3 py-3 text-sm font-black transition ${primaryAction === 'payment' ? primaryClass : secondaryClass}`}
        >
          Thanh toán đủ
        </button>
        <button
          type="button"
          disabled={!canCheckIn}
          onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_IN)}
          className={`rounded-xl px-3 py-3 text-sm font-black transition ${primaryAction === 'checkin' ? primaryClass : secondaryClass}`}
        >
          Check-in
        </button>
        <button
          type="button"
          disabled={!canCheckOut}
          onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_OUT)}
          className={`rounded-xl px-3 py-3 text-sm font-black transition ${primaryAction === 'checkout' ? primaryClass : secondaryClass}`}
        >
          Check-out
        </button>
        <button
          type="button"
          onClick={() => onInvoice(booking)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
        >
          Xem hóa đơn
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!canCancel}
            onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CANCELLED)}
            className={`rounded-xl px-2 py-3 text-xs font-black transition ${dangerClass}`}
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!canNoShow}
            onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.NO_SHOW)}
            className={`rounded-xl px-2 py-3 text-xs font-black transition ${dangerClass}`}
          >
            No-show
          </button>
        </div>
      </div>
    </div>
  );
}

function QuanLyDatPhongChiTietDon({ booking, onClear, onStatus, onPayment, onInvoice, onSaveNote }) {
  const [note, setNote] = useState('');

  useEffect(() => {
    setNote(booking?.adminNote || '');
  }, [booking?.id, booking?.adminNote]);

  if (!booking) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">
        Chọn một đơn ở danh sách bên trái để xem chi tiết và thao tác.
      </aside>
    );
  }

  const originalTotal = Number(booking.originalTotalPrice || Number(booking.totalPrice || 0) + Number(booking.discountAmount || 0));
  const canConfirmPayment = ![TRANG_THAI_THANH_TOAN.PAID, TRANG_THAI_THANH_TOAN.DEPOSIT_PAID].includes(booking.paymentStatus);
  const canConfirmFull = booking.paymentStatus !== TRANG_THAI_THANH_TOAN.PAID;
  const canCheckIn =
    booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED &&
    [TRANG_THAI_THANH_TOAN.PAID, TRANG_THAI_THANH_TOAN.DEPOSIT_PAID].includes(booking.paymentStatus);
  const canCheckOut = booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN;
  const canCancel = ![TRANG_THAI_DAT_PHONG.CHECKED_IN, TRANG_THAI_DAT_PHONG.CHECKED_OUT, TRANG_THAI_DAT_PHONG.CANCELLED].includes(booking.bookingStatus);
  const canNoShow = [TRANG_THAI_DAT_PHONG.HOLDING, TRANG_THAI_DAT_PHONG.CONFIRMED].includes(booking.bookingStatus);
  const customerFeedbacks = booking.customerFeedbacks || [];

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.03] xl:sticky xl:top-28 xl:self-start">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Chi tiết đơn</p>
            <h2 className="mt-2 break-all text-xl font-black text-slate-950">{booking.id}</h2>
            <p className="mt-2 text-sm font-bold text-slate-600">
              {nhanTrangThaiDatPhong(booking)} · {nhanTrangThaiThanhToan(booking)}
            </p>
            <p className="mt-2 text-sm font-black text-brand-700">Còn lại: {dinhDangTien(booking.remainingAmount)}</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-brand-500 hover:text-brand-700"
          >
            Bỏ chọn
          </button>
        </div>

        <NhomThaoTacNhanh
          booking={booking}
          canConfirmPayment={canConfirmPayment}
          canConfirmFull={canConfirmFull}
          canCheckIn={canCheckIn}
          canCheckOut={canCheckOut}
          canCancel={canCancel}
          canNoShow={canNoShow}
          onStatus={onStatus}
          onPayment={onPayment}
          onInvoice={onInvoice}
        />
      </div>

      <div className="mt-5 grid gap-4">
        <QuanLyDatPhongTienTrinh booking={booking} />

        <div className="grid grid-cols-2 gap-3">
          <DongChiTiet label="Trạng thái" value={nhanTrangThaiDatPhong(booking)} />
          <DongChiTiet label="Thanh toán" value={nhanTrangThaiThanhToan(booking)} />
          <DongChiTiet label="Tạo lúc" value={dinhDangNgayGio(booking.createdAt)} />
          <DongChiTiet label="Thanh toán lúc" value={dinhDangNgayGio(booking.paidAt)} />
        </div>

        <section className="rounded-xl bg-slate-50 p-4">
          <p className="font-black text-slate-950">{booking.guestName || 'Khách hàng'}</p>
          <p className="mt-1 break-words text-sm text-slate-500">{booking.guestEmail}</p>
          <p className="mt-1 text-sm text-slate-500">{booking.guests || 1} khách · {booking.rooms || 1} phòng</p>
        </section>

        <section className="rounded-xl bg-slate-50 p-4">
          <p className="font-black text-slate-950">{booking.hotel_name}</p>
          <p className="mt-1 text-sm text-slate-500">{booking.room_name}</p>
          <p className="mt-1 text-sm text-slate-500">{booking.address}</p>
          <p className="mt-2 text-sm font-bold text-slate-700">{nhanKieuDat(booking)} · {thoiGianDatPhong(booking)}</p>
        </section>

        <section className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
          <p><strong>Giá gốc:</strong> {dinhDangTien(originalTotal)}</p>
          <p><strong>Voucher:</strong> {booking.voucherTitle ? `${booking.voucherTitle} (${booking.voucherCode})` : 'Không áp dụng'}</p>
          <p><strong>Giảm voucher:</strong> {dinhDangTien(booking.discountAmount)}</p>
          <p><strong>Tổng cuối:</strong> {dinhDangTien(booking.totalPrice)}</p>
          <p><strong>Đã trả:</strong> {dinhDangTien(booking.paidAmount)}</p>
          <p><strong>Còn lại:</strong> {dinhDangTien(booking.remainingAmount)}</p>
        </section>

        <section className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
          <p><strong>Hạn thanh toán:</strong> {dinhDangNgayGio(booking.paymentDeadline)}</p>
          <p><strong>Mã chuyển khoản:</strong> {booking.paymentCode || booking.transferContent || 'Chưa có'}</p>
          <p><strong>Lý do hủy/no-show:</strong> {booking.cancelReason || 'Chưa có'}</p>
        </section>

        <XemTruocQr token={booking.qrToken} />

        <section className="rounded-xl border border-rose-100 bg-rose-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-rose-900">Phản hồi / khiếu nại khách hàng</p>
              <p className="mt-1 text-xs font-bold text-rose-700">{customerFeedbacks.length} nội dung từ khách</p>
            </div>
            {customerFeedbacks.length ? (
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-rose-700">Cần kiểm tra</span>
            ) : null}
          </div>

          {customerFeedbacks.length ? (
            <div className="mt-3 grid gap-3">
              {customerFeedbacks.map((feedback) => (
                <article key={feedback.id} className="rounded-xl border border-rose-100 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700">
                      {nhanLoaiPhanHoi(feedback.type)}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{dinhDangNgayGio(feedback.createdAt)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-700">{feedback.content}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-xl bg-white px-3 py-3 text-sm font-bold text-slate-500">
              Đơn này chưa có phản hồi hoặc khiếu nại từ khách.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <label className="grid gap-2">
            <span className="text-sm font-black text-slate-950">Ghi chú admin</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              placeholder="Ví dụ: đã gọi khách xác nhận, khách yêu cầu phòng yên tĩnh..."
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none transition focus:border-brand-500"
            />
          </label>
          <button
            type="button"
            onClick={() => onSaveNote(booking.id, note)}
            className="mt-3 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
          >
            Lưu ghi chú
          </button>
        </section>
      </div>

    </aside>
  );
}

export default QuanLyDatPhongChiTietDon;
