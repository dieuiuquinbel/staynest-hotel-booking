// Chức năng: Tạo ảnh QR check-in nội bộ, không gửi token ra dịch vụ ngoài.
import QRCode from 'qrcode';
import { useEffect, useMemo, useState } from 'react';

export default function MyBookingsQrMock({ token }) {
  const [qrImageUrl, setQrImageUrl] = useState('');
  const checkinUrl = useMemo(
    () => `${window.location.origin}/checkin?token=${encodeURIComponent(token || '')}`,
    [token],
  );

  useEffect(() => {
    let mounted = true;

    QRCode.toDataURL(checkinUrl, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((dataUrl) => {
        if (mounted) setQrImageUrl(dataUrl);
      })
      .catch(() => {
        if (mounted) setQrImageUrl('');
      });

    return () => {
      mounted = false;
    };
  }, [checkinUrl]);

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-2xl">
      {qrImageUrl ? (
        <img
          src={qrImageUrl}
          alt="Check-in QR Code"
          className="h-40 w-40 object-contain transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-center text-[11px] font-bold text-slate-500">
          Đang tạo QR...
        </div>
      )}
      <div className="mt-2 text-[10px] text-emerald-600 font-bold tracking-wider animate-pulse">
        MẠNG LAN HOẠT ĐỘNG
      </div>
    </div>
  );
}
