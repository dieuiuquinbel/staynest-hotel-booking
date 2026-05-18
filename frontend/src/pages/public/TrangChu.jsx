// Trang chu khach hang: tim kiem nhanh, phong noi bat, voucher va noi dung gioi thieu.
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import ThePhong from '../../components/rooms/ThePhong';
import KhungThePhong from '../../components/rooms/KhungThePhong';
import ThanhTimKiem from '../../components/search/ThanhTimKiem';
import BangMoiThanhVien from '../../components/layout/BangMoiThanhVien';
import useTimKiemGanDay from '../../hooks/useTimKiemGanDay';
import { layPhongNoiBat } from '../../services/phongApi';
import { layDanhSachVoucherApi, luuVoucherApi } from '../../services/voucherApi';
import useKhoXacThuc from '../../store/khoXacThuc';
import { VOUCHER_KHUYEN_MAI, docQuaDaDoi, luuVoucherKhuyenMai } from '../../utils/diemThuong';

const SLIDE_HERO = [
  {
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1900&q=88',
    label: 'Resort biển được yêu thích',
    title: 'Kỳ nghỉ hoàn hảo bắt đầu từ đây',
    description: 'Tìm ưu đãi khách sạn, resort và căn hộ phù hợp với điểm đến, thời gian và số lượng khách của bạn.',
  },
  {
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1900&q=88',
    label: 'Phòng nghỉ điểm cao',
    title: 'Không gian lưu trú đáng nhớ',
    description: 'Khám phá những phòng suite, deluxe và family đang được khách hàng đánh giá tốt.',
  },
  {
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1900&q=88',
    label: 'Khách sạn trung tâm',
    title: 'Dễ đi, dễ ở, dễ đặt',
    description: 'Chọn nhanh khách sạn gần trung tâm, gần biển hoặc gần phố cổ theo đúng nhu cầu chuyến đi.',
  },
  {
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1900&q=88',
    label: 'Ưu đãi cuối tuần',
    title: 'Nhiều lựa chọn cho mọi chuyến đi',
    description: 'Từ căn hộ công tác đến resort nghỉ dưỡng, DieuBel gợi ý các chỗ ở nổi bật và còn phòng.',
  },
  {
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1900&q=88',
    label: 'Suite cao cấp',
    title: 'Tận hưởng phòng đẹp, giá rõ ràng',
    description: 'Xem nhanh các khách sạn nổi bật, tiện nghi đầy đủ và chính sách hủy linh hoạt.',
  },
  {
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1900&q=88',
    label: 'Kỳ nghỉ gia đình',
    title: 'Phòng rộng cho chuyến đi trọn vẹn',
    description: 'Tìm phòng family, bungalow và villa phù hợp cho nhóm bạn hoặc gia đình.',
  },
];

const DIEM_DEN = [
  {
    city: 'Ha Noi',
    name: 'Hà Nội',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
    note: 'Khách sạn trung tâm, căn hộ dịch vụ và chỗ ở công tác.',
  },
  {
    city: 'Da Nang',
    name: 'Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
    note: 'Resort biển, suite gia đình và phòng nghỉ gần biển.',
  },
  {
    city: 'Ho Chi Minh',
    name: 'TP. Hồ Chí Minh',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=80',
    note: 'Lưu trú công tác, khách sạn quận 1 và căn hộ tiện nghi.',
  },
  {
    city: 'Hoi An',
    name: 'Hội An',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
    note: 'Không gian nghỉ dưỡng yên tĩnh, gần phố cổ.',
  },
];

