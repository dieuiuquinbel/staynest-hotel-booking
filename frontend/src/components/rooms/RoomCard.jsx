import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { formatCurrency } from '../../utils/format';
import { buildBookingPath, buildLoginRedirectPath } from '../../utils/routes';
import { getAvailabilityMeta } from '../../utils/roomStatus';
import { isFavoriteRoom, toggleFavoriteRoom } from '../../utils/viewHistory';
import { useState } from 'react';

const ROOM_TYPE_LABELS = {
  standard: 'Tiêu chuẩn',
  superior: 'Superior',
  deluxe: 'Deluxe',
  suite: 'Suite',
  family: 'Gia đình',
};

const AMENITY_LABELS = {
  wifi: 'Wi-Fi',
  air_conditioner: 'Điều hòa',
  breakfast: 'Bữa sáng',
  pool: 'Hồ bơi',
  parking: 'Bãi đỗ xe',
  balcony: 'Ban công',
};

function formatAmenity(amenity) {
  return AMENITY_LABELS[amenity] || amenity.replaceAll('_', ' ');
}

function formatRating(value) {
  const rating = Number(value || 0);
  return rating ? rating.toFixed(1) : '0.0';
}

function FavoriteButton({ room }) {
  const [favorite, setFavorite] = useState(() => isFavoriteRoom(room.id));

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const next = toggleFavoriteRoom(room);
        setFavorite(next.some((item) => String(item.id) === String(room.id)));
      }}
      className={`rounded-full border px-3 py-1.5 text-xs font-extrabold transition ${
        favorite
          ? 'border-rose-200 bg-rose-50 text-rose-600'
          : 'border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-600'
      }`}
      aria-label={favorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
    >
      {favorite ? 'Yêu thích' : 'Lưu'}
    </button>
  );
}

function RoomCard({ room, layout = 'horizontal' }) {
  const token = useAuthStore((state) => state.token);
  const availability = getAvailabilityMeta(room.inventory_count);
  const amenities = room.amenities?.slice(0, layout === 'horizontal' ? 5 : 4) || [];
  const bookingPath = token ? buildBookingPath(room.id) : buildLoginRedirectPath(buildBookingPath(room.id));
  const canBook = Number(room.inventory_count) > 0;

  if (layout === 'vertical') {
    return (
      <article className="subtle-card flex h-full flex-col overflow-hidden">
        <div className="relative h-52 overflow-hidden bg-sky-100">
          <img
            src={room.image_url}
            alt={`${room.hotel_name} ${room.room_name}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${availability.badgeClass}`}>
            {availability.label}
          </span>
          <span className="absolute right-3 top-3 rounded-lg bg-white px-2.5 py-2 text-sm font-extrabold text-brand-700 shadow-sm">
            {formatRating(room.rating_avg)}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-brand-700">{room.city}</p>
              <h3 className="mt-2 line-clamp-2 text-lg font-extrabold leading-6 text-slate-950">
                {room.hotel_name}
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">{room.room_name}</p>
            </div>
            <FavoriteButton room={room} />
          </div>

          <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{room.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              {ROOM_TYPE_LABELS[room.room_type] || room.room_type}
            </span>
            {amenities.map((amenity) => (
              <span key={`${room.id}-${amenity}`} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-slate-600">
                {formatAmenity(amenity)}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div>
              <p className="text-xs font-semibold text-slate-500">Từ</p>
              <p className="text-lg font-extrabold text-slate-950">{formatCurrency(room.price_per_night)}</p>
              <p className="text-xs text-slate-500">mỗi đêm</p>
            </div>
            <Link
              to={`/rooms/${room.id}`}
              className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-700"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="subtle-card grid overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)_200px]">
      <div className="relative min-h-[230px] overflow-hidden bg-sky-100">
        <img
          src={room.image_url}
          alt={`${room.hotel_name} ${room.room_name}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${availability.badgeClass}`}>
          {availability.label}
        </span>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            {ROOM_TYPE_LABELS[room.room_type] || room.room_type}
          </span>
          {room.free_cancellation ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Hủy miễn phí
            </span>
          ) : null}
          {room.breakfast_included ? (
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
              Bữa sáng
            </span>
          ) : null}
          <FavoriteButton room={room} />
        </div>

        <h3 className="mt-3 text-xl font-extrabold tracking-tight text-slate-950">{room.hotel_name}</h3>
        <p className="mt-1 text-sm font-semibold text-slate-600">{room.room_name}</p>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{room.address}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{room.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {amenities.map((amenity) => (
            <span key={`${room.id}-${amenity}`} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-slate-600">
              {formatAmenity(amenity)}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-between border-t border-sky-100 bg-sky-50/60 p-5 lg:border-l lg:border-t-0">
        <div className="flex items-start justify-between gap-4 lg:flex-col lg:items-stretch">
          <div className="rounded-xl bg-brand-600 px-4 py-3 text-white shadow-sm shadow-brand-500/20">
            <p className="text-xs font-semibold text-sky-100">Đánh giá</p>
            <p className="mt-1 text-3xl font-extrabold">{formatRating(room.rating_avg)}</p>
            <p className="mt-1 text-xs text-sky-100">{room.total_reviews} lượt đánh giá</p>
          </div>
          <div className="text-right lg:text-left">
            <p className="text-xs font-semibold text-slate-500">Giá mỗi đêm</p>
            <p className="mt-1 text-xl font-extrabold text-slate-950">{formatCurrency(room.price_per_night)}</p>
            <p className="mt-1 text-sm text-slate-500">Tối đa {room.max_guests || 2} khách</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <p className={`text-sm font-bold ${availability.textClass}`}>{availability.description(room.inventory_count)}</p>
          <Link
            to={`/rooms/${room.id}`}
            className="rounded-xl border border-sky-200 bg-white px-4 py-3 text-center text-sm font-bold text-brand-700 transition hover:bg-sky-50"
          >
            Xem chi tiết
          </Link>
          <Link
            to={canBook ? bookingPath : `/rooms/${room.id}`}
            className={`rounded-xl px-4 py-3 text-center text-sm font-bold text-white transition ${
              canBook ? 'bg-brand-600 hover:bg-brand-700' : 'cursor-not-allowed bg-slate-300'
            }`}
          >
            {canBook ? (token ? 'Đặt ngay' : 'Đăng nhập đặt') : 'Hết phòng'}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default RoomCard;
