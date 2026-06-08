// Chức năng: Danh sách, bộ lọc và bảng quản lý phòng.
// Khối danh sách phòng: thống kê, bộ lọc và 2 chế độ hiển thị.
import { dinhDangTien } from '../../../utils/dinhDang';
import { layThongTinTinhTrangPhong } from '../../../utils/tinhTrangPhong';
import { Link } from 'react-router-dom';
import { ROOM_TYPES } from './roomConstants';
import { getInventory, nhanLoaiPhong, taoThongKePhong } from './roomHelpers';

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M2.6 10s2.5-4.5 7.4-4.5S17.4 10 17.4 10s-2.5 4.5-7.4 4.5S2.6 10 2.6 10Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function roomDetailPath(roomId) {
  return `/admin/rooms/${roomId}`;
}

function RoomStats({ rooms }) {
  const stats = taoThongKePhong(rooms);

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <article key={item.label} className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
          <p className={`mt-2 text-2xl font-black ${item.tone || 'text-slate-950'}`}>{item.value}</p>
        </article>
      ))}
    </section>
  );
}

function RoomFilters({ query, setQuery, type, setType, status, setStatus, view, setView }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_180px_180px]">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên phòng, khách sạn, thành phố..." className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500" />
        <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500">
          <option value="all">Tất cả loại</option>
          {Object.entries(ROOM_TYPES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500">
          <option value="all">Tất cả trạng thái</option>
          <option value="available">Còn phòng</option>
          <option value="low">Sắp hết</option>
          <option value="sold_out">Hết phòng</option>
        </select>
        <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button type="button" onClick={() => setView('table')} className={`rounded-md px-3 py-2 text-sm font-black ${view === 'table' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Bảng</button>
          <button type="button" onClick={() => setView('grid')} className={`rounded-md px-3 py-2 text-sm font-black ${view === 'grid' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Lưới</button>
        </div>
      </div>
    </section>
  );
}

function RoomTable({ rooms }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1060px] w-full text-left">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-3">Phòng</th>
              <th className="px-5 py-3">Khách sạn</th>
              <th className="px-5 py-3">Loại</th>
              <th className="px-5 py-3">Giá</th>
              <th className="px-5 py-3">Kho</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="w-20 px-4 py-3 text-center">Xem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.map((room) => {
              const statusInfo = layThongTinTinhTrangPhong(getInventory(room));
              return (
                <tr key={room.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="text-sm font-black text-slate-950">{room.room_name}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">ID #{room.id}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-900">{room.hotel_name}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{room.city || room.address}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-slate-700">{nhanLoaiPhong(room.room_type)}</td>
                  <td className="px-5 py-4 text-sm font-black text-brand-700">{dinhDangTien(room.price_per_night)}</td>
                  <td className="px-5 py-4 text-sm font-black text-slate-950">{getInventory(room)} phòng</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${statusInfo.lopHuyHieu}`}>{statusInfo.label}</span>
                  </td>
                  <td className="w-20 px-4 py-4">
                    <div className="flex justify-center">
                      <Link
                        to={roomDetailPath(room.id)}
                        aria-label={`Xem chi tiết và ảnh phòng ${room.room_name}`}
                        title="Xem chi tiết và ảnh phòng"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-100"
                      >
                        <EyeIcon />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!rooms.length ? <tr><td colSpan={7} className="px-5 py-8 text-center text-sm font-bold text-slate-500">Không có phòng phù hợp.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RoomGrid({ rooms }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {rooms.map((room) => {
        const statusInfo = layThongTinTinhTrangPhong(getInventory(room));
        return (
          <article key={room.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-950">{room.room_name}</h2>
                <p className="mt-1 text-sm font-bold text-slate-500">{room.hotel_name}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${statusInfo.lopHuyHieu}`}>{statusInfo.label}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-[11px] font-black uppercase text-slate-500">Kho</p><p className="mt-1 font-black text-slate-950">{getInventory(room)}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-[11px] font-black uppercase text-slate-500">Loại</p><p className="mt-1 font-black text-slate-950">{nhanLoaiPhong(room.room_type)}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-[11px] font-black uppercase text-slate-500">Giá</p><p className="mt-1 font-black text-brand-700">{dinhDangTien(room.price_per_night)}</p></div>
            </div>
            <Link
              to={roomDetailPath(room.id)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-100"
            >
              <EyeIcon />
              Xem chi tiết và ảnh
            </Link>
          </article>
        );
      })}
    </section>
  );
}

export default function RoomListPane({
  rooms,
  filteredRooms,
  query,
  setQuery,
  type,
  setType,
  status,
  setStatus,
  view,
  setView,
  isLoading,
  isError,
}) {
  return (
    <>
      <RoomStats rooms={rooms} />
      <RoomFilters
        query={query}
        setQuery={setQuery}
        type={type}
        setType={setType}
        status={status}
        setStatus={setStatus}
        view={view}
        setView={setView}
      />

      {isLoading ? <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">Đang tải danh sách phòng...</div> : null}
      {isError ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-700">Không tải được danh sách phòng.</div> : null}
      {!isLoading && !isError && view === 'table' ? <RoomTable rooms={filteredRooms} /> : null}
      {!isLoading && !isError && view === 'grid' ? <RoomGrid rooms={filteredRooms} /> : null}
    </>
  );
}
