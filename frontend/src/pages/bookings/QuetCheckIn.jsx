// Chức năng: Trang dành cho nhân viên nội bộ quét mã QR của khách hàng để check-in trực tiếp qua mạng LAN.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { dinhDangNgay } from '../../utils/dinhDang';

function layNoiDungKetQua(data) {
  if (data?.verificationStatus === 'early') {
    return {
      tone: 'amber',
      title: 'Mã Chưa Có Hiệu Lực',
      description: `Đơn đã thanh toán, nhưng chỉ có hiệu lực từ ${data.activeFrom || `00:00 ngày ${dinhDangNgay(data.checkIn)}`}.`,
      icon: '!',
    };
  }

  if (data?.verificationStatus === 'checked_out') {
    return {
      tone: 'slate',
      title: 'Đơn Đã Trả Phòng',
      description: 'Mã này thuộc đơn lưu trú đã hoàn tất.',
      icon: 'i',
    };
  }

  return {
    tone: 'emerald',
    title: 'Nhận Phòng Thành Công',
    description: 'Lễ tân đã xác minh mã nhận phòng qua mạng LAN.',
    icon: '✓',
  };
}

export default function QuetCheckIn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const resultInfo = useMemo(() => layNoiDungKetQua(successData), [successData]);

  useEffect(() => {
    if (!token) {
      setError('Mã QR check-in không hợp lệ hoặc thiếu token.');
      setLoading(false);
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const response = await axios.post('/api/bookings/public-checkin', { token });
        setSuccessData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xác minh mã nhận phòng qua mạng LAN.');
      } finally {
        setLoading(false);
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [token]);

  const toneClass = {
    emerald: 'bg-emerald-500 text-slate-950',
    amber: 'bg-amber-400 text-slate-950',
    slate: 'bg-slate-500 text-white',
  }[resultInfo.tone];

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-900 px-4 py-8 text-white">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <span className="text-xl font-black">DB</span>
          </div>
          <h1 className="mt-4 text-xl font-black uppercase tracking-widest text-emerald-400">DieuBel Hotel</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">Quét nhận phòng LAN</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="h-20 w-20 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
            <p className="mt-8 text-sm font-bold text-slate-300">Đang xác thực mã nhận phòng...</p>
            <p className="mt-1 text-[11px] text-slate-500">Giữ thiết bị trong cùng mạng LAN</p>
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-500/10 text-2xl font-black text-rose-400">!</div>
            <h2 className="mt-4 text-lg font-black text-rose-400">Check-in Thất Bại</h2>
            <p className="mt-3 rounded-2xl border border-rose-500/10 bg-rose-500/5 p-4 text-sm font-bold leading-relaxed text-slate-300">{error}</p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col items-center text-center">
              <div className={`grid h-16 w-16 place-items-center rounded-full text-3xl font-black ${toneClass}`}>
                {resultInfo.icon}
              </div>
              <h2 className="mt-4 text-xl font-black uppercase tracking-wide text-white">{resultInfo.title}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-300">{resultInfo.description}</p>
            </div>

            <div className="mt-6 space-y-4 rounded-2xl border border-white/5 bg-slate-900/60 p-4">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold uppercase text-slate-400">Mã đặt phòng</span>
                <span className="text-sm font-black tracking-wider text-emerald-400">{successData.bookingCode}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold uppercase text-slate-400">Khách hàng</span>
                <span className="text-sm font-black text-white">{successData.guestName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold uppercase text-slate-400">Phòng</span>
                <span className="text-sm font-black text-emerald-400">{successData.roomName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Nhận phòng</span>
                  <span className="text-xs font-black text-white">{dinhDangNgay(successData.checkIn)}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Trả phòng</span>
                  <span className="text-xs font-black text-white">{dinhDangNgay(successData.checkOut)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full rounded-xl bg-emerald-500 py-3.5 text-xs font-black uppercase tracking-widest text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
        >
          Hoàn tất
        </button>
      </div>
    </main>
  );
}
