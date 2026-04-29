import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import RoomCard from '../components/rooms/RoomCard';
import RoomCardSkeleton from '../components/rooms/RoomCardSkeleton';
import SearchBar from '../components/search/SearchBar';
import useRecentSearches from '../hooks/useRecentSearches';
import { getFeaturedRooms } from '../services/roomApi';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1900&q=88';

const DESTINATIONS = [
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

const OFFERS = [
  { title: 'Ưu đãi cuối tuần', detail: 'Giảm đến 15% cho khách sạn biển còn phòng.', tag: 'Từ thứ Sáu' },
  { title: 'Bữa sáng miễn phí', detail: 'Một số phòng suite và family đã bao gồm bữa sáng.', tag: 'Gói gia đình' },
  { title: 'Hủy linh hoạt', detail: 'Lọc nhanh các chỗ ở hỗ trợ hủy miễn phí.', tag: 'An tâm đặt' },
];

const TRUST_STATS = [
  { value: '500+', label: 'khách sạn & khu nghỉ dưỡng' },
  { value: '50 nghìn+', label: 'khách đã đặt phòng' },
  { value: '12', label: 'thành phố phổ biến' },
  { value: '4.9+', label: 'đánh giá trung bình' },
];

function appendSearchParams(params, form) {
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

function HomePage() {
  const navigate = useNavigate();
  const { searches, addSearch, clearAll } = useRecentSearches();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featured-rooms'],
    queryFn: () => getFeaturedRooms(6),
  });

  const handleSearch = (form = {}) => {
    addSearch(form);

    const params = new URLSearchParams();
    appendSearchParams(params, form);
    params.set('sort', 'popular');
    params.set('limit', '12');

    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <main>
      <section
        className="relative overflow-hidden bg-slate-950 text-white"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(3,7,18,0.48) 0%, rgba(3,7,18,0.42) 48%, rgba(3,7,18,0.82) 100%), url(${HERO_IMAGE})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/70 to-transparent" />
        <div className="mx-auto flex min-h-[560px] max-w-7xl flex-col items-center justify-center px-4 py-14 text-center sm:px-6">
          <span className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur">
            Hơn 500 khách sạn trên toàn Việt Nam
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:text-6xl">
            Kỳ nghỉ hoàn hảo bắt đầu từ đây
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-sky-50">
            Tìm ưu đãi khách sạn, resort và căn hộ phù hợp với điểm đến, thời gian và số lượng khách của bạn.
          </p>

          <div className="mt-8 w-full max-w-5xl">
            <SearchBar onSubmit={handleSearch} submitLabel="Tìm kiếm" />
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
              <span className="font-semibold text-white/80">Phổ biến:</span>
              {['Hà Nội', 'Đà Nẵng', 'Phú Quốc', 'Hội An', 'Nha Trang'].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSearch({ city, guests: '2', adults: '2', children: '0', rooms: '1', availableOnly: true })}
                  className="font-bold text-white underline-offset-4 hover:underline"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="premium-band">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 py-7 text-center sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {TRUST_STATS.map((item) => (
              <div key={item.label}>
                <p className="text-3xl font-black text-white">{item.value}</p>
                <p className="mt-1 text-sm font-medium text-sky-100">{item.label}</p>
              </div>
            ))}
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
          {DESTINATIONS.map((item) => (
            <button
              key={item.city}
              type="button"
              onClick={() => handleSearch({ city: item.city, guests: '2', adults: '2', rooms: '1', availableOnly: true })}
              className="group relative min-h-[250px] overflow-hidden rounded-2xl bg-slate-900 text-left shadow-sm"
            >
              <img
                src={item.image}
                alt={item.name}
                className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105"
              />
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
              <h2 className="mt-3 section-title">Ưu đãi đang áp dụng</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {OFFERS.map((offer) => (
              <article key={offer.title} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-amber-50/50 p-5 shadow-sm">
                <p className="text-sm font-extrabold text-amber-700">{offer.tag}</p>
                <h3 className="mt-3 text-xl font-black text-slate-950">{offer.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{offer.detail}</p>
              </article>
            ))}
          </div>
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
              <RoomCardSkeleton key={`featured-skeleton-${index}`} compact />
            ))}
          </div>
        ) : isError ? (
          <div className="surface-card mt-8 p-6 text-sm leading-7 text-slate-600">
            Không tải được danh sách nổi bật. Kiểm tra backend rồi tải lại trang.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {data?.slice(0, 6).map((room) => <RoomCard key={room.id} room={room} layout="vertical" />)}
          </div>
        )}
      </section>
    </main>
  );
}

export default HomePage;