const BO_SUU_TAP = [
  {
    title: 'Nghỉ dưỡng biển',
    detail: 'Resort, villa và suite gần biển cho kỳ nghỉ thư giãn.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    query: { city: 'Da Nang', roomType: 'suite', availableOnly: true },
  },
  {
    title: 'Chuyến công tác',
    detail: 'Khách sạn trung tâm, dễ di chuyển và giá minh bạch.',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
    query: { city: 'Ho Chi Minh', roomType: 'deluxe', availableOnly: true },
  },
  {
    title: 'Gia đình & nhóm bạn',
    detail: 'Phòng rộng, nhiều khách, có bữa sáng và hủy linh hoạt.',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
    query: { roomType: 'family', guests: '4', adults: '2', children: '2', availableOnly: true },
  },
  {
    title: 'Gần phố cổ',
    detail: 'Chỗ ở yên tĩnh, thuận tiện khám phá ẩm thực và văn hóa.',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
    query: { city: 'Hoi An', availableOnly: true },
  },
];

const THONG_KE_TIN_CAY = [
  { value: '500+', label: 'khách sạn & khu nghỉ dưỡng', note: 'đa dạng hạng phòng' },
  { value: '50 nghìn+', label: 'khách đã đặt phòng', note: 'trải nghiệm đã xác nhận' },
  { value: '12', label: 'thành phố phổ biến', note: 'biển, núi và trung tâm' },
  { value: '4.9+', label: 'đánh giá trung bình', note: 'từ khách lưu trú' },
];

const DIEM_TIN_CAY = [
  { title: 'Giá rõ ràng', detail: 'Thông tin giá phòng, phụ phí và ưu đãi được hiển thị trước khi khách xác nhận đặt phòng.' },
  { title: 'Lựa chọn phù hợp', detail: 'Dễ dàng tìm khách sạn, resort hoặc căn hộ theo vị trí, ngân sách và nhu cầu lưu trú.' },
  { title: 'Chính sách linh hoạt', detail: 'Nhiều chỗ ở hỗ trợ giữ chỗ, đặt cọc và hủy phòng theo điều kiện hiển thị sẵn.' },
  { title: 'Theo dõi thuận tiện', detail: 'Khách có thể xem lại đặt phòng, trạng thái thanh toán và thông tin nhận phòng khi cần.' },
];

const DANH_GIA = [
  {
    name: 'Minh Anh',
    trip: 'Kỳ nghỉ Đà Nẵng',
    score: '9.4',
    tag: 'Giá minh bạch',
    quote: 'Tìm phòng nhanh, bộ lọc gọn và thông tin giá dễ hiểu. Tôi đặt suite biển chỉ trong vài phút.',
  },
  {
    name: 'Hoàng Nam',
    trip: 'Công tác TP. Hồ Chí Minh',
    score: '9.1',
    tag: 'Phòng được chọn lọc',
    quote: 'Trang chi tiết phòng rõ ràng, biết ngay còn phòng hay không và phù hợp cho chuyến công tác.',
  },
  {
    name: 'Linh Chi',
    trip: 'Gia đình đi Hội An',
    score: '9.6',
    tag: 'Bữa sáng & hủy linh hoạt',
    quote: 'Các gợi ý theo kiểu chuyến đi rất hữu ích, nhất là khi cần phòng family có bữa sáng.',
  },
  {
    name: 'Tuấn Kiệt',
    trip: 'Cuối tuần Phú Quốc',
    score: '9.3',
    tag: 'Quản lý dễ dàng',
    quote: 'Đặt xong xem lại lịch sử rất tiện, mọi thông tin ngày nhận phòng và dịch vụ đều nằm một chỗ.',
  },
  {
    name: 'Bảo Trân',
    trip: 'Nghỉ dưỡng Nha Trang',
    score: '9.2',
    tag: 'Dịch vụ gợi ý',
    quote: 'Các gói thêm như đưa đón sân bay và bữa sáng hiển thị rõ, không phải hỏi lại nhân viên.',
  },
  {
    name: 'Quốc Huy',
    trip: 'Du lịch Đà Lạt',
    score: '9.0',
    tag: 'Lọc nhanh',
    quote: 'Tôi lọc theo ngân sách và sức chứa rất nhanh, danh sách trả về đúng nhu cầu gia đình.',
  },
  {
    name: 'Mai Phương',
    trip: 'Công tác Hà Nội',
    score: '9.5',
    tag: 'Thông tin rõ ràng',
    quote: 'Giá, ngày nhận phòng và trạng thái phòng được trình bày rõ nên đặt khá yên tâm.',
  },
];

