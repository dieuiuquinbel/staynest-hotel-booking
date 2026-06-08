// Chức năng: Card hiển thị thông tin phòng/khách sạn.
import { memo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dinhDangTien } from '../../utils/dinhDang';
import { resolveMediaUrl } from '../../utils/media';
import { layThongTinTinhTrangPhong } from '../../utils/tinhTrangPhong';
import useKhoXacThuc from '../../store/khoXacThuc';
import { toggleYeuThichApi } from '../../services/phongApi';

const NHAN_LOAI_PHONG = {
  standard: 'Tiêu chuẩn',
  superior: 'Superior',
  deluxe: 'Deluxe',
  suite: 'Suite',
  family: 'Gia đình',
};

const NHAN_TIEN_NGHI = {
  wifi: 'Wi-Fi',
  air_conditioner: 'Điều hòa',
  breakfast: 'Bữa sáng',
  pool: 'Hồ bơi',
  parking: 'Bãi đỗ xe',
  balcony: 'Ban công',
};

function dinhDangTienNghi(amenity) {
  return NHAN_TIEN_NGHI[amenity] || amenity.replaceAll('_', ' ');
}

function dinhDangDiem(value) {
  const rating = Number(value || 0);
  return rating ? rating.toFixed(1) : '0.0';
}

function NutYeuThich({ room, isFavoriteView, onFavoriteToggle }) {
  const token = useKhoXacThuc((state) => state.token);
  const setShowLoginOffer = useKhoXacThuc((state) => state.setShowLoginOffer);
  const favoriteRooms = useKhoXacThuc((state) => state.favoriteRooms);
  const addFavoriteRoom = useKhoXacThuc((state) => state.addFavoriteRoom);
  const removeFavoriteRoom = useKhoXacThuc((state) => state.removeFavoriteRoom);
  const [isLoading, setIsLoading] = useState(false);

  const favorite = favoriteRooms.includes(room.id);
  const isCrossOutStyle = isFavoriteView && favorite;

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        if (!token) {
          setShowLoginOffer(true);
          return;
        }

        try {
          setIsLoading(true);
          const { isFavorite } = await toggleYeuThichApi(room.id);
          if (isFavorite) {
            addFavoriteRoom(room.id);
          } else {
            removeFavoriteRoom(room.id);
          }
          if (onFavoriteToggle) onFavoriteToggle();
        } catch (error) {
          console.error('Lỗi khi cập nhật danh sách yêu thích', error);
        } finally {
          setIsLoading(false);
        }
      }}
      className={`flex w-full items-center justify-center rounded-xl border-2 px-4 py-2.5 text-xs font-bold transition active:scale-[0.98] ${
        isCrossOutStyle
          ? 'border-transparent bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600'
          : favorite
            ? 'border-pink-400 bg-pink-50 text-pink-600 hover:bg-pink-100'
            : 'border-transparent bg-[#f7f7f7] text-[#6d6265] hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600'
      }`}
      aria-label={favorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
    >
      {isCrossOutStyle ? (
        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
      ) : favorite ? (
        <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
      ) : (
        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
      )}
      {isCrossOutStyle ? 'Xóa khỏi danh sách' : favorite ? 'Đã lưu' : 'Lưu phòng'}
    </button>
  );
}

function TheTienNghi({ room, amenities }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <span className="rounded-full border border-[#eadfe2] bg-white px-3 py-1 text-xs font-bold text-[#241f21]">
        {NHAN_LOAI_PHONG[room.room_type] || room.room_type}
      </span>
      {amenities.map((amenity) => (
        <span key={`${room.id}-${amenity}`} className="rounded-full bg-brand-50/70 px-3 py-1 text-xs font-semibold text-[#6d6265]">
          {dinhDangTienNghi(amenity)}
        </span>
      ))}
    </div>
  );
}

