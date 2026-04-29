import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ActiveFilterChips from '../components/rooms/ActiveFilterChips';
import FilterSidebar from '../components/rooms/FilterSidebar';
import RoomCard from '../components/rooms/RoomCard';
import RoomCardSkeleton from '../components/rooms/RoomCardSkeleton';
import SearchBar from '../components/search/SearchBar';
import useRecentSearches from '../hooks/useRecentSearches';
import { getFeaturedRooms, getRooms } from '../services/roomApi';
import { formatCurrency } from '../utils/format';

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

function parseCsv(value) {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function RoomListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addSearch } = useRecentSearches();

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let changed = false;
    if (!params.get('sort')) {
      params.set('sort', 'popular');
      changed = true;
    }
    if (!params.get('limit')) {
      params.set('limit', '12');
      changed = true;
    }
    if (changed) setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const queryString = searchParams.toString();
  const roomQuery = useQuery({
    queryKey: ['rooms', queryString],
    queryFn: () => getRooms(queryString),
    placeholderData: (previousData) => previousData,
  });
  const featuredQuery = useQuery({
    queryKey: ['featured-rooms-list-page'],
    queryFn: () => getFeaturedRooms(3),
  });

  const roomTypes = parseCsv(searchParams.get('roomType'));
  const amenities = parseCsv(searchParams.get('amenities'));
  const rawGuests = searchParams.get('guests');
  const filters = {
    city: searchParams.get('city') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: rawGuests || '2',
    adults: searchParams.get('adults') || rawGuests || '2',
    children: searchParams.get('children') || '0',
    rooms: searchParams.get('rooms') || '1',
    roomTypeForSearch: roomTypes[0] || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    sort: searchParams.get('sort') || 'popular',
    roomTypes,
    amenities,
    breakfastIncluded: searchParams.get('breakfastIncluded') === 'true',
    freeCancellation: searchParams.get('freeCancellation') === 'true',
    availableOnly: searchParams.get('availableOnly') === 'true',
  };

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      const shouldDelete =
        value === '' ||
        value === null ||
        value === undefined ||
        value === false ||
        (Array.isArray(value) && value.length === 0);

      if (shouldDelete) {
        next.delete(key);
        return;
      }
      next.set(key, Array.isArray(value) ? value.join(',') : String(value));
    });
    next.set('sort', next.get('sort') || 'popular');
    next.set('limit', next.get('limit') || '12');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSearchSubmit = (form) => {
    addSearch(form);
    updateParams({
      city: form.city,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      adults: form.adults,
      children: form.children,
      rooms: form.rooms,
      guests: form.guests,
      roomType: form.roomType ? [form.roomType] : [],
      minPrice: form.minPrice,
      maxPrice: form.maxPrice,
      minRating: form.minRating,
      amenities: form.amenities,
      breakfastIncluded: form.breakfastIncluded,
      freeCancellation: form.freeCancellation,
      availableOnly: form.availableOnly,
    });
  };

  const handleFieldChange = (field, value) => updateParams({ [field]: value });
  const toggleArrayParam = (field, currentValues, value) => {
    const exists = currentValues.includes(value);
    updateParams({ [field]: exists ? currentValues.filter((item) => item !== value) : [...currentValues, value] });
  };
  const handleRemoveChip = (chip) => {
    if (chip.type === 'array') {
      const values = chip.field === 'roomType' ? roomTypes : amenities;
      updateParams({ [chip.field]: values.filter((item) => item !== chip.value) });
      return;
    }
    updateParams({ [chip.field]: chip.resetValue ?? '' });
  };
  const resetFilters = () => {
    const next = new URLSearchParams();
    if (filters.city) next.set('city', filters.city);
    if (filters.checkIn) next.set('checkIn', filters.checkIn);
    if (filters.checkOut) next.set('checkOut', filters.checkOut);
    if (rawGuests) next.set('guests', rawGuests);
    next.set('sort', 'popular');
    next.set('limit', '12');
    setSearchParams(next);
  };

  const chips = [
    filters.city ? { key: 'city', field: 'city', label: `Điểm đến: ${filters.city}` } : null,
    filters.checkIn ? { key: 'checkIn', field: 'checkIn', label: `Nhận phòng: ${filters.checkIn}` } : null,
    filters.checkOut ? { key: 'checkOut', field: 'checkOut', label: `Trả phòng: ${filters.checkOut}` } : null,
    rawGuests ? { key: 'guests', field: 'guests', label: `${rawGuests} khách` } : null,
    ...roomTypes.map((value) => ({
      key: `roomType-${value}`,
      field: 'roomType',
      type: 'array',
      value,
      label: `Loại: ${ROOM_TYPE_LABELS[value] || value}`,
    })),
    ...amenities.map((value) => ({
      key: `amenity-${value}`,
      field: 'amenities',
      type: 'array',
      value,
      label: `Tiện nghi: ${AMENITY_LABELS[value] || value.replaceAll('_', ' ')}`,
    })),
    filters.minPrice ? { key: 'minPrice', field: 'minPrice', label: `Từ ${formatCurrency(filters.minPrice)}` } : null,
    filters.maxPrice ? { key: 'maxPrice', field: 'maxPrice', label: `Đến ${formatCurrency(filters.maxPrice)}` } : null,
    filters.minRating ? { key: 'minRating', field: 'minRating', label: `Từ ${filters.minRating}.0 điểm` } : null,
    filters.breakfastIncluded ? { key: 'breakfastIncluded', field: 'breakfastIncluded', label: 'Có bữa sáng' } : null,
    filters.freeCancellation ? { key: 'freeCancellation', field: 'freeCancellation', label: 'Hủy miễn phí' } : null,
    filters.availableOnly ? { key: 'availableOnly', field: 'availableOnly', label: 'Chỉ còn phòng' } : null,
  ].filter(Boolean);

  const totalItems = roomQuery.data?.pagination?.totalItems ?? 0;

  return (
    <main className="search-page-bg">
      <section className="border-b border-sky-100 bg-white/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
          <div className="mb-5">
            <span className="eyebrow">Tìm kiếm khách sạn</span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              {totalItems} chỗ ở phù hợp{filters.city ? ` tại ${filters.city}` : ''}
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Nhập tiêu chí cơ bản ở trên, sau đó dùng bộ lọc bên trái để tinh chỉnh kết quả.
            </p>
          </div>

          <SearchBar
            key={queryString}
            compact
            showAdvanced
            defaultValues={{
              city: filters.city,
              checkIn: filters.checkIn,
              checkOut: filters.checkOut,
              adults: filters.adults,
              children: filters.children,
              rooms: filters.rooms,
              guests: filters.guests,
              roomType: filters.roomTypeForSearch,
              minPrice: filters.minPrice,
              maxPrice: filters.maxPrice,
              minRating: filters.minRating,
              amenities: filters.amenities,
              breakfastIncluded: filters.breakfastIncluded,
              freeCancellation: filters.freeCancellation,
              availableOnly: filters.availableOnly,
            }}
            onSubmit={handleSearchSubmit}
            submitLabel="Cập nhật"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-brand-700">Kết quả tìm kiếm</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
              {filters.city || 'Tất cả điểm đến'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {chips.length > 0 ? `${chips.length} tiêu chí đang bật` : 'Chưa có tiêu chí nâng cao'}
            </p>
          </div>

          <label className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm">
            <span className="mr-3 text-slate-500">Sắp xếp</span>
            <select
              value={filters.sort}
              onChange={(event) => handleFieldChange('sort', event.target.value)}
              className="border-none bg-transparent font-bold text-slate-950 outline-none"
            >
              <option value="popular">Phổ biến nhất</option>
              <option value="price_asc">Giá thấp nhất</option>
              <option value="price_desc">Giá cao nhất</option>
              <option value="rating_desc">Điểm cao nhất</option>
              <option value="newest">Mới nhất</option>
            </select>
          </label>
        </div>

        {chips.length > 0 ? (
          <div className="mt-4">
            <ActiveFilterChips chips={chips} onRemove={handleRemoveChip} onReset={resetFilters} />
          </div>
        ) : null}

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <FilterSidebar
            filters={filters}
            onFieldChange={handleFieldChange}
            onToggleRoomType={(value) => toggleArrayParam('roomType', roomTypes, value)}
            onToggleAmenity={(value) => toggleArrayParam('amenities', amenities, value)}
            onReset={resetFilters}
          />

          <div className="max-h-[calc(100vh-116px)] space-y-5 overflow-y-auto pr-1">
            {roomQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => <RoomCardSkeleton key={`list-skeleton-${index}`} />)
            ) : roomQuery.isError ? (
              <div className="surface-card p-8 text-center">
                <p className="text-sm font-bold text-amber-700">Không tải được API</p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">
                  Backend chưa sẵn sàng hoặc đang tắt.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Kiểm tra terminal backend rồi tải lại trang để xem danh sách chỗ ở.
                </p>
              </div>
            ) : roomQuery.data?.data?.length ? (
              roomQuery.data.data.map((room) => <RoomCard key={room.id} room={room} />)
            ) : (
              <div className="surface-card p-8 text-center">
                <p className="text-sm font-bold text-brand-700">Không có kết quả</p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">
                  Chưa tìm thấy chỗ ở khớp với tiêu chí.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Thử giảm mức giá, đổi thành phố, bỏ bớt tiện nghi hoặc xóa bộ lọc nâng cao.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
                  >
                    Xóa bộ lọc
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
                  >
                    Về trang chủ
                  </button>
                </div>
              </div>
            )}

            <section className="surface-card p-5 sm:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-brand-700">Gợi ý</p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">Chỗ ở điểm cao</h2>
                </div>
                <Link to="/" className="text-sm font-bold text-slate-500 transition hover:text-brand-700">
                  Trang chủ
                </Link>
              </div>

              {featuredQuery.isLoading ? (
                <div className="mt-6 grid gap-5 xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <RoomCardSkeleton key={`featured-list-${index}`} compact />
                  ))}
                </div>
              ) : featuredQuery.isError ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                  Không tải được gợi ý vì API đang lỗi.
                </div>
              ) : featuredQuery.data?.length ? (
                <div className="mt-6 grid gap-5 xl:grid-cols-3">
                  {featuredQuery.data.map((room) => (
                    <RoomCard key={`featured-${room.id}`} room={room} layout="vertical" />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                  Chưa có chỗ ở gợi ý để hiển thị.
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RoomListPage;
