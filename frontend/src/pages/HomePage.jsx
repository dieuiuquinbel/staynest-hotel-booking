import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import RoomCard from '../components/rooms/RoomCard';
import RoomCardSkeleton from '../components/rooms/RoomCardSkeleton';
import SearchBar from '../components/search/SearchBar';
import MemberPromptBanner from '../components/layout/MemberPromptBanner';
import useRecentSearches from '../hooks/useRecentSearches';
import { getFeaturedRooms } from '../services/roomApi';

const HERO_SLIDES = [
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

const COLLECTIONS = [
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

const OFFERS = [
  { title: 'Ưu đãi cuối tuần', detail: 'Giảm đến 15% cho khách sạn biển còn phòng.', tag: 'Từ thứ Sáu' },
  { title: 'Bữa sáng miễn phí', detail: 'Một số phòng suite và family đã bao gồm bữa sáng.', tag: 'Gói gia đình' },
  { title: 'Hủy linh hoạt', detail: 'Lọc nhanh các chỗ ở hỗ trợ hủy miễn phí.', tag: 'An tâm đặt' },
];

const TRUST_STATS = [
  { value: '500+', label: 'khách sạn & khu nghỉ dưỡng', note: 'đa dạng hạng phòng' },
  { value: '50 nghìn+', label: 'khách đã đặt phòng', note: 'trải nghiệm đã xác nhận' },
  { value: '12', label: 'thành phố phổ biến', note: 'biển, núi và trung tâm' },
  { value: '4.9+', label: 'đánh giá trung bình', note: 'từ khách lưu trú' },
];

const TRUST_POINTS = [
  { title: 'Giá minh bạch', detail: 'Hiển thị giá mỗi đêm, sức chứa và tình trạng phòng rõ ràng trước khi đặt.' },
  { title: 'Phòng được chọn lọc', detail: 'Danh sách tập trung vào khách sạn, resort và căn hộ phù hợp nhu cầu phổ biến.' },
  { title: 'Hủy linh hoạt', detail: 'Lọc nhanh những chỗ ở có chính sách hủy miễn phí và còn phòng.' },
  { title: 'Quản lý dễ dàng', detail: 'Theo dõi lịch sử xem, yêu thích và các đặt chỗ đang giữ trong cùng một nơi.' },
];

const REVIEWS = [
  {
    name: 'Minh Anh',
    trip: 'Kỳ nghỉ Đà Nẵng',
    score: '9.4',
    quote: 'Tìm phòng nhanh, bộ lọc gọn và thông tin giá dễ hiểu. Tôi đặt suite biển chỉ trong vài phút.',
  },
  {
    name: 'Hoàng Nam',
    trip: 'Công tác TP. Hồ Chí Minh',
    score: '9.1',
    quote: 'Trang chi tiết phòng rõ ràng, biết ngay còn phòng hay không và phù hợp cho chuyến công tác.',
  },
  {
    name: 'Linh Chi',
    trip: 'Gia đình đi Hội An',
    score: '9.6',
    quote: 'Các gợi ý theo kiểu chuyến đi rất hữu ích, nhất là khi cần phòng family có bữa sáng.',
  },
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
  const [activeHero, setActiveHero] = useState(0);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featured-rooms'],
    queryFn: () => getFeaturedRooms(6),
  });

  const goToHero = (index) => {
    setActiveHero((index + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % HERO_SLIDES.length);
    }, 7500);

    return () => window.clearInterval(timer);
  }, []);

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
      <section className="relative bg-slate-950 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="flex h-full transition-transform duration-700 ease-out"
            style={{ width: `${HERO_SLIDES.length * 100}%`, transform: `translateX(-${activeHero * (100 / HERO_SLIDES.length)}%)` }}
          >
            {HERO_SLIDES.map((slide) => (
              <div
                key={slide.image}
                className="h-full bg-cover bg-center"
                style={{
                  width: `${100 / HERO_SLIDES.length}%`,
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
          className="absolute left-5 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/15 text-2xl font-black text-white shadow-xl backdrop-blur transition hover:bg-white/25 lg:flex"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Ảnh tiếp theo"
          onClick={() => goToHero(activeHero + 1)}
          className="absolute right-5 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/15 text-2xl font-black text-white shadow-xl backdrop-blur transition hover:bg-white/25 lg:flex"
        >
          ›
        </button>

        <div className="absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-slate-950/80 to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[660px] max-w-7xl flex-col items-center px-4 pb-36 pt-14 text-center sm:px-6 lg:min-h-[700px] lg:pt-16">
          <span className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur">
            {HERO_SLIDES[activeHero].label}
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:text-6xl lg:text-[64px]">
            {HERO_SLIDES[activeHero].title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-sky-50">{HERO_SLIDES[activeHero].description}</p>

          <div className="relative z-30 mt-10 w-full max-w-5xl">
            <SearchBar onSubmit={handleSearch} submitLabel="Tìm kiếm" />
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
            {HERO_SLIDES.map((slide, index) => (
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
            {TRUST_STATS.map((item) => (
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
          {COLLECTIONS.map((item) => (
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
          <div className="grid gap-4 lg:grid-cols-4">
            {TRUST_POINTS.map((point) => (
              <article key={point.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-lg font-black text-slate-950">{point.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{point.detail}</p>
              </article>
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
          <span className="eyebrow">Ưu đãi</span>
          <h2 className="mt-3 section-title">Ưu đãi đang áp dụng</h2>
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

      <MemberPromptBanner className="mx-4 mb-12 sm:mx-6 xl:mx-auto xl:max-w-7xl" />

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-bold text-sky-100">
            Đánh giá khách hàng
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight">Những trải nghiệm đáng tin cậy</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {REVIEWS.map((review) => (
              <article key={review.name} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-black">{review.name}</p>
                    <p className="text-sm text-sky-100">{review.trip}</p>
                  </div>
                  <div className="rounded-xl bg-brand-600 px-3 py-2 text-xl font-black">{review.score}</div>
                </div>
                <p className="mt-5 text-sm leading-7 text-sky-50">{review.quote}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
