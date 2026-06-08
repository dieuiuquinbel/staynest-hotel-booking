// Chức năng: Trang khách hàng theo dõi, thanh toán và quản lý đơn.
// Trang đặt chỗ của tôi.
// File này cho phép khách theo dõi đơn, tạo QR thanh toán, gửi yêu cầu hủy/hoàn tiền và xem hóa đơn.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MyBookingsQrMock from '../../components/bookings/my-bookings/MyBookingsQrMock';
import MyBookingsVietQr from '../../components/bookings/my-bookings/MyBookingsVietQr';
import MyBookingsProgress from '../../components/bookings/my-bookings/MyBookingsProgress';
import {
  MyBookingsEmpty,
  MyBookingsError,
  MyBookingsHeader,
  MyBookingsLoading,
  MyBookingsTabs,
} from '../../components/bookings/my-bookings/MyBookingsPageParts';
import {
  chuanHoaMaVoucher,
  locDatPhong,
  timVoucherTotNhat,
} from '../../components/bookings/my-bookings/myBookingsHelpers';
import {
  capNhatTrangThaiDatPhongApi,
  taoYeuCauHoanTienApi,
  xacNhanThanhToanDatPhongApi,
} from '../../services/datPhongApi';
import useKhoXacThuc from '../../store/khoXacThuc';
import useKhoThongBao from '../../store/khoThongBao';
import {
  TRANG_THAI_DAT_PHONG,
  NHAN_TRANG_THAI_DAT_PHONG,
  KIEU_DAT_PHONG,
  NHAN_KIEU_DAT_PHONG,
  PHUONG_THUC_THANH_TOAN,
  TRANG_THAI_THANH_TOAN,
  NHAN_TRANG_THAI_THANH_TOAN,
  daDenNgayNhanPhong,
  laDonDatPhongTuongLai,
  moTaHieuLucNhanPhong,
  taoHtmlHoaDon,
  tinhChinhSachHoanTien,
  tinhGiamGiaVoucher,
} from '../../utils/lichSuDatPhong';
import { dinhDangNgay, dinhDangTien } from '../../utils/dinhDang';
import { kiemTraDieuKienVoucher, moTaDieuKienVoucher, danhDauQuaDaDung } from '../../utils/diemThuong';
import { resolveMediaUrl } from '../../utils/media';
import { taoAnhVietQr, taoMaThanhToan } from '../../utils/vietQr';
import { useDatPhongCuaToi } from '../../hooks/useDatPhongCuaToi';
import { useKhoVoucherCuaToi } from '../../hooks/useKhoVoucherCuaToi';
import { moHtmlTrongTabMoi } from '../../utils/moFileHtml';


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

function noiDungHanThanhToan(deadline) {
  const diff = new Date(deadline || 0).getTime() - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) return 'Đã quá hạn';
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `Còn ${minutes}:${String(seconds).padStart(2, '0')} để thanh toán`;
}

function taoFormHoanTienMacDinh(user) {
  return {
    bankName: '',
    bankAccountName: user?.full_name || '',
    bankAccountNumber: '',
    phone: '',
    email: user?.email || '',
    reason: '',
  };
}

function coTheGuiYeuCauHuyHoanTien(booking) {
  if (!booking) return false;
  if (booking.refundRequest) return false;
  if (booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID) return false;

  const daMoNhanPhongChuaXacMinh =
    booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN && !booking.frontdeskVerifiedAt;

  return booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED || daMoNhanPhongChuaXacMinh;
}


