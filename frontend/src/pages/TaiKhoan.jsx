import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useKhoXacThuc from '../store/khoXacThuc';
import { TRANG_THAI_DAT_PHONG, docDatPhongCuaToi } from '../utils/lichSuDatPhong';
import { docPhongYeuThich, docPhongDaXem } from '../utils/lichSuXemPhong';
import { QUA_THANH_VIEN, docQuaDaDoi, docDiemThuong, docNhiemVuNhanThuong, doiQuaThuong } from '../utils/diemThuong';
import { layKhoVoucherApi } from '../services/voucherApi';
import { layDatPhongCuaToiApi } from '../services/datPhongApi';

const GOI_Y_DANH_GIA = [
  'Chưa có đánh giá nào. Sau khi hoàn tất đặt phòng, bạn có thể quay lại để viết cảm nhận.',
  'Đánh giá giúp những khách khác chọn phòng phù hợp hơn.',
];

const MUC_THANH_BEN = [
  { id: 'profile', label: 'Tổng quan' },
  { id: 'history', label: 'Lịch sử' },
  { id: 'reviews', label: 'Đánh giá' },
  { id: 'rewards', label: 'Đổi thưởng' },
  { id: 'wallet', label: 'Kho voucher' },
  { id: 'tasks', label: 'Nhiệm vụ' },
];