const BINH_LUAN_POPUP = [
  { name: 'Mai Phương', trip: 'Công tác Hà Nội', text: 'Giá rõ ràng, đặt xong xem lại hóa đơn rất tiện.', score: '9.5' },
  { name: 'Quốc Huy', trip: 'Du lịch Đà Lạt', text: 'Lọc theo ngân sách nhanh, danh sách trả về đúng nhu cầu.', score: '9.0' },
  { name: 'Minh Anh', trip: 'Kỳ nghỉ Đà Nẵng', text: 'Mình tìm được phòng gần biển dưới 1 triệu, có cả ưu đãi.', score: '9.4' },
  { name: 'Linh Chi', trip: 'Gia đình Hội An', text: 'Phòng family dễ tìm, bữa sáng và hủy miễn phí hiển thị rõ.', score: '9.6' },
  { name: 'Tuấn Kiệt', trip: 'Cuối tuần Phú Quốc', text: 'Thanh toán VietQR nhanh, QR nhận phòng rất tiện khi check-in.', score: '9.3' },
  { name: 'Bảo Trân', trip: 'Nghỉ dưỡng Nha Trang', text: 'Dịch vụ thêm được ghi rõ nên không phải hỏi lại nhân viên.', score: '9.2' },
  { name: 'Hoàng Nam', trip: 'Công tác TP.HCM', text: 'Trang chi tiết phòng đủ thông tin, biết ngay còn phòng hay không.', score: '9.1' },
  { name: 'An Nhiên', trip: 'Du lịch Đà Nẵng', text: 'Áp voucher trước khi thanh toán nên tổng tiền dễ kiểm soát.', score: '9.7' },
  { name: 'Khánh Vy', trip: 'Đi chơi Hà Nội', text: 'Giao diện dễ dùng, hỏi trợ lý là ra phòng đúng ngân sách.', score: '9.4' },
  { name: 'Đức Minh', trip: 'Nghỉ dưỡng Phú Quốc', text: 'Đặt phòng nhanh, trạng thái thanh toán cập nhật rõ ràng.', score: '9.5' },
  { name: 'Thanh Tùng', trip: 'Du lịch Nha Trang', text: 'Ảnh phòng rõ, tiện nghi ghi đầy đủ nên chọn phòng rất nhanh.', score: '9.2' },
  { name: 'Hạ Vy', trip: 'Gia đình Hội An', text: 'Có phòng family đúng số khách, giá cuối cùng dễ hiểu.', score: '9.6' },
];

const SO_DANH_GIA_MOI_LUOT = 4;
const CAC_SLOT_DANH_GIA = Array.from({ length: SO_DANH_GIA_MOI_LUOT }, (_, index) => index);
const THOI_GIAN_HIEN_TUNG_DANH_GIA = 1000;
const THOI_GIAN_BAT_DAU_THOAT_DANH_GIA = 4500;
const THOI_GIAN_THOAT_NHOM_DANH_GIA = 780;
const TONG_NHOM_DANH_GIA = Math.ceil(BINH_LUAN_POPUP.length / SO_DANH_GIA_MOI_LUOT);

function ganThamSoTimKiem(params, form) {
  Object.entries(form).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(','));
      return;
    }

    if (value === true) {
      params.set(key, 'true');
      return;
    }

    if (value === false || value === '' || value === null || value === undefined) return;
    params.set(key, String(value));
  });
}

