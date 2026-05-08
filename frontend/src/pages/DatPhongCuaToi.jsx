import { useState } from 'react';
import { Link } from 'react-router-dom';
import DatPhongCuaToiQrMinhHoa from './DatPhongCuaToi-QrMinhHoa';
import DatPhongCuaToiThanhToanVietQr from './DatPhongCuaToi-ThanhToanVietQr';
import DatPhongCuaToiTienTrinh from './DatPhongCuaToi-TienTrinh';
import { guiXacNhanThanhToanDemo } from '../services/thanhToanApi';
import useKhoXacThuc from '../store/khoXacThuc';
import {
  TRANG_THAI_DAT_PHONG,
  NHAN_TRANG_THAI_DAT_PHONG,
  KIEU_DAT_PHONG,
  NHAN_KIEU_DAT_PHONG,
  PHUONG_THUC_THANH_TOAN,
  TRANG_THAI_THANH_TOAN,
  NHAN_TRANG_THAI_THANH_TOAN,
  apDungVoucherVaoDatPhong,
  taoHtmlHoaDon,
  tinhGiamGiaVoucher,
  huyDatPhongCuaToi,
  hoanTatDatPhongCuaToi,
  xacNhanThanhToanDemo,
  hetHanDatPhongQuaHan,
  docDatPhongCuaToi,
} from '../utils/lichSuDatPhong';
import { dinhDangTien } from '../utils/dinhDang';
import { danhDauQuaDaDung, docQuaDaDoi, kiemTraDieuKienVoucher, moTaDieuKienVoucher } from '../utils/diemThuong';
import { taoAnhVietQr, taoMaThanhToan } from '../utils/vietQr';

const TAB_DAT_PHONG = [
  { key: 'all', label: 'Tất cả' },
  { key: TRANG_THAI_THANH_TOAN.UNPAID, label: 'Chờ thanh toán' },
  { key: TRANG_THAI_THANH_TOAN.DEPOSIT_PAID, label: 'Đã cọc' },
  { key: TRANG_THAI_THANH_TOAN.PAID, label: 'Đã thanh toán' },
  { key: TRANG_THAI_DAT_PHONG.CHECKED_IN, label: 'Đang lưu trú' },
];

function lopTrangThaiThanhToan(paymentStatus) {
  if (paymentStatus === TRANG_THAI_THANH_TOAN.PAID) return 'bg-emerald-50 text-emerald-700';
  if (paymentStatus === TRANG_THAI_THANH_TOAN.DEPOSIT_PAID) return 'bg-amber-50 text-amber-700';
  return 'bg-rose-50 text-rose-700';
}

function lopTrangThaiDatPhong(bookingStatus) {
  if (bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN) return 'bg-sky-50 text-sky-700';
  if (bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED) return 'bg-brand-50 text-brand-700';
  return 'bg-slate-100 text-slate-700';
}

function locDatPhong(booking, activeTab) {
  if ([TRANG_THAI_DAT_PHONG.CANCELLED, TRANG_THAI_DAT_PHONG.CHECKED_OUT, TRANG_THAI_DAT_PHONG.NO_SHOW].includes(booking.bookingStatus)) {
    return false;
  }

  if (activeTab === 'all') return true;
  if (activeTab === TRANG_THAI_DAT_PHONG.CHECKED_IN) return booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN;
  return booking.paymentStatus === activeTab;
}

function noiDungHanThanhToan(deadline) {
  const diff = new Date(deadline || 0).getTime() - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) return 'Đã quá hạn';
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `Còn ${minutes}:${String(seconds).padStart(2, '0')} để thanh toán`;
}

