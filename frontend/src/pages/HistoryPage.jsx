import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RoomCard from '../components/rooms/RoomCard';
import { clearViewedRooms, readFavoriteRooms, readViewedRooms } from '../utils/viewHistory';

function HistoryPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const viewedRooms = useMemo(() => readViewedRooms(), [refreshKey]);
  const favoriteRooms = useMemo(() => readFavoriteRooms(), [refreshKey]);

  const refresh = () => setRefreshKey((current) => current + 1);

  return (
    <main className="history-page-bg">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Lịch sử</span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Khách sạn bạn đã xem và yêu thích
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Dữ liệu được lưu trên trình duyệt để bạn quay lại nhanh các khách sạn đã quan tâm.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              clearViewedRooms();
              refresh();
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
          >
            Xóa lịch sử xem
          </button>
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-950">Đã yêu thích</h2>
            <p className="text-sm font-bold text-slate-500">{favoriteRooms.length} khách sạn</p>
          </div>
          {favoriteRooms.length ? (
            <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3" onClick={refresh}>
              {favoriteRooms.map((room) => (
                <RoomCard key={`favorite-${room.id}`} room={room} layout="vertical" />
              ))}
            </div>
          ) : (
            <div className="surface-card mt-5 p-8 text-center">
              <p className="text-sm font-bold text-brand-700">Chưa có khách sạn yêu thích</p>
              <p className="mt-2 text-sm text-slate-500">Nhấn nút Yêu thích ở trang chi tiết hoặc thẻ khách sạn để lưu lại.</p>
              <Link to="/rooms" className="mt-5 inline-flex rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white">
                Tìm khách sạn
              </Link>
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-950">Đã xem gần đây</h2>
            <p className="text-sm font-bold text-slate-500">{viewedRooms.length} khách sạn</p>
          </div>
          {viewedRooms.length ? (
            <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3" onClick={refresh}>
              {viewedRooms.map((room) => (
                <RoomCard key={`viewed-${room.id}`} room={room} layout="vertical" />
              ))}
            </div>
          ) : (
            <div className="surface-card mt-5 p-8 text-center">
              <p className="text-sm font-bold text-brand-700">Chưa có lịch sử xem</p>
              <p className="mt-2 text-sm text-slate-500">Mở một khách sạn bất kỳ để hệ thống lưu vào tab này.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default HistoryPage;