function TheDanhGiaPopup({ review, isExiting, exitDirection }) {
  return (
    <article className={`review-popup-card ${isExiting ? `review-popup-exit-${exitDirection}` : ''}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-slate-950">
          {review.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-xs font-bold text-slate-400">Đánh giá từ {review.trip}</p>
          <p className="mt-0.5 text-sm font-black text-slate-950">{review.name}</p>
          <p className="mt-1 line-clamp-2 text-sm font-black leading-snug text-slate-900">{review.text}</p>
        </div>
        <span className="rounded-lg bg-brand-600 px-2 py-1 text-xs font-black text-white">{review.score}</span>
      </div>
    </article>
  );
}

function HinhVoucher({ voucher, className = '' }) {
  return (
    <div className={`relative min-h-[150px] overflow-hidden rounded-2xl bg-gradient-to-br ${voucher.imageTone} p-5 text-white ${className}`}>
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/20" />
      <div className="absolute -bottom-10 left-8 h-32 w-32 rounded-full bg-white/15" />
      <div className="relative flex h-full min-h-[110px] flex-col justify-between">
        <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wide">{voucher.badge}</span>
        <div>
          <p className="text-4xl font-black tracking-normal drop-shadow-sm">{voucher.imageText}</p>
          <p className="mt-1 text-sm font-bold text-white/88">Mã {voucher.code}</p>
        </div>
      </div>
    </div>
  );
}

function TheVoucher({ voucher, isSaved, onSave, compact = false }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <HinhVoucher voucher={voucher} className={compact ? 'min-h-[130px] rounded-none' : 'rounded-none'} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-brand-700">{voucher.badge}</p>
            <h3 className="mt-2 text-lg font-black leading-snug text-slate-950">{voucher.title}</h3>
          </div>
          <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-brand-700">{voucher.expiresIn}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{voucher.description}</p>
        <p className="mt-3 text-xs font-bold text-slate-500">
          {voucher.minSpend ? `Đơn tối thiểu ${voucher.minSpend.toLocaleString('vi-VN')} đ` : 'Không yêu cầu giá trị tối thiểu'}
        </p>
        <button
          type="button"
          onClick={() => onSave(voucher)}
          disabled={isSaved}
          className="mt-4 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-black text-white transition hover:bg-brand-700 disabled:cursor-default disabled:bg-slate-300"
        >
          {isSaved ? 'Đã lưu' : 'Lưu mã'}
        </button>
      </div>
    </article>
  );
}

function PopupMoiDangNhap({ open, onClose, onAuth }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/55 px-4 backdrop-blur-sm"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 text-center shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-2xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          aria-label="Đóng popup"
        >
          ×
        </button>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-base font-black text-white">DB</div>
        <p className="mt-5 text-sm font-black uppercase tracking-wide text-brand-700">Ưu đãi thành viên mới</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Đăng nhập / đăng ký để nhận ngay ưu đãi cực hấp dẫn</h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-slate-600">
          Giảm ngay <span className="font-black text-slate-950">10%</span> cho booking khách sạn đầu tiên khi dùng tài khoản DieuBel.
        </p>
        <button
          type="button"
          onClick={onAuth}
          className="mt-6 w-full rounded-xl bg-brand-600 px-5 py-4 text-base font-black text-white shadow-sm shadow-brand-500/25 transition hover:bg-brand-700"
        >
          Đăng nhập hoặc đăng ký
        </button>
      </div>
    </div>
  );
}

function HopThoaiVoucher({ open, vouchers, savedCodes, onClose, onSave }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm font-black text-brand-700">Kho ưu đãi DieuBel</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Tất cả mã giảm giá</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          {vouchers.map((voucher) => (
            <TheVoucher key={voucher.id} voucher={voucher} isSaved={savedCodes.includes(voucher.code)} onSave={onSave} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrangChu() {
  const navigate = useNavigate();
  const token = useKhoXacThuc((state) => state.token);
  const voucherMessageTimerRef = useRef(null);
  const { searches, addSearch, clearAll } = useTimKiemGanDay();
  const [activeHero, setActiveHero] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [showLoginOffer, setShowLoginOffer] = useState(false);
  const [showHopThoaiVoucher, setShowHopThoaiVoucher] = useState(false);
  const [savedCodes, setSavedCodes] = useState(() => docQuaDaDoi().map((reward) => reward.code));
  const [vouchers, setVouchers] = useState(VOUCHER_KHUYEN_MAI);
  const [voucherMessage, setVoucherMessage] = useState('');
  const [reviewGroup, setReviewGroup] = useState(0);
  const [isReviewExiting, setIsReviewExiting] = useState(false);
  const [visibleReviewCount, setVisibleReviewCount] = useState(1);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featured-rooms'],
    queryFn: () => layPhongNoiBat(6),
  });

  const goToHero = (index) => {
    setActiveHero((index + SLIDE_HERO.length) % SLIDE_HERO.length);
  };

  useEffect(() => {
    if (isHeroPaused || showLoginOffer || showHopThoaiVoucher) return undefined;

    const timer = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % SLIDE_HERO.length);
    }, 7500);

    return () => window.clearInterval(timer);
  }, [isHeroPaused, showLoginOffer, showHopThoaiVoucher]);

  useEffect(() => {
    setVisibleReviewCount(1);
    setIsReviewExiting(false);

    const revealTimers = CAC_SLOT_DANH_GIA.slice(1).map((slot) =>
      window.setTimeout(() => setVisibleReviewCount(slot + 1), slot * THOI_GIAN_HIEN_TUNG_DANH_GIA),
    );
    const exitTimer = window.setTimeout(() => setIsReviewExiting(true), THOI_GIAN_BAT_DAU_THOAT_DANH_GIA);
    const nextGroupTimer = window.setTimeout(() => {
      setVisibleReviewCount(1);
      setIsReviewExiting(false);
      setReviewGroup((current) => (current + 1) % TONG_NHOM_DANH_GIA);
    }, THOI_GIAN_BAT_DAU_THOAT_DANH_GIA + THOI_GIAN_THOAT_NHOM_DANH_GIA);

    return () => {
      revealTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(exitTimer);
      window.clearTimeout(nextGroupTimer);
    };
  }, [reviewGroup]);

  useEffect(() => {
    if (token || window.sessionStorage.getItem('dieubel_login_offer_closed') === 'true') {
      return;
    }

    const popupTimer = window.setTimeout(() => setShowLoginOffer(true), 450);
    return () => window.clearTimeout(popupTimer);
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    layDanhSachVoucherApi()
      .then((nextVouchers) => {
        if (!cancelled && Array.isArray(nextVouchers) && nextVouchers.length) {
          setVouchers(nextVouchers);
        }
      })
      .catch(() => {
        if (!cancelled) setVouchers(VOUCHER_KHUYEN_MAI);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const refreshSavedCodes = () => {
      setSavedCodes(docQuaDaDoi().map((reward) => reward.code));
    };

    refreshSavedCodes();
    window.addEventListener('storage', refreshSavedCodes);
    window.addEventListener('focus', refreshSavedCodes);
    document.addEventListener('visibilitychange', refreshSavedCodes);
    return () => {
      window.removeEventListener('storage', refreshSavedCodes);
      window.removeEventListener('focus', refreshSavedCodes);
      document.removeEventListener('visibilitychange', refreshSavedCodes);
    };
  }, []);

  useEffect(() => {
    const overlayOpen = showHopThoaiVoucher || (showLoginOffer && !token);
    if (!overlayOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (showHopThoaiVoucher) {
        setShowHopThoaiVoucher(false);
        return;
      }
      window.sessionStorage.setItem('dieubel_login_offer_closed', 'true');
      setShowLoginOffer(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLoginOffer, showHopThoaiVoucher, token]);

  useEffect(() => {
    return () => {
      if (voucherMessageTimerRef.current) {
        window.clearTimeout(voucherMessageTimerRef.current);
      }
    };
  }, []);

  const handleSearch = (form = {}) => {
    addSearch(form);

    const params = new URLSearchParams();
    ganThamSoTimKiem(params, form);
    params.set('sort', 'popular');
    params.set('limit', '12');

    navigate(`/rooms?${params.toString()}`);
  };

  const closeLoginOffer = () => {
    window.sessionStorage.setItem('dieubel_login_offer_closed', 'true');
    setShowLoginOffer(false);
  };

  const goToAuthOffer = () => {
    window.sessionStorage.setItem('dieubel_login_offer_closed', 'true');
    navigate('/auth?mode=login&redirect=/');
  };

  const openHopThoaiVoucher = () => {
    setSavedCodes(docQuaDaDoi().map((reward) => reward.code));
    setShowHopThoaiVoucher(true);
  };

  const handleSaveVoucher = async (voucher) => {
    try {
      const saved = await luuVoucherApi(voucher.code);
      setSavedCodes(saved.map((reward) => reward.code));
    } catch {
      const next = luuVoucherKhuyenMai(voucher);
      setSavedCodes(next.map((reward) => reward.code));
    }
    setVoucherMessage('Đã lưu mã thành công, vui lòng kiểm tra trong kho voucher của bạn ở Page Tôi.');
    if (voucherMessageTimerRef.current) {
      window.clearTimeout(voucherMessageTimerRef.current);
    }
    voucherMessageTimerRef.current = window.setTimeout(() => setVoucherMessage(''), 3600);
  };

  return (
    <main>
      <PopupMoiDangNhap open={showLoginOffer && !token} onClose={closeLoginOffer} onAuth={goToAuthOffer} />
      <HopThoaiVoucher
        open={showHopThoaiVoucher}
        vouchers={vouchers}
        savedCodes={savedCodes}
        onClose={() => setShowHopThoaiVoucher(false)}
        onSave={handleSaveVoucher}
      />
      <section
        className="relative bg-slate-950 text-white"
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
        onFocusCapture={() => setIsHeroPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsHeroPaused(false);
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="flex h-full transition-transform duration-700 ease-out"
            style={{ width: `${SLIDE_HERO.length * 100}%`, transform: `translateX(-${activeHero * (100 / SLIDE_HERO.length)}%)` }}
          >
            {SLIDE_HERO.map((slide) => (
              <div
                key={slide.image}
                className="h-full bg-cover bg-center"
                style={{
                  width: `${100 / SLIDE_HERO.length}%`,
                  backgroundImage: `linear-gradient(180deg, rgba(3,7,18,0.46) 0%, rgba(3,7,18,0.38) 48%, rgba(3,7,18,0.84) 100%), url(${slide.image})`,
                }}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          aria-label="Ảnh trước"
          onClick={() => goToHero(activeHero - 1)}
          className="absolute left-3 top-[44%] z-20 flex h-16 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-950/28 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-md transition hover:-translate-x-0.5 hover:border-white/50 hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20 sm:left-5 sm:h-20 sm:w-12 lg:left-6 lg:h-24 lg:w-14"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Ảnh tiếp theo"
          onClick={() => goToHero(activeHero + 1)}
          className="absolute right-3 top-[44%] z-20 flex h-16 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-950/28 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-md transition hover:translate-x-0.5 hover:border-white/50 hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20 sm:right-5 sm:h-20 sm:w-12 lg:right-6 lg:h-24 lg:w-14"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true">
            <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-slate-950/80 to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[660px] max-w-7xl flex-col items-center px-4 pb-36 pt-14 text-center sm:px-6 lg:min-h-[700px] lg:pt-16">
          <span className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur">
            {SLIDE_HERO[activeHero].label}
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:text-6xl lg:text-[64px]">
            {SLIDE_HERO[activeHero].title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-sky-50">{SLIDE_HERO[activeHero].description}</p>

          <div className="relative z-30 mt-10 w-full max-w-5xl">
            <ThanhTimKiem onSubmit={handleSearch} submitLabel="Tìm kiếm" />
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
              <span className="font-semibold text-white/80">Phổ biến:</span>
              {[
                ['Ha Noi', 'Hà Nội'],
                ['Da Nang', 'Đà Nẵng'],
                ['Phu Quoc', 'Phú Quốc'],
                ['Hoi An', 'Hội An'],
                ['Nha Trang', 'Nha Trang'],
              ].map(([city, label]) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSearch({ city, guests: '2', adults: '2', children: '0', rooms: '1', availableOnly: true })}
                  className="font-bold text-white underline-offset-4 hover:underline"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 flex items-center gap-2">
            {SLIDE_HERO.map((slide, index) => (
              <button
                key={slide.image}
                type="button"
                aria-label={`Chọn ảnh ${index + 1}`}
                onClick={() => goToHero(index)}
                className={`h-2.5 rounded-full transition-all ${activeHero === index ? 'w-9 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-0 bg-gradient-to-r from-slate-950 via-brand-900 to-teal-800 px-4 py-8">
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {THONG_KE_TIN_CAY.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 text-center shadow-2xl shadow-slate-950/20 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
              >
                <p className="text-4xl font-black text-white">{item.value}</p>
                <p className="mt-2 text-sm font-extrabold text-sky-50">{item.label}</p>
                <p className="mt-1 text-xs font-semibold text-sky-100/80">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Bộ sưu tập lưu trú</span>
            <h2 className="mt-3 section-title">Chọn nhanh theo kiểu chuyến đi</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {BO_SUU_TAP.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => handleSearch(item.query)}
              className="group relative min-h-[230px] overflow-hidden rounded-2xl bg-slate-950 text-left shadow-sm"
            >
              <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
              <div className="relative flex h-full min-h-[230px] flex-col justify-end p-5 text-white">
                <h3 className="text-2xl font-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-sky-50">{item.detail}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_65px_-54px_rgba(15,23,42,0.45)] lg:grid-cols-[minmax(0,1.04fr)_minmax(340px,0.96fr)]">
            <div className="review-stream-panel relative h-full overflow-hidden bg-slate-950 p-5 text-white sm:p-6">
              <div className="relative z-10 max-w-xl">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-bold text-white/90">
                  Đánh giá khách hàng
                </span>
                <h2 className="mt-3 text-3xl font-black tracking-tight">Khách nói gì sau khi đặt phòng</h2>
                <p className="mt-2 max-w-lg text-sm leading-7 text-white/72">
                  Các phản hồi được đặt cạnh những ưu điểm chính để khách mới hiểu vì sao DieuBel được chọn nhiều hơn.
                </p>
              </div>

              <div className="review-popup-stage relative z-10 mt-5 h-[420px] overflow-hidden sm:h-[448px] lg:h-[432px]">
                {CAC_SLOT_DANH_GIA.map((slot) => {
                  const review = BINH_LUAN_POPUP[reviewGroup * SO_DANH_GIA_MOI_LUOT + slot];
                  if (!review) return null;

                  return (
                    <div key={slot} className="review-popup-slot">
                      {slot < visibleReviewCount ? (
                        <TheDanhGiaPopup
                          key={`${review.name}-${reviewGroup}`}
                          review={review}
                          isExiting={isReviewExiting}
                          exitDirection={slot % 2 === 0 ? 'left' : 'right'}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="bg-gradient-to-br from-white via-slate-50 to-brand-50/60 p-5 sm:p-6">
              <span className="eyebrow">Vì sao chọn DieuBel</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Đặt phòng nhanh, thông tin rõ ràng</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                DieuBel giúp khách so sánh chỗ ở, kiểm tra giá và hoàn tất đặt phòng trong vài bước. Mọi thông tin cần thiết đều được trình bày rõ trước khi thanh toán.
              </p>

              <div className="mt-5 grid gap-3">
                {DIEM_TIN_CAY.map((point, index) => (
                  <article key={point.title} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-base font-black text-slate-950">{point.title}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{point.detail}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Điểm đến nổi bật</span>
            <h2 className="mt-3 section-title">Gợi ý theo điểm đến</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/rooms?sort=popular&limit=12')}
            className="rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-bold text-brand-700 transition hover:bg-sky-50"
          >
            Xem toàn bộ
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {DIEM_DEN.map((item) => (
            <button
              key={item.city}
              type="button"
              onClick={() => handleSearch({ city: item.city, guests: '2', adults: '2', rooms: '1', availableOnly: true })}
              className="group relative min-h-[250px] overflow-hidden rounded-2xl bg-slate-900 text-left shadow-sm"
            >
              <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <div className="relative flex h-full min-h-[250px] flex-col justify-end p-5 text-white">
                <p className="text-sm font-bold text-sky-100">Việt Nam</p>
                <h3 className="mt-2 text-2xl font-black">{item.name}</h3>
                <p className="mt-2 text-sm leading-6 text-sky-50">{item.note}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Ưu đãi</span>
              <h2 className="mt-3 section-title">Khuyến mãi chỗ ở</h2>
            </div>
            <button
              type="button"
              onClick={openHopThoaiVoucher}
              className="rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-black text-brand-700 transition hover:bg-sky-50"
            >
              Xem tất cả
            </button>
          </div>

          <div className="mt-6 flex gap-5 overflow-x-auto pb-3">
            {vouchers.slice(0, 5).map((voucher) => (
              <button
                key={voucher.id}
                type="button"
                onClick={openHopThoaiVoucher}
                className="group min-w-[290px] text-left sm:min-w-[360px]"
              >
                <HinhVoucher voucher={voucher} className="transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl" />
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {vouchers.slice(0, 3).map((voucher) => (
              <TheVoucher
                key={voucher.id}
                voucher={voucher}
                compact
                isSaved={savedCodes.includes(voucher.code)}
                onSave={handleSaveVoucher}
              />
            ))}
          </div>
          {voucherMessage ? (
            <p className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">{voucherMessage}</p>
          ) : null}
        </div>
      </section>

      {searches.length > 0 ? (
        <section className="bg-sky-50/70">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="eyebrow">Tìm kiếm gần đây</span>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">
                  Tiếp tục tiêu chí bạn vừa tìm
                </h2>
              </div>
              <button
                type="button"
                onClick={clearAll}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-brand-500 hover:text-brand-700"
              >
                Xóa lịch sử
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {searches.slice(0, 3).map((search) => (
                <button
                  key={search.id}
                  type="button"
                  onClick={() => handleSearch(search)}
                  className="rounded-2xl border border-sky-100 bg-white p-4 text-left transition hover:border-brand-500"
                >
                  <p className="text-sm font-bold text-brand-700">{search.city || 'Mọi điểm đến'}</p>
                  <p className="mt-2 text-base font-extrabold text-slate-950">
                    {search.guests || 2} khách · {search.rooms || 1} phòng
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {search.checkIn && search.checkOut ? `${search.checkIn} - ${search.checkOut}` : 'Lọc theo nhu cầu'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="featured" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Được yêu thích</span>
            <h2 className="mt-3 section-title">Khách sạn được yêu thích</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/rooms?sort=rating_desc&availableOnly=true&limit=12')}
            className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-700"
          >
            Xem toàn bộ khách sạn
          </button>
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <KhungThePhong key={`featured-skeleton-${index}`} compact />
            ))}
          </div>
        ) : isError ? (
          <div className="surface-card mt-8 p-6 text-sm leading-7 text-slate-600">
            Không tải được danh sách nổi bật. Kiểm tra backend rồi tải lại trang.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {data?.slice(0, 6).map((room) => <ThePhong key={room.id} room={room} layout="vertical" />)}
          </div>
        )}
      </section>

      <BangMoiThanhVien className="mx-4 mb-12 sm:mx-6 xl:mx-auto xl:max-w-7xl" />

    </main>
  );
}

export default TrangChu;