function DatPhongCuaToi() {
  const user = useKhoXacThuc((state) => state.user);
  const [, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [paymentDraft, setPaymentDraft] = useState(null);
  const [paymentThongBao, setPaymentThongBao] = useState('');
  const [detailBookingId, setDetailBookingId] = useState(null);
  const [voucherByBooking, setVoucherByBooking] = useState({});
  hetHanDatPhongQuaHan(user?.id || user?.email);
  const bookings = docDatPhongCuaToi(user?.id || user?.email);
  const redeemedRewards = docQuaDaDoi().filter((reward) => !reward.used);
  const filteredBookings = bookings.filter((booking) => locDatPhong(booking, activeTab));

  const refresh = () => setRefreshKey((current) => current + 1);

  const openPayment = (booking, method) => {
    const selectedVoucher = redeemedRewards.find((reward) => reward.code === voucherByBooking[booking.id]);

    if (selectedVoucher && !booking.voucherCode) {
      const voucherCheck = kiemTraDieuKienVoucher(selectedVoucher, booking.totalPrice);
      if (!voucherCheck.hopLe) {
        setPaymentThongBao(voucherCheck.lyDo);
        return;
      }
    }

    const discountAmount = booking.voucherCode ? 0 : tinhGiamGiaVoucher(booking.totalPrice, selectedVoucher);
    const previewTotalPrice = Math.max(0, Number(booking.totalPrice || 0) - discountAmount);
    const previewDepositAmount = Math.ceil(previewTotalPrice * 0.1);
    const amount = method === PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT ? previewDepositAmount : previewTotalPrice;
    const paymentCode = taoMaThanhToan(booking.id);
    const paymentQrUrl = taoAnhVietQr({ amount, bookingId: booking.id, paymentMethod: method, paymentCode });

    setPaymentDraft({
      bookingId: booking.id,
      method,
      amount,
      paymentCode,
      paymentQrUrl,
      voucherCode: selectedVoucher?.code || null,
    });
    setPaymentThongBao('');
  };

  const confirmPayment = async (bookingId, method) => {
    const draft = paymentDraft?.bookingId === bookingId ? paymentDraft : null;
    const booking = docDatPhongCuaToi(user?.id || user?.email).find((item) => item.id === bookingId);
    let payableBooking = booking;
    const selectedVoucher = redeemedRewards.find((reward) => reward.code === draft?.voucherCode);

    if (!booking) return;

    if (selectedVoucher && !booking.voucherCode) {
      const voucherCheck = kiemTraDieuKienVoucher(selectedVoucher, booking.totalPrice);
      if (!voucherCheck.hopLe) {
        setPaymentThongBao(voucherCheck.lyDo);
        return;
      }

      const nextBookingsAfterVoucher = apDungVoucherVaoDatPhong(booking.id, selectedVoucher);
      danhDauQuaDaDung(selectedVoucher.code);
      payableBooking = nextBookingsAfterVoucher.find((item) => item.id === booking.id) || booking;
    }

    const paymentCode = draft?.paymentCode || taoMaThanhToan(booking.id);
    const amount = method === PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT ? payableBooking.depositAmount : payableBooking.totalPrice;
    const paymentQrUrl = draft?.paymentQrUrl || taoAnhVietQr({ amount, bookingId: booking.id, paymentMethod: method, paymentCode });
    const nextBookings = xacNhanThanhToanDemo(payableBooking.id, method, {
      paymentCode,
      transferContent: paymentCode,
      paymentQrUrl,
    });
    const confirmedBooking = nextBookings.find((item) => item.id === payableBooking.id) || payableBooking;

    setPaymentDraft(null);
    refresh();

    try {
      await guiXacNhanThanhToanDemo({
        paymentCode,
        transferContent: paymentCode,
        amount,
        paymentMethod: method,
        paymentQrUrl,
        checkInQrToken: confirmedBooking.qrToken,
        booking: confirmedBooking,
      });
      setPaymentThongBao(`Đã gửi email xác nhận và lưu lịch sử CK cho ${paymentCode}.`);
    } catch (error) {
      setPaymentThongBao(error?.response?.data?.message || 'Đã xác nhận demo, nhưng chưa gửi được email/lưu lịch sử CK.');
    }
  };

  const openInvoice = (booking) => {
    const invoiceUrl = URL.createObjectURL(new Blob([taoHtmlHoaDon(booking)], { type: 'text/html;charset=utf-8' }));
    window.open(invoiceUrl, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(invoiceUrl), 30000);
  };


  return (
    <main className="history-page-bg flex-1">
      <section className="mx-auto max-w-[1380px] px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Đặt chỗ của tôi</span>
            <h1 className="mt-3 text-[28px] font-bold tracking-normal text-[#222222]">Quản lý đặt chỗ và thanh toán</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Các phòng vừa giữ chỗ sẽ nằm tại đây để bạn thanh toán online, cọc 10% hoặc hủy giữ chỗ khi không còn nhu cầu.
            </p>
          </div>
          <Link
            to="/rooms"
            className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Tìm thêm khách sạn
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 rounded-[14px] border border-[#dddddd] bg-white p-2">
          {TAB_DAT_PHONG.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.key ? 'bg-[#222222] text-white' : 'text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {paymentThongBao ? (
          <div className="mt-5 rounded-lg border border-[#dddddd] bg-[#f7f7f7] px-4 py-3 text-sm font-medium text-[#222222]">
            {paymentThongBao}
          </div>
        ) : null}

        {filteredBookings.length ? (
          <div className="mt-6 grid gap-5">
            {filteredBookings.map((booking) => {
              const isPaying = paymentDraft?.bookingId === booking.id;
              const payNowAmount =
                paymentDraft?.amount || (paymentDraft?.method === PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT ? booking.depositAmount : booking.totalPrice);
              const paidByCurrentDraft =
                isPaying && [TRANG_THAI_THANH_TOAN.DEPOSIT_PAID, TRANG_THAI_THANH_TOAN.PAID].includes(booking.paymentStatus);
              const canPay = booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID && booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING;
              const hasCheckInQr = Boolean(booking.qrToken);
              const canCustomerConfirmCheckout = booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN && booking.paymentStatus !== TRANG_THAI_THANH_TOAN.UNPAID;
              const selectedVoucher = redeemedRewards.find((reward) => reward.code === voucherByBooking[booking.id]);
              const selectedVoucherCheck = kiemTraDieuKienVoucher(selectedVoucher, booking.totalPrice);
              const selectedVoucherHopLe = !selectedVoucher || selectedVoucherCheck.hopLe;
              const activeVoucher = booking.voucherCode ? booking : selectedVoucher;
              const baseTotalPrice = Number(booking.originalTotalPrice || Number(booking.totalPrice || 0) + Number(booking.discountAmount || 0));
              const previewDiscount = booking.voucherCode
                ? Number(booking.discountAmount || 0)
                : selectedVoucherHopLe
                  ? tinhGiamGiaVoucher(booking.totalPrice, selectedVoucher)
                  : 0;
              const previewTotalPrice = booking.voucherCode
                ? Number(booking.totalPrice || 0)
                : Math.max(0, Number(booking.totalPrice || 0) - previewDiscount);
              const previewDepositAmount = Math.ceil(previewTotalPrice * 0.1);
              const hasVoucherPreview = Boolean(activeVoucher);
              const hasMoneyDiscount = previewDiscount > 0;

              return (
                <article
                  key={booking.id}
                  className="subtle-card grid overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)_300px] xl:grid-cols-[260px_minmax(0,1fr)_330px]"
                >
                  <img src={booking.image_url} alt={booking.hotel_name} className="h-56 w-full object-cover lg:h-full" />

                  <div className="min-w-0 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${lopTrangThaiDatPhong(booking.bookingStatus)}`}>
                        {NHAN_TRANG_THAI_DAT_PHONG[booking.bookingStatus] || booking.bookingStatus}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${lopTrangThaiThanhToan(booking.paymentStatus)}`}>
                        {NHAN_TRANG_THAI_THANH_TOAN[booking.paymentStatus] || booking.paymentStatus}
                      </span>
                      <span className="rounded-full bg-[#f7f7f7] px-3 py-1 text-xs font-medium text-[#222222]">{booking.id}</span>
                      {booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING && booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                          {noiDungHanThanhToan(booking.paymentDeadline)}
                        </span>
                      ) : null}
                    </div>

                    <h2 className="mt-3 text-[22px] font-semibold tracking-normal text-[#222222]">{booking.hotel_name}</h2>
                    <p className="mt-1 text-sm font-bold text-slate-600">{booking.room_name}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-500">{booking.address}</p>

                    <DatPhongCuaToiTienTrinh booking={booking} />

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-bold text-slate-500">Hình thức</p>
                        <p className="mt-1 text-sm font-black text-slate-950">{NHAN_KIEU_DAT_PHONG[booking.bookingType] || 'Qua đêm'}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-bold text-slate-500">Thời gian</p>
                        <p className="mt-1 text-sm font-black text-slate-950">{booking.checkIn || 'Chưa chọn'}</p>
                        {booking.bookingType === KIEU_DAT_PHONG.DAY_USE ? (
                          <p className="mt-1 text-xs font-bold text-slate-500">{booking.timeSlot?.label} · {booking.timeSlot?.time}</p>
                        ) : null}
                      </div>
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-bold text-slate-500">Trả phòng</p>
                        <p className="mt-1 text-sm font-black text-slate-950">{booking.checkOut || 'Chưa chọn'}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-bold text-slate-500">Đã thanh toán</p>
                        <p className="mt-1 text-sm font-black text-slate-950">{dinhDangTien(booking.paidAmount)}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-bold text-slate-500">Còn lại</p>
                        <p className="mt-1 text-sm font-black text-brand-700">{dinhDangTien(booking.remainingAmount)}</p>
                      </div>
                    </div>

                    {hasCheckInQr ? (
                      <div className="mt-5 flex flex-wrap items-center gap-4 rounded-[14px] border border-[#dddddd] bg-[#f7f7f7] p-4">
                        <DatPhongCuaToiQrMinhHoa token={booking.qrToken} />
                        <div>
                          <p className="text-sm font-black text-emerald-800">QR nhận phòng đã sẵn sàng</p>
                          <p className="mt-1 text-sm leading-6 text-emerald-700">
                            Khi đến khách sạn, xuất trình mã này để nhân viên quét check-in.
                          </p>
                          <p className="mt-2 break-all text-xs font-bold text-emerald-900">{booking.qrToken}</p>
                        </div>
                      </div>
                    ) : null}

                    {isPaying ? (
                      <div className="mt-5 rounded-[14px] border border-[#dddddd] bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-black text-slate-950">
                              {paymentDraft.method === PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT ? 'VietQR cọc giữ phòng 10%' : 'VietQR thanh toán toàn bộ'}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              Quét mã để chuyển khoản, sau đó bấm “Tôi đã thanh toán” để hệ thống xác nhận đơn và dùng voucher.
                            </p>
                          </div>
                          <p className="text-2xl font-black text-brand-700">{dinhDangTien(payNowAmount)}</p>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-4">
                          <DatPhongCuaToiThanhToanVietQr
                            amount={payNowAmount}
                            bookingId={booking.id}
                            paymentMethod={paymentDraft.method}
                            paymentCode={paymentDraft.paymentCode}
                          />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl bg-white px-5 py-3 text-sm">
                              <p className="font-black text-slate-950">Nội dung CK</p>
                              <p className="mt-1 break-all font-black text-brand-700">{paymentDraft.paymentCode}</p>
                            </div>
                            {paidByCurrentDraft ? (
                              <div className="rounded-xl bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700">
                                Đã xác nhận demo
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => confirmPayment(booking.id, paymentDraft.method)}
                                className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
                              >
                                Tôi đã thanh toán
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setPaymentDraft(null)}
                              className="rounded-lg border border-[#222222] bg-white px-5 py-3 text-sm font-medium text-[#222222] transition hover:bg-[#f7f7f7]"
                            >
                              Để sau
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {detailBookingId === booking.id ? (
                      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-black text-slate-950">Chi tiết đơn và hóa đơn</p>
                          <button type="button" onClick={() => setDetailBookingId(null)} className="text-sm font-bold text-slate-500 hover:text-brand-700">
                            Đóng
                          </button>
                        </div>
                        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                          <p><strong>Mã đơn:</strong> {booking.id}</p>
                          <p><strong>Mã HD:</strong> {booking.paymentCode || 'Chưa thanh toán'}</p>
                          <p><strong>Khách:</strong> {booking.guestName}</p>
                          <p><strong>Email:</strong> {booking.guestEmail}</p>
                          <p><strong>Dịch vụ:</strong> {(booking.services || []).map((item) => item.title).join(', ') || 'Không có'}</p>
                          <p><strong>Voucher:</strong> {activeVoucher ? `${activeVoucher.voucherTitle || activeVoucher.title} (${activeVoucher.voucherCode || activeVoucher.code})` : 'Chưa áp dụng'}</p>
                          <p><strong>Giá gốc:</strong> {dinhDangTien(baseTotalPrice)}</p>
                          <p><strong>Giảm voucher:</strong> {dinhDangTien(previewDiscount)}</p>
                          <p><strong>Tổng cuối cùng:</strong> {dinhDangTien(previewTotalPrice)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openInvoice(booking)}
                          className="mt-4 rounded-xl bg-brand-600 px-4 py-3 text-sm font-black text-white transition hover:bg-brand-700"
                        >
                          Xem hóa đơn
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex min-w-0 flex-col justify-between gap-4 border-t border-[#dddddd] bg-white p-5 lg:border-l lg:border-t-0">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Tổng cuối cùng</p>
                      <div className="mt-3 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
                        <div className="flex items-center justify-between gap-3 text-slate-600">
                          <span>Giá gốc</span>
                          <span className="font-bold text-slate-900">{dinhDangTien(baseTotalPrice)}</span>
                        </div>
                        {hasVoucherPreview ? (
                          <div className="flex items-start justify-between gap-3 text-slate-600">
                            <span>Voucher</span>
                            <span className="max-w-[150px] text-right font-bold text-slate-900">
                              {activeVoucher.voucherTitle || activeVoucher.title || activeVoucher.voucherCode || activeVoucher.code}
                            </span>
                          </div>
                        ) : null}
                        {hasVoucherPreview ? (
                          <div className="flex items-center justify-between gap-3 text-emerald-700">
                            <span>{hasMoneyDiscount ? 'Đã giảm' : 'Ưu đãi dịch vụ'}</span>
                            <span className="font-black">
                              {hasMoneyDiscount ? `-${dinhDangTien(previewDiscount)}` : 'Đã áp dụng'}
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <p className="mt-3 text-2xl font-black text-slate-950">{dinhDangTien(previewTotalPrice)}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Cọc tối thiểu: <span className="font-black text-slate-700">{dinhDangTien(previewDepositAmount)}</span>
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {canPay && redeemedRewards.length ? (
                        <label className="grid gap-2 rounded-xl bg-white p-3 text-sm">
                          <span className="font-black text-slate-700">Voucher</span>
                          <select
                            value={voucherByBooking[booking.id] || ''}
                            onChange={(event) => setVoucherByBooking((current) => ({ ...current, [booking.id]: event.target.value }))}
                            className="field-shell px-3 py-2 text-sm font-bold outline-none"
                          >
                            <option value="">Không áp dụng</option>
                            {redeemedRewards.map((reward) => (
                              <option
                                key={reward.code}
                                value={reward.code}
                                disabled={!kiemTraDieuKienVoucher(reward, booking.totalPrice).hopLe}
                              >
                                {reward.title}{moTaDieuKienVoucher(reward) ? ` - ${moTaDieuKienVoucher(reward)}` : ''}
                              </option>
                            ))}
                          </select>
                          {selectedVoucher && !selectedVoucherHopLe ? (
                            <span className="text-xs font-bold text-rose-600">{selectedVoucherCheck.lyDo}</span>
                          ) : null}
                          {selectedVoucher && selectedVoucherHopLe && selectedVoucher.discountType === 'service' ? (
                            <span className="text-xs font-bold text-emerald-700">Voucher này tặng dịch vụ, không trừ trực tiếp vào tiền phòng.</span>
                          ) : null}
                        </label>
                      ) : null}
                      <Link
                        to={`/rooms/${booking.roomId}`}
                        className="flex min-h-12 items-center justify-center rounded-lg border border-[#222222] bg-white px-4 py-3 text-center text-sm font-medium text-[#222222] transition hover:bg-[#f7f7f7]"
                      >
                        Xem khách sạn
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDetailBookingId(booking.id)}
                        className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
                      >
                        Chi tiết / hóa đơn
                      </button>
                      <button
                        type="button"
                        disabled={!canPay}
                        onClick={() => openPayment(booking, PHUONG_THUC_THANH_TOAN.ONLINE_FULL)}
                        className="min-h-12 rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-100"
                      >
                        Thanh toán toàn bộ
                      </button>
                      <button
                        type="button"
                        disabled={!canPay}
                        onClick={() => openPayment(booking, PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT)}
                        className="min-h-12 rounded-lg border border-[#222222] bg-white px-4 py-3 text-sm font-medium text-[#222222] transition hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:border-[#dddddd] disabled:text-[#929292]"
                      >
                        Cọc 10%
                      </button>
                      <button
                        type="button"
                        disabled={booking.bookingStatus !== TRANG_THAI_DAT_PHONG.HOLDING}
                        onClick={() => {
                          huyDatPhongCuaToi(booking.id);
                          refresh();
                        }}
                        className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        Hủy giữ chỗ
                      </button>
                      <button
                        type="button"
                        disabled={!canCustomerConfirmCheckout}
                        onClick={() => {
                          hoanTatDatPhongCuaToi(booking.id);
                          refresh();
                        }}
                        className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        Đánh dấu trả phòng
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="surface-card mt-8 p-8 text-center">
            <p className="text-sm font-bold text-brand-700">Không có đơn phù hợp</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Các đơn đang xử lý sẽ hiển thị tại đây.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Đơn đã hủy hoặc đã trả phòng sẽ được chuyển sang tab Lịch sử để bạn xem lại.
            </p>
            <Link to="/rooms" className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white">
              Tìm chỗ ở
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default DatPhongCuaToi;
