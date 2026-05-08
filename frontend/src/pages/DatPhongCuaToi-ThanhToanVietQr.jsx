import { taoAnhVietQr, daCauHinhVietQr } from '../utils/vietQr';

function DatPhongCuaToiThanhToanVietQr({ amount, bookingId, paymentMethod, paymentCode }) {
  const qrUrl = taoAnhVietQr({ amount, bookingId, paymentMethod, paymentCode });

  if (!daCauHinhVietQr()) {
    return (
      <div className="grid min-h-48 w-full max-w-xs place-items-center rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
        <div>
          <p className="text-sm font-black text-amber-800">Chưa cấu hình VietQR</p>
          <p className="mt-2 text-xs leading-5 text-amber-700">
            Điền VITE_VIETQR_BANK_ID, VITE_VIETQR_ACCOUNT_NO, VITE_VIETQR_ACCOUNT_NAME trong frontend .env.
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={qrUrl}
      alt={`VietQR thanh toán ${bookingId}`}
      className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white object-contain p-3 shadow-sm"
    />
  );
}

export default DatPhongCuaToiThanhToanVietQr;