function ThePhong({ room, layout = 'horizontal', isFavoriteView, onFavoriteToggle }) {
  const navigate = useNavigate();
  const availability = layThongTinTinhTrangPhong(room.inventory_count);
  const amenities = room.amenities?.slice(0, layout === 'horizontal' ? 5 : 4) || [];
  const canBook = Number(room.inventory_count) > 0;
  const detailPath = `/rooms/${room.id}`;

  const openDetail = () => {
    navigate(detailPath);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetail();
    }
  };

  if (layout === 'vertical') {
    return (
      <article
        role="link"
        tabIndex={0}
        onClick={openDetail}
        onKeyDown={handleCardKeyDown}
        className="subtle-card flex h-full cursor-pointer flex-col overflow-hidden focus:outline-none focus:ring-4 focus:ring-brand-100"
      >
        <div className="relative h-60 overflow-hidden bg-[#f7f7f7]">
          <img
            src={resolveMediaUrl(room.image_url)}
            alt={`${room.hotel_name} ${room.room_name}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${availability.lopHuyHieu}`}>
            {availability.label}
          </span>
          <span className="absolute right-3 top-3 rounded-full bg-white/94 px-3 py-2 text-sm font-black text-[#241f21] shadow-[0_12px_30px_-22px_rgba(36,31,33,0.55)]">
            {dinhDangDiem(room.rating_avg)}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#6d6265]">{room.city}</p>
              <h3 className="mt-2 line-clamp-2 text-lg font-black leading-6 tracking-tight text-[#241f21]">{room.hotel_name}</h3>
              <p className="mt-1 text-sm font-semibold text-[#6d6265]">{room.room_name}</p>
            </div>
          </div>

          <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#3f3f3f]">{room.description}</p>
          <TheTienNghi room={room} amenities={amenities} />

          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div className="text-right">
              <p className="text-xs font-semibold text-[#6d6265]">Giá mỗi đêm</p>
              <div className="mt-1 flex flex-col items-end">
                <p className="text-xs font-medium text-red-500 line-through">
                  {dinhDangTien(room.price_per_night * 1.3)}
                </p>
                <p className="text-xl font-black tabular-nums text-[#241f21]">{dinhDangTien(room.price_per_night)}</p>
              </div>
              <p className="text-xs text-[#6a6a6a]">Tối đa {room.max_guests || 2} khách</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-black text-white shadow-[0_14px_32px_-24px_rgba(255,56,92,0.9)] transition hover:-translate-y-0.5 hover:bg-brand-700 active:scale-[0.98]"
              >
                Chọn phòng
              </button>
              <NutYeuThich room={room} isFavoriteView={isFavoriteView} onFavoriteToggle={onFavoriteToggle} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={handleCardKeyDown}
      className="subtle-card grid cursor-pointer overflow-hidden bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 lg:grid-cols-[320px_minmax(0,1fr)_220px]"
    >
      <div className="relative min-h-[250px] overflow-hidden bg-[#f7f7f7]">
        <img
          src={resolveMediaUrl(room.image_url)}
          alt={`${room.hotel_name} ${room.room_name}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${availability.lopHuyHieu}`}>
          {availability.label}
        </span>
      </div>

      <div className="min-w-0 p-5 lg:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#eadfe2] bg-white px-3 py-1 text-xs font-bold text-[#241f21]">
            {NHAN_LOAI_PHONG[room.room_type] || room.room_type}
          </span>
          {room.free_cancellation ? (
            <span className="rounded-full bg-brand-50/70 px-3 py-1 text-xs font-bold text-[#241f21]">Hủy miễn phí</span>
          ) : null}
          {room.breakfast_included ? (
            <span className="rounded-full bg-brand-50/70 px-3 py-1 text-xs font-bold text-[#241f21]">Bữa sáng</span>
          ) : null}
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <h3 className="text-[24px] font-black leading-tight tracking-tight text-[#241f21]">{room.hotel_name}</h3>
        </div>
        <p className="mt-1 text-sm font-medium text-[#3f3f3f]">{room.room_name}</p>
        <p className="mt-2 line-clamp-1 text-sm font-normal text-[#6a6a6a]">{room.address}</p>
        <p className="mt-4 line-clamp-2 text-sm leading-7 text-[#3f3f3f]">{room.description}</p>
        <TheTienNghi room={room} amenities={amenities} />
      </div>

      <div className="flex flex-col justify-between border-t border-[#eadfe2] bg-[#fffaf8] p-5 lg:border-l lg:border-t-0">
        <div className="flex items-start justify-between gap-4 lg:block">
          <div className="rounded-2xl border border-[#eadfe2] bg-white px-4 py-3 text-[#241f21] shadow-[0_14px_44px_-38px_rgba(36,31,33,0.5)]">
            <p className="text-xs font-semibold text-[#6d6265]">Đánh giá</p>
            <p className="mt-1 text-3xl font-black tabular-nums">{dinhDangDiem(room.rating_avg)}</p>
            <p className="mt-1 text-xs text-[#6a6a6a]">{room.total_reviews} lượt đánh giá</p>
          </div>
          <div className="text-right lg:mt-5 lg:text-left">
            <p className="text-xs font-semibold text-[#6d6265]">Giá mỗi đêm</p>
            <div className="mt-1 flex flex-col items-end lg:items-start">
              <p className="text-sm font-medium text-red-500 line-through">
                {dinhDangTien(room.price_per_night * 1.3)}
              </p>
              <p className="text-2xl font-black tracking-tight tabular-nums text-[#241f21]">{dinhDangTien(room.price_per_night)}</p>
            </div>
            <p className="mt-1 text-sm text-[#6a6a6a]">Tối đa {room.max_guests || 2} khách</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <p className={`text-sm font-semibold leading-6 ${availability.textClass}`}>{availability.description(room.inventory_count)}</p>
          <button
            type="button"
            className={`rounded-xl px-4 py-3 text-center text-sm font-black text-white transition active:scale-[0.98] ${
              canBook ? 'bg-brand-600 shadow-[0_14px_32px_-24px_rgba(255,56,92,0.9)] hover:-translate-y-0.5 hover:bg-brand-700' : 'cursor-not-allowed bg-[#ffd1da]'
            }`}
          >
            {canBook ? 'Chọn phòng' : 'Hết phòng'}
          </button>
          <NutYeuThich room={room} isFavoriteView={isFavoriteView} onFavoriteToggle={onFavoriteToggle} />
        </div>
      </div>
    </article>
  );
}

export default memo(ThePhong);