function TaiKhoan() {
  const navigate = useNavigate();
  const user = useKhoXacThuc((state) => state.user);
  const setUser = useKhoXacThuc((state) => state.setUser);
  const clearSession = useKhoXacThuc((state) => state.clearSession);
  const [activeSection, setActiveSection] = useState('profile');
  const [displayName, setDisplayName] = useState(user?.full_name || '');
  const [message, setMessage] = useState('');
  const [points, setPoints] = useState(() => docDiemThuong());
  const [redeemed, setRedeemed] = useState(() => docQuaDaDoi());
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    layKhoVoucherApi()
      .then((vouchers) => {
        if (Array.isArray(vouchers)) setRedeemed(vouchers);
      })
      .catch(() => setRedeemed(docQuaDaDoi()));
  }, [user?.id, user?.email]);

  useEffect(() => {
    let isMounted = true;

    // Trang tai khoan cung doc tu MySQL de so don/voucher khop voi "Dat cho cua toi".
    layDatPhongCuaToiApi()
      .then((data) => {
        if (isMounted) setBookings(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (isMounted) setBookings(docDatPhongCuaToi(user?.id || user?.email));
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email]);

  const viewedRooms = useMemo(() => docPhongDaXem(), []);
  const favoriteRooms = useMemo(() => docPhongYeuThich(), []);
  const completedBookings = bookings.filter((booking) =>
    [TRANG_THAI_DAT_PHONG.CONFIRMED, TRANG_THAI_DAT_PHONG.CHECKED_IN, TRANG_THAI_DAT_PHONG.CHECKED_OUT].includes(booking.bookingStatus),
  );
  const rewardTasks = docNhiemVuNhanThuong({
    user,
    bookings,
    favoriteRooms,
    reviews: bookings.filter((booking) => booking.reviewId),
  });
  const membership = points >= 500 ? 'Vàng' : points >= 200 ? 'Bạc' : 'Cơ bản';

  const handleSaveProfile = () => {
    const nextName = displayName.trim();
    if (!nextName) {
      setMessage('Tên hiển thị không được để trống.');
      return;
    }

    setUser({ ...user, full_name: nextName });
    setMessage('Đã cập nhật tên hiển thị.');
  };

  const handleRedeem = (reward) => {
    const result = doiQuaThuong(reward);
    setPoints(result.points);
    setRedeemed(result.redeemed);
    setMessage(result.ok ? `Đã đổi ${reward.title}.` : 'Bạn chưa đủ điểm để đổi phần thưởng này.');
  };

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  const renderProfile = () => (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950">Thông tin cá nhân</h2>
            <p className="mt-1 text-sm text-slate-500">Chỉ đổi tên hiển thị, tên đăng nhập được giữ nguyên.</p>
          </div>
          <button
            type="button"
            onClick={handleSaveProfile}
            className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Lưu thay đổi
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Tên hiển thị</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Tên đăng nhập</span>
            <input value={user?.username || ''} readOnly className="field-shell px-4 py-4 text-sm font-semibold text-slate-500 outline-none" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Email</span>
            <input value={user?.email || ''} readOnly className="field-shell px-4 py-4 text-sm font-semibold text-slate-500 outline-none" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Trạng thái email</span>
            <input
              value={user?.email_verified ? 'Đã xác minh' : 'Chưa xác minh'}
              readOnly
              className="field-shell px-4 py-4 text-sm font-semibold text-slate-500 outline-none"
            />
          </label>
        </div>
        {message ? <p className="mt-4 text-sm font-bold text-brand-700">{message}</p> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link to="/my-bookings" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-500">
          <p className="text-sm font-bold text-brand-700">Đặt chỗ</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{bookings.length}</p>
          <p className="mt-2 text-sm text-slate-500">Theo dõi các phòng đã đặt.</p>
        </Link>
        <button
          type="button"
          onClick={() => setActiveSection('history')}
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-brand-500"
        >
          <p className="text-sm font-bold text-brand-700">Lịch sử</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{viewedRooms.length}</p>
          <p className="mt-2 text-sm text-slate-500">Phòng đã xem gần đây.</p>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('reviews')}
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-brand-500"
        >
          <p className="text-sm font-bold text-brand-700">Đánh giá</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{completedBookings.length}</p>
          <p className="mt-2 text-sm text-slate-500">Đơn có thể viết đánh giá.</p>
        </button>
      </section>

      <div className="flex justify-end border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-11 w-auto min-w-[132px] flex-none items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-black text-white shadow-sm shadow-brand-500/20 ring-4 ring-sky-100 transition hover:bg-brand-700 hover:ring-sky-200"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );

  const renderHistory = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-black text-slate-950">Lịch sử xem phòng</h2>
      <p className="mt-1 text-sm text-slate-500">Tách riêng phòng đã xem và phòng đã lưu để khách quay lại nhanh hơn.</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-black text-slate-950">Phòng đã xem</h3>
          <div className="mt-4 grid gap-3">
            {viewedRooms.slice(0, 5).map((room) => (
              <Link key={room.id} to={`/rooms/${room.id}`} className="rounded-xl bg-white p-3 text-sm transition hover:text-brand-700">
                <p className="font-black">{room.name}</p>
                <p className="mt-1 text-slate-500">{room.city || room.location}</p>
              </Link>
            ))}
            {!viewedRooms.length ? <p className="text-sm text-slate-500">Chưa có phòng đã xem.</p> : null}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-black text-slate-950">Phòng đã lưu</h3>
          <div className="mt-4 grid gap-3">
            {favoriteRooms.slice(0, 5).map((room) => (
              <Link key={room.id} to={`/rooms/${room.id}`} className="rounded-xl bg-white p-3 text-sm transition hover:text-brand-700">
                <p className="font-black">{room.name}</p>
                <p className="mt-1 text-slate-500">{room.city || room.location}</p>
              </Link>
            ))}
            {!favoriteRooms.length ? <p className="text-sm text-slate-500">Chưa lưu phòng nào.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );

  const renderReviews = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-black text-slate-950">Đánh giá của tôi</h2>
      <p className="mt-1 text-sm text-slate-500">{completedBookings.length} đơn đủ điều kiện viết đánh giá.</p>
      <div className="mt-5 grid gap-3">
        {GOI_Y_DANH_GIA.map((item) => (
          <p key={item} className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {item}
          </p>
        ))}
      </div>
    </section>
  );

  const renderRewards = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-black text-slate-950">Đổi thưởng</h2>
      <p className="mt-1 text-sm text-slate-500">Danh sách voucher demo. Điểm hiện có: {points}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {QUA_THANH_VIEN.map((reward) => (
          <article key={reward.id} className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-950">{reward.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{reward.description}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-sm font-black text-brand-700">{reward.cost} điểm</span>
            </div>
            <button
              type="button"
              onClick={() => handleRedeem(reward)}
              disabled={points < reward.cost}
              className="mt-4 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Đổi ngay
            </button>
          </article>
        ))}
      </div>
      {message ? <p className="mt-4 text-sm font-bold text-brand-700">{message}</p> : null}
    </section>
  );

  const renderWallet = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-black text-slate-950">Kho voucher</h2>
      <p className="mt-1 text-sm text-slate-500">Các voucher đã đổi sẽ nằm riêng tại đây để dễ kiểm tra trước khi đặt phòng.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {redeemed.length ? (
          redeemed.map((reward) => (
            <div key={reward.code} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-black text-slate-950">{reward.title}</p>
              <p className="mt-2 font-bold text-brand-700">{reward.code}</p>
              <p className="mt-2 text-slate-500">Đã lưu vào tài khoản của bạn.</p>
            </div>
          ))
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có voucher nào trong kho.</p>
        )}
      </div>
    </section>
  );

  const renderTasks = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-black text-slate-950">Nhiệm vụ nhận điểm</h2>
      <p className="mt-1 text-sm text-slate-500">Nhiệm vụ đơn giản, chỉ gắn với hành động thật trong website.</p>
      <div className="mt-5 grid gap-3">
        {rewardTasks.map((task) => (
          <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="font-black text-slate-950">{task.title}</p>
              <p className="mt-1 text-sm font-bold text-brand-700">+{task.points} điểm</p>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-black ${task.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
              {task.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );

  const sectionMap = {
    profile: renderProfile,
    history: renderHistory,
    reviews: renderReviews,
    rewards: renderRewards,
    wallet: renderWallet,
    tasks: renderTasks,
  };

  return (
    <main className="history-page-bg flex-1">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="surface-card overflow-hidden">
          <div className="bg-gradient-to-r from-sky-50 via-white to-amber-50 p-6 sm:p-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Xin chào, {user?.full_name}</h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Quản lý thông tin cá nhân, lịch sử, điểm thưởng và voucher đã đổi.
            </p>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="self-start rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-28">
              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-sm font-bold text-slate-500">Hạng thành viên</p>
                <p className="mt-2 text-3xl font-black text-brand-700">{membership}</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">{points} điểm thưởng</p>
              </div>

              <div className="mt-4 grid gap-2">
                {MUC_THANH_BEN.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`rounded-xl px-4 py-3 text-left text-sm font-black transition ${
                      activeSection === item.id
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                        : 'text-slate-600 hover:bg-sky-50 hover:text-brand-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-bold text-slate-500">Tổng quan nhanh</p>
                <div className="mt-4 grid gap-3 text-sm font-bold text-slate-700">
                  <p>{bookings.length} đặt chỗ</p>
                  <p>{viewedRooms.length} phòng đã xem</p>
                  <p>{favoriteRooms.length} phòng đã lưu</p>
                  <p>{redeemed.length} voucher đã đổi</p>
                </div>
              </div>
            </aside>

            <div className="grid gap-6">
              {sectionMap[activeSection]()}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default TaiKhoan;