function DatPhongCuaToi() {
  const user = useKhoXacThuc((state) => state.user);
  const hienThongBao = useKhoThongBao((state) => state.hienThongBao);
  const [activeTab, setActiveTab] = useState('all');
  const [paymentDraft, setPaymentDraft] = useState(null);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState(null);
  const [paymentUpdateError, setPaymentUpdateError] = useState('');
  const [detailBookingId, setDetailBookingId] = useState(null);
  const [activeQrBooking, setActiveQrBooking] = useState(null);
  const [voucherByBooking, setVoucherByBooking] = useState({});
  const [voucherInputByBooking, setVoucherInputByBooking] = useState({});
  const [voucherAutoOffByBooking, setVoucherAutoOffByBooking] = useState({});
  const [refundDraftBooking, setRefundDraftBooking] = useState(null);
  const [refundForm, setRefundForm] = useState(() => taoFormHoanTienMacDinh(user));
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const { bookings, error: bookingsError, isLoading: bookingsLoading, refresh, setRemoteBookings } = useDatPhongCuaToi(user);
  const [redeemedRewards] = useKhoVoucherCuaToi(user);
  const availableRewards = useMemo(
    () => redeemedRewards.filter((reward) => !reward.used),
    [redeemedRewards],
  );
  const voucherOptions = availableRewards;
  const filteredBookings = bookings.filter((booking) => locDatPhong(booking, activeTab));
  
  const badges = {
    unpaid: bookings.filter(b => locDatPhong(b, 'unpaid')).length,
    deposit: bookings.filter(b => locDatPhong(b, 'deposit')).length,
    paid: bookings.filter(b => locDatPhong(b, 'paid')).length,
    active: bookings.filter(b => locDatPhong(b, 'active')).length,
  };

  useEffect(() => {
    const options = availableRewards;
    if (!options.length || !bookings.length) return;

    const nextVoucherByBooking = {};
    const nextVoucherInputByBooking = {};

    bookings.forEach((booking) => {
      const canPay = booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID && booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING;
      if (!canPay || booking.voucherCode || voucherByBooking[booking.id] || voucherAutoOffByBooking[booking.id]) return;

      const bestVoucher = timVoucherTotNhat(booking.totalPrice, options);
      if (!bestVoucher) return;

      nextVoucherByBooking[booking.id] = bestVoucher.code;
      nextVoucherInputByBooking[booking.id] = bestVoucher.code;
    });

    if (Object.keys(nextVoucherByBooking).length) {
      setVoucherByBooking((current) => ({ ...nextVoucherByBooking, ...current }));
      setVoucherInputByBooking((current) => ({ ...nextVoucherInputByBooking, ...current }));
    }
  }, [bookings, availableRewards, voucherAutoOffByBooking, voucherByBooking]);

  const findVoucherByCode = useCallback((code) => {
    const normalizedCode = chuanHoaMaVoucher(code);
    return voucherOptions.find((reward) => chuanHoaMaVoucher(reward.code) === normalizedCode) || null;
  }, [voucherOptions]);

  const applyVoucher = (booking) => {
    const code = chuanHoaMaVoucher(voucherInputByBooking[booking.id]);

    if (!code) {
      setVoucherByBooking((current) => ({ ...current, [booking.id]: '' }));
      setVoucherAutoOffByBooking((current) => ({ ...current, [booking.id]: true }));
      setPaymentDraft(null);
      hienThongBao('Đã bỏ mã giảm giá khỏi đơn này.', 'info');
      return;
    }

    const voucher = findVoucherByCode(code);
    if (!voucher) {
      hienThongBao('Không tìm thấy mã giảm giá này hoặc mã đã hết hạn.', 'error');
      return;
    }

    const voucherCheck = kiemTraDieuKienVoucher(voucher, booking.totalPrice);
    if (!voucherCheck.hopLe) {
      hienThongBao(voucherCheck.lyDo, 'error');
      return;
    }

    setVoucherByBooking((current) => ({ ...current, [booking.id]: voucher.code }));
    setVoucherInputByBooking((current) => ({ ...current, [booking.id]: voucher.code }));
    setVoucherAutoOffByBooking((current) => ({ ...current, [booking.id]: false }));
    setPaymentDraft(null);
    const bestVoucher = timVoucherTotNhat(booking.totalPrice, voucherOptions);
    hienThongBao(
      bestVoucher?.code === voucher.code
        ? `Đã áp ưu đãi tốt nhất ${voucher.code}.`
        : `Đã áp mã giảm giá ${voucher.code}.`,
      'success'
    );
  };

  const openPayment = (booking, method) => {
    const selectedVoucher = findVoucherByCode(voucherByBooking[booking.id]);

    if (selectedVoucher && !booking.voucherCode) {
      const voucherCheck = kiemTraDieuKienVoucher(selectedVoucher, booking.totalPrice);
      if (!voucherCheck.hopLe) {
        hienThongBao(voucherCheck.lyDo, 'error');
        return;
      }
    }

    const discountAmount = booking.voucherCode ? 0 : tinhGiamGiaVoucher(booking.totalPrice, selectedVoucher);
    const previewTotalPrice = Math.max(0, Number(booking.totalPrice || 0) - discountAmount);
    const previewDepositAmount = Math.ceil(previewTotalPrice * 0.1);
    const amount = method === PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT ? previewDepositAmount : previewTotalPrice;
    const paymentCode = booking.booking_code || taoMaThanhToan(booking.id);
    const paymentQrUrl = taoAnhVietQr({ amount, bookingId: booking.id, paymentMethod: method, paymentCode });

    setPaymentDraft({
      bookingId: booking.id,
      method,
      amount,
      paymentCode,
      paymentQrUrl,
      voucherCode: selectedVoucher?.code || null,
    });
    setPaymentUpdateError('');
  };

  const confirmPayment = useCallback(async (bookingId, method) => {
    const draft = paymentDraft?.bookingId === bookingId ? paymentDraft : null;
    const booking = bookings.find((item) => item.id === bookingId);
    const selectedVoucher = findVoucherByCode(draft?.voucherCode);

    if (!booking) return;

    if (selectedVoucher && !booking.voucherCode) {
      const voucherCheck = kiemTraDieuKienVoucher(selectedVoucher, booking.totalPrice);
      if (!voucherCheck.hopLe) {
        hienThongBao(voucherCheck.lyDo, 'error');
        return;
      }
    }

    const paymentCode = draft?.paymentCode || booking.booking_code || taoMaThanhToan(booking.id);
    let confirmedBooking = booking;

    setConfirmingPaymentId(bookingId);
    setPaymentUpdateError('');

    try {
      const nextBookings = await xacNhanThanhToanDatPhongApi(booking.id, method, paymentCode, selectedVoucher?.code || null);
      setRemoteBookings(nextBookings);
      confirmedBooking = nextBookings.find((item) => item.id === booking.id) || booking;
      if (selectedVoucher?.code) {
        danhDauQuaDaDung(selectedVoucher.code);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Không cập nhật được đơn sau khi quét QR. Vui lòng kiểm tra backend/database.';
      setPaymentUpdateError(message);
      setConfirmingPaymentId(null);
      hienThongBao(message, 'error');
      return;
    }

    setPaymentDraft(null);
    setConfirmingPaymentId(null);
    await refresh();
    hienThongBao(`Đã xác nhận thanh toán thành công cho đơn ${confirmedBooking.booking_code || paymentCode}!`, 'success');
  }, [bookings, findVoucherByCode, hienThongBao, paymentDraft, refresh, setRemoteBookings]);

  // Da xoa auto timer goi confirmPayment

  const openInvoice = (booking) => {
    moHtmlTrongTabMoi(taoHtmlHoaDon(booking));
  };

  const openRefundDraft = (booking) => {
    setRefundDraftBooking(booking);
    setRefundForm({
      ...taoFormHoanTienMacDinh(user),
      email: user?.email || booking.guestEmail || '',
      bankAccountName: user?.full_name || booking.guestName || '',
    });
  };

  const submitRefundRequest = async () => {
    if (!refundDraftBooking || refundSubmitting) return;

    const payload = {
      bankName: refundForm.bankName.trim(),
      bankAccountName: refundForm.bankAccountName.trim(),
      bankAccountNumber: refundForm.bankAccountNumber.trim(),
      phone: refundForm.phone.trim(),
      email: refundForm.email.trim(),
      reason: refundForm.reason.trim(),
    };

    if (!payload.bankName || !payload.bankAccountName || !payload.bankAccountNumber || !payload.reason) {
      hienThongBao('Vui lòng nhập ngân hàng, chủ tài khoản, số tài khoản và lý do hủy.', 'error');
      return;
    }

    setRefundSubmitting(true);
    try {
      await taoYeuCauHoanTienApi(refundDraftBooking.id, payload);
      setRefundDraftBooking(null);
      setRefundForm(taoFormHoanTienMacDinh(user));
      hienThongBao('Đã gửi yêu cầu hủy/hoàn tiền. Admin sẽ kiểm tra và phản hồi trong mục Hoàn tiền.', 'success');
      await refresh();
    } catch (error) {
      hienThongBao(error?.response?.data?.message || 'Không gửi được yêu cầu hủy/hoàn tiền.', 'error');
    } finally {
      setRefundSubmitting(false);
    }
  };

  const refundPolicyPreview = refundDraftBooking
    ? tinhChinhSachHoanTien(refundDraftBooking.paidAmount)
    : null;

  return (
    <main className="history-page-bg flex-1">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <MyBookingsHeader />
        <MyBookingsTabs activeTab={activeTab} setActiveTab={setActiveTab} badges={badges} />
        <MyBookingsError message={bookingsError} />

        {bookingsLoading ? (
          <MyBookingsLoading />
        ) : filteredBookings.length ? (
          <div className="mt-6 grid gap-8">
            {filteredBookings.map((booking) => {
              const isPaying = paymentDraft?.bookingId === booking.id;
              const payNowAmount =
                paymentDraft?.amount || (paymentDraft?.method === PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT ? booking.depositAmount : booking.totalPrice);
              const isConfirmingCurrentPayment = confirmingPaymentId === booking.id;
              const canPay = booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID && booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING;
              const canCancelHold = booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING && booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID;
              const canRequestRefund = coTheGuiYeuCauHuyHoanTien(booking);
              const hasCheckInQr = Boolean(booking.qrToken) && [TRANG_THAI_DAT_PHONG.CONFIRMED, TRANG_THAI_DAT_PHONG.CHECKED_IN].includes(booking.bookingStatus);
              const isFutureBooking = laDonDatPhongTuongLai(booking);
              const isCheckInDayArrived = daDenNgayNhanPhong(booking.checkIn);
              const isFrontdeskVerified = Boolean(booking.frontdeskVerifiedAt);
              const isAutoOpenedCheckIn = booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN && !isFrontdeskVerified;
              const canCustomerConfirmCheckout = booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN
                && booking.paymentStatus !== TRANG_THAI_THANH_TOAN.UNPAID
                && isCheckInDayArrived
                && isFrontdeskVerified;
              const disabledCheckoutLabel = isAutoOpenedCheckIn ? 'Chờ xác minh QR LAN' : 'Chờ nhận phòng';
              const appliedVoucherCode = voucherByBooking[booking.id] || '';
              const voucherInputCode = voucherInputByBooking[booking.id] ?? appliedVoucherCode;
              const selectedVoucher = findVoucherByCode(appliedVoucherCode);
              const bestVoucher = timVoucherTotNhat(booking.totalPrice, voucherOptions);
              const isBestVoucherSelected = Boolean(selectedVoucher && bestVoucher && selectedVoucher.code === bestVoucher.code);
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
                  className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md lg:grid-cols-[280px_minmax(0,1fr)]"
                >
                  <div className="relative h-48 w-full lg:h-full lg:min-h-[280px]">
                    <img src={resolveMediaUrl(booking.image_url)} alt={booking.hotel_name} className="h-full w-full object-cover" />
                  </div>

                  <div className="flex flex-col p-6">
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

                      <MyBookingsProgress booking={booking} />

                      {booking.refundRequest ? (
                        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-rose-900">Yêu cầu hủy/hoàn tiền đang được xử lý</p>
                              <p className="mt-1 text-xs font-semibold leading-5 text-rose-700">
                                Mã yêu cầu {booking.refundRequest.code}. Số tiền dự kiến hoàn {dinhDangTien(booking.refundRequest.refundAmount)} sau phí hủy.
                              </p>
                            </div>
                            <Link
                              to="/me?section=refunds"
                              className="rounded-lg bg-white px-3 py-2 text-xs font-black text-rose-700 shadow-sm transition hover:bg-rose-100"
                            >
                              Theo dõi
                            </Link>
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold text-slate-500">Hình thức</p>
                          <p className="mt-1 text-sm font-black text-slate-950">{NHAN_KIEU_DAT_PHONG[booking.bookingType] || 'Qua đêm'}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold text-slate-500">Thời gian</p>
                          <p className="mt-1 text-sm font-black text-slate-950">{dinhDangNgay(booking.checkIn) || 'Chưa chọn'}</p>
                          {booking.bookingType === KIEU_DAT_PHONG.DAY_USE ? (
                            <p className="mt-1 text-xs font-bold text-slate-500">{booking.timeSlot?.label} · {booking.timeSlot?.time}</p>
                          ) : null}
                        </div>
                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold text-slate-500">Trả phòng</p>
                          <p className="mt-1 text-sm font-black text-slate-950">{dinhDangNgay(booking.checkOut) || 'Chưa chọn'}</p>
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
                        <div className={`mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 shadow-sm ${
                          isFutureBooking
                            ? 'border-amber-200 bg-amber-50'
                            : isAutoOpenedCheckIn
                              ? 'border-brand-200 bg-brand-50'
                              : isFrontdeskVerified
                                ? 'border-emerald-200 bg-emerald-50'
                                : 'border-emerald-200 bg-emerald-50'
                        }`}>
                          <div>
                            <p className={`text-sm font-black ${isFutureBooking ? 'text-amber-900' : isAutoOpenedCheckIn ? 'text-brand-900' : 'text-emerald-800'}`}>
                              {isFutureBooking
                                ? 'Mã nhận phòng đã sẵn sàng'
                                : isAutoOpenedCheckIn
                                  ? 'Đã mở nhận phòng tự động'
                                  : isFrontdeskVerified
                                    ? 'Đã xác minh nhận phòng qua LAN'
                                    : 'Mã QR nhận phòng đã sẵn sàng'}
                            </p>
                            <p className={`mt-0.5 text-xs font-semibold ${isFutureBooking ? 'text-amber-800' : isAutoOpenedCheckIn ? 'text-brand-800' : 'text-emerald-700'}`}>
                              {isFutureBooking
                                ? `Mã chỉ có hiệu lực từ ${moTaHieuLucNhanPhong(booking)}.`
                                : isAutoOpenedCheckIn
                                  ? 'Đưa mã cho lễ tân quét qua mạng LAN để hoàn tất bước nhận phòng.'
                                  : isFrontdeskVerified
                                    ? 'Bước nhận phòng đã được lễ tân xác minh.'
                                    : 'Đưa mã cho lễ tân để xác minh nhận phòng.'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveQrBooking(booking)}
                            className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 px-5 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700"
                          >
                            Hiển thị mã QR
                          </button>
                        </div>
                      ) : null}

                      {canPay ? (
                        <div className="mt-5 rounded-[14px] border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-slate-950">Mã giảm giá</p>
                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                Áp mã trước khi tạo QR để số tiền thanh toán được tính lại.
                              </p>
                            </div>
                            {selectedVoucher && selectedVoucherHopLe ? (
                              <span className={`rounded-full px-3 py-1 text-xs font-black ${isBestVoucherSelected ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                {isBestVoucherSelected ? 'Ưu đãi tốt nhất' : selectedVoucher.code}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.7fr)]">
                            <input
                              value={voucherInputCode}
                              onChange={(event) => {
                                const nextCode = chuanHoaMaVoucher(event.target.value);
                                setVoucherInputByBooking((current) => ({ ...current, [booking.id]: nextCode }));
                              }}
                              placeholder="Nhập mã, ví dụ DIEUBEL10"
                              className="field-shell min-h-11 w-full px-3 py-2 text-sm font-bold uppercase outline-none"
                            />
                            {voucherOptions.length ? (
                              <select
                                value={appliedVoucherCode}
                                onChange={(event) => {
                                  const nextCode = event.target.value;
                                  setVoucherByBooking((current) => ({ ...current, [booking.id]: nextCode }));
                                  setVoucherInputByBooking((current) => ({ ...current, [booking.id]: nextCode }));
                                  setVoucherAutoOffByBooking((current) => ({ ...current, [booking.id]: !nextCode }));
                                  setPaymentDraft(null);
                                }}
                                className="field-shell min-h-11 w-full px-3 py-2 text-sm font-bold outline-none"
                              >
                                <option value="">Không áp dụng</option>
                                {voucherOptions.map((reward) => (
                                  <option
                                    key={reward.code}
                                    value={reward.code}
                                    disabled={!kiemTraDieuKienVoucher(reward, booking.totalPrice).hopLe}
                                  >
                                  {reward.code} - {reward.title}{bestVoucher?.code === reward.code ? ' - Ưu đãi tốt nhất' : ''}{moTaDieuKienVoucher(reward) ? ` - ${moTaDieuKienVoucher(reward)}` : ''}
                                </option>
                              ))}
                            </select>
                          ) : null}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => applyVoucher(booking)}
                              className="min-h-10 rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800"
                            >
                              Áp mã
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setVoucherByBooking((current) => ({ ...current, [booking.id]: '' }));
                                setVoucherInputByBooking((current) => ({ ...current, [booking.id]: '' }));
                                setVoucherAutoOffByBooking((current) => ({ ...current, [booking.id]: true }));
                                setPaymentDraft(null);
                                hienThongBao('Đã bỏ mã giảm giá khỏi đơn này.', 'info');
                              }}
                              className="min-h-10 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:border-slate-900"
                            >
                              Bỏ mã
                            </button>
                            {selectedVoucher && !selectedVoucherHopLe ? (
                              <span className="flex items-center text-xs font-bold text-rose-600">{selectedVoucherCheck.lyDo}</span>
                            ) : null}
                            {selectedVoucher && selectedVoucherHopLe && selectedVoucher.discountType !== 'service' ? (
                              <span className="flex items-center text-xs font-bold text-emerald-700">
                                Dự kiến giảm {dinhDangTien(previewDiscount)}, tổng còn {dinhDangTien(previewTotalPrice)}.
                              </span>
                            ) : null}
                            {selectedVoucher && selectedVoucherHopLe && selectedVoucher.discountType === 'service' ? (
                              <span className="flex items-center text-xs font-bold text-emerald-700">Voucher này tặng dịch vụ, không trừ trực tiếp vào tiền phòng.</span>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                    {isPaying ? (
                      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 backdrop-blur-md p-4.5 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-950">
                              {paymentDraft.method === PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT ? 'VietQR cọc giữ phòng 10%' : 'VietQR thanh toán toàn bộ'}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              Quét mã QR, hệ thống sẽ tự dùng voucher và cập nhật đơn trong vài giây.
                            </p>
                          </div>
                          <p className="text-xl font-black text-brand-700">{dinhDangTien(payNowAmount)}</p>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                          <div className="md:max-w-[220px]">
                            <MyBookingsVietQr
                              amount={payNowAmount}
                              bookingId={booking.id}
                              paymentMethod={paymentDraft.method}
                              paymentCode={paymentDraft.paymentCode}
                            />
                          </div>
                          <div className="grid content-start gap-3">
                            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                              <p className="font-black text-slate-950">Nội dung CK</p>
                              <p className="mt-1 break-all font-black text-brand-700">{paymentDraft.paymentCode}</p>
                            </div>
                            <div className="grid gap-2">
                              <div className={`rounded-xl px-4 py-3 text-sm font-black ${
                                paymentUpdateError
                                  ? 'bg-rose-50 text-rose-700'
                                  : isConfirmingCurrentPayment
                                    ? 'bg-sky-50 text-sky-700'
                                    : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {paymentUpdateError
                                  ? paymentUpdateError
                                  : isConfirmingCurrentPayment
                                    ? 'Đang cập nhật đơn sau khi quét QR...'
                                    : 'Đang chờ quét QR. Admin không cần duyệt thanh toán.'}
                              </div>
                              <div className="grid gap-2 sm:grid-cols-2">
                                <button
                                  type="button"
                                  onClick={() => confirmPayment(booking.id, paymentDraft.method)}
                                  disabled={isConfirmingCurrentPayment}
                                  className="min-h-12 rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:bg-brand-400"
                                >
                                  {isConfirmingCurrentPayment ? 'Đang xử lý...' : paymentUpdateError ? 'Thử lại' : 'Tôi đã thanh toán'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPaymentDraft(null);
                                    setPaymentUpdateError('');
                                  }}
                                  className="min-h-12 rounded-lg border border-[#222222] bg-white px-4 py-3 text-sm font-medium text-[#222222] transition hover:bg-[#f7f7f7]"
                                >
                                  Để sau
                                </button>
                              </div>
                            </div>
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

                    {/* Footer của Thẻ (Gộp TỔNG CUỐI CÙNG và NÚT BẤM) */}
                    <div className="mt-5 rounded-2xl bg-slate-50 p-4 border border-slate-100 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                      <div className="min-w-[200px]">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Tổng cuối cùng</p>
                        <div className="mt-3 grid gap-2 text-sm">
                          <div className="flex items-center justify-between gap-3 text-slate-600">
                            <span>Giá gốc</span>
                            <span className="font-bold text-slate-900">{dinhDangTien(baseTotalPrice)}</span>
                          </div>
                          {hasVoucherPreview ? (
                            <div className="flex items-start justify-between gap-3 text-slate-600">
                              <span>Voucher</span>
                              <span className="grid justify-items-end gap-1 text-right">
                                {isBestVoucherSelected ? (
                                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black uppercase text-rose-700">Ưu đãi tốt nhất</span>
                                ) : null}
                                <span className="max-w-[150px] font-bold text-slate-900">
                                  {activeVoucher.voucherTitle || activeVoucher.title || activeVoucher.voucherCode || activeVoucher.code}
                                </span>
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
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          Cọc tối thiểu: <span className="font-bold text-slate-700">{dinhDangTien(previewDepositAmount)}</span>
                        </p>
                      </div>

                      <div className="flex flex-1 flex-col justify-end gap-2 lg:max-w-[400px]">
                        {/* Nhóm 1: Thanh toán (Nếu có thể thanh toán) */}
                        {canPay ? (
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <button
                              type="button"
                              onClick={() => openPayment(booking, PHUONG_THUC_THANH_TOAN.ONLINE_FULL)}
                              className="flex min-h-12 items-center justify-center rounded-xl bg-brand-600 px-3 py-3.5 text-center text-xs font-black text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
                            >
                              Tạo QR toàn bộ
                            </button>
                            <button
                              type="button"
                              onClick={() => openPayment(booking, PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT)}
                              className="flex min-h-12 items-center justify-center rounded-xl bg-brand-50 px-3 py-3.5 text-center text-xs font-black text-brand-700 transition hover:bg-brand-100 active:scale-[0.98]"
                            >
                              Tạo QR cọc 10%
                            </button>
                          </div>
                        ) : null}

                        {/* Nhóm 2: Thao tác chung (Action hierarchy) */}
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            to={`/rooms/${booking.roomId}`}
                            className="flex min-h-11 items-center justify-center rounded-xl border border-transparent bg-white px-3 py-2 text-center text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                          >
                            Xem phòng
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDetailBookingId(booking.id)}
                            className="flex min-h-11 items-center justify-center rounded-xl border border-transparent bg-white px-3 py-2 text-center text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                          >
                            Chi tiết / HĐ
                          </button>
                          <Link
                            to={`/me?supportBooking=${booking.id}`}
                            className="flex min-h-11 items-center justify-center rounded-xl border border-transparent bg-white px-3 py-2 text-center text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                          >
                            Hỗ trợ
                          </Link>
                          {canCustomerConfirmCheckout ? (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const nextBookings = await capNhatTrangThaiDatPhongApi(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_OUT);
                                  setRemoteBookings(nextBookings);
                                  hienThongBao('Đã đánh dấu trả phòng thành công!', 'success');
                                } catch (error) {
                                  hienThongBao(error?.response?.data?.message || 'Không cập nhật được trả phòng.', 'error');
                                }
                                await refresh();
                              }}
                              className="flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-3 py-2 text-center text-xs font-black text-white shadow-sm transition hover:bg-slate-800"
                            >
                              Trả phòng
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="flex min-h-11 items-center justify-center rounded-xl border border-transparent bg-white/50 text-slate-400 px-3 py-2 text-center text-xs font-bold cursor-not-allowed"
                            >
                              {disabledCheckoutLabel}
                            </button>
                          )}
                        </div>

                        {/* Hành động hủy */}
                        {canCancelHold ? (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const nextBookings = await capNhatTrangThaiDatPhongApi(booking.id, TRANG_THAI_DAT_PHONG.CANCELLED, 'Khách hủy giữ chỗ');
                                setRemoteBookings(nextBookings);
                                hienThongBao('Đã hủy giữ chỗ thành công.', 'success');
                              } catch (error) {
                                hienThongBao(error?.response?.data?.message || 'Không hủy được đơn hàng.', 'error');
                              }
                              await refresh();
                            }}
                            className="flex min-h-11 w-full mt-2 items-center justify-center rounded-xl bg-transparent border border-rose-200 px-4 py-2 text-center text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                          >
                            Hủy giữ chỗ
                          </button>
                        ) : null}
                        {canRequestRefund ? (
                          <button
                            type="button"
                            onClick={() => openRefundDraft(booking)}
                            className="mt-2 flex min-h-11 w-full items-center justify-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-center text-xs font-black text-rose-700 transition hover:bg-rose-50 active:scale-[0.98]"
                          >
                            Hủy phòng / yêu cầu hoàn tiền
                          </button>
                        ) : null}
                        {booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN && isFrontdeskVerified ? (
                          <p className="mt-1 rounded-xl bg-slate-100 px-3 py-2 text-center text-[11px] font-bold leading-5 text-slate-500">
                            Đơn đã xác minh nhận phòng, vui lòng liên hệ hỗ trợ nếu cần thay đổi lưu trú.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {booking.latestCustomerFeedback ? (
                      <div className="mt-4 rounded-xl bg-sky-50/50 p-4 text-sm">
                        <p className="font-black text-slate-950">Phản hồi gần nhất</p>
                        <p className="mt-1 line-clamp-2 leading-6 text-slate-600">{booking.latestCustomerFeedback.content}</p>
                      </div>
                    ) : null}

                    </div>
                </article>
              );
            })}
          </div>
        ) : (
          <MyBookingsEmpty />
        )}
      </div>

      {refundDraftBooking ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 px-4 backdrop-blur-sm"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget && !refundSubmitting) setRefundDraftBooking(null);
          }}
        >
          <section className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-rose-100 bg-rose-50 px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">Hủy phòng có hoàn tiền</p>
                  <h3 className="mt-2 text-xl font-black text-slate-950">{refundDraftBooking.hotel_name}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    Đơn {refundDraftBooking.id} · {refundDraftBooking.room_name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRefundDraftBooking(null)}
                  disabled={refundSubmitting}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-500 shadow-sm transition hover:text-rose-700 disabled:opacity-50"
                >
                  Đóng
                </button>
              </div>
            </div>

            <div className="grid gap-5 p-6">
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Đã thanh toán</p>
                  <p className="mt-1 text-sm font-black text-slate-950">{dinhDangTien(refundPolicyPreview?.paidAmount)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Phí hủy 20%</p>
                  <p className="mt-1 text-sm font-black text-rose-700">{dinhDangTien(refundPolicyPreview?.cancelFeeAmount)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Dự kiến hoàn</p>
                  <p className="mt-1 text-sm font-black text-emerald-700">{dinhDangTien(refundPolicyPreview?.refundAmount)}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-slate-700">Ngân hàng</span>
                  <input
                    value={refundForm.bankName}
                    onChange={(event) => setRefundForm((current) => ({ ...current, bankName: event.target.value }))}
                    placeholder="VD: Vietcombank"
                    className="field-shell px-4 py-3.5 text-sm font-semibold text-slate-950 outline-none"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-slate-700">Chủ tài khoản</span>
                  <input
                    value={refundForm.bankAccountName}
                    onChange={(event) => setRefundForm((current) => ({ ...current, bankAccountName: event.target.value }))}
                    className="field-shell px-4 py-3.5 text-sm font-semibold text-slate-950 outline-none"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-slate-700">Số tài khoản</span>
                  <input
                    value={refundForm.bankAccountNumber}
                    onChange={(event) => setRefundForm((current) => ({ ...current, bankAccountNumber: event.target.value }))}
                    inputMode="numeric"
                    className="field-shell px-4 py-3.5 text-sm font-semibold text-slate-950 outline-none"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-slate-700">Số điện thoại</span>
                  <input
                    value={refundForm.phone}
                    onChange={(event) => setRefundForm((current) => ({ ...current, phone: event.target.value }))}
                    inputMode="tel"
                    className="field-shell px-4 py-3.5 text-sm font-semibold text-slate-950 outline-none"
                  />
                </label>
                <label className="grid gap-2 sm:col-span-2">
                  <span className="text-sm font-black text-slate-700">Email nhận phản hồi</span>
                  <input
                    value={refundForm.email}
                    onChange={(event) => setRefundForm((current) => ({ ...current, email: event.target.value }))}
                    type="email"
                    className="field-shell px-4 py-3.5 text-sm font-semibold text-slate-950 outline-none"
                  />
                </label>
                <label className="grid gap-2 sm:col-span-2">
                  <span className="text-sm font-black text-slate-700">Lý do hủy</span>
                  <textarea
                    value={refundForm.reason}
                    onChange={(event) => setRefundForm((current) => ({ ...current, reason: event.target.value }))}
                    rows={3}
                    placeholder="Mô tả ngắn để admin kiểm tra và duyệt hoàn tiền."
                    className="field-shell resize-none px-4 py-3.5 text-sm font-semibold leading-6 text-slate-950 outline-none"
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setRefundDraftBooking(null)}
                  disabled={refundSubmitting}
                  className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Để sau
                </button>
                <button
                  type="button"
                  onClick={submitRefundRequest}
                  disabled={refundSubmitting}
                  className="min-h-12 rounded-xl bg-rose-600 px-6 text-sm font-black text-white shadow-sm shadow-rose-500/20 transition hover:bg-rose-700 active:scale-[0.98] disabled:bg-rose-300"
                >
                  {refundSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu hủy/hoàn tiền'}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {/* Modal QR Code Nhận phòng */}
      {activeQrBooking ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/80 px-4 backdrop-blur-sm transition-opacity"
          onPointerDown={(e) => { if (e.target === e.currentTarget) setActiveQrBooking(null); }}
        >
          <div className="grid w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <div className="bg-brand-600 p-6 text-center text-white">
                <p className="text-xs font-black uppercase tracking-widest text-white/80">Thẻ lên phòng</p>
                <h3 className="mt-2 text-xl font-black tracking-tight">Boarding Pass</h3>
              </div>
              <div className="p-8 text-center bg-white">
                <div className="mx-auto grid h-48 w-48 place-items-center rounded-2xl bg-white shadow-[0_0_0_2px_rgba(0,0,0,0.05)]">
                  <MyBookingsQrMock token={activeQrBooking.qrToken} />
                </div>
                <p className="mt-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Mã QR của bạn</p>
                <p className="mt-1 break-all text-sm font-black text-slate-900">{activeQrBooking.qrToken}</p>
              </div>
            </div>
            <div className="flex flex-col justify-between bg-slate-50 p-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Hiệu lực mã</p>
                {laDonDatPhongTuongLai(activeQrBooking) ? (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-black text-amber-900">Chưa đến ngày nhận phòng</p>
                    <p className="mt-1 text-xs font-bold leading-5 text-amber-800">
                      Mã nhận phòng sẵn sàng, chỉ có hiệu lực từ {moTaHieuLucNhanPhong(activeQrBooking)}.
                    </p>
                  </div>
                ) : activeQrBooking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN && !activeQrBooking.frontdeskVerifiedAt ? (
                  <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 p-3">
                    <p className="text-sm font-black text-brand-900">Đã mở nhận phòng tự động</p>
                    <p className="mt-1 text-xs font-bold leading-5 text-brand-800">
                      Lễ tân dùng điện thoại cùng mạng LAN quét mã này để hoàn tất xác minh.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-sm font-black text-emerald-900">Mã hợp lệ</p>
                    <p className="mt-1 text-xs font-bold leading-5 text-emerald-800">
                      Đưa mã cho lễ tân để xác minh nhận phòng khi đến khách sạn.
                    </p>
                  </div>
                )}
                <div className="mt-4 grid gap-2 text-xs font-bold text-slate-500">
                  <p>Phòng: <span className="text-slate-900">{activeQrBooking.room_name}</span></p>
                  <p>Nhận: <span className="text-slate-900">{dinhDangNgay(activeQrBooking.checkIn)}</span></p>
                  <p>Trả: <span className="text-slate-900">{dinhDangNgay(activeQrBooking.checkOut)}</span></p>
                  <p>Đã thanh toán: <span className="text-slate-900">{dinhDangTien(activeQrBooking.paidAmount)}</span></p>
                </div>
              </div>
              <button
                onClick={() => setActiveQrBooking(null)}
                className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default DatPhongCuaToi;
