import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getRoomById } from '../services/roomApi';
import useAuthStore from '../store/authStore';
import { saveMyBooking } from '../utils/bookingHistory';
import { formatCurrency } from '../utils/format';

const ADD_ONS = [
  {
    title: 'Bữa sáng buffet',
    description: 'Thêm bữa sáng cho toàn bộ khách trong phòng.',
    price: '120.000 VND',
  },
  {
    title: 'Đưa đón sân bay',
    description: 'Phù hợp cho khách đến muộn hoặc gia đình có trẻ nhỏ.',
    price: '350.000 VND',
  },
  {
    title: 'Check-in sớm',
    description: 'Tối ưu cho chuyến công tác hoặc lịch trình ngắn ngày.',
    price: '180.000 VND',
  },
];

function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const user = useAuthStore((state) => state.user);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const roomQuery = useQuery({
    queryKey: ['booking-room', roomId],
    queryFn: () => getRoomById(roomId),
    enabled: Boolean(roomId),
  });

  if (!roomId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="surface-card p-8 text-center">
          <p className="eyebrow">Đặt phòng</p>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
            Bạn chưa chọn chỗ ở để đặt.
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Quay lại danh sách, mở chi tiết một phòng phù hợp rồi tiếp tục từ đó.
          </p>
          <Link to="/rooms" className="mt-6 inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700">
            Xem danh sách chỗ ở
          </Link>
        </div>
      </main>
    );
  }

  if (roomQuery.isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="surface-card h-[520px] animate-pulse bg-slate-100" />
      </main>
    );
  }

  if (roomQuery.isError || !roomQuery.data) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="surface-card p-8 text-center">
          <p className="eyebrow">Đặt phòng</p>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
            Không tải được thông tin chỗ ở.
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Dữ liệu phòng không còn hợp lệ hoặc phiên làm việc vừa thay đổi.
          </p>
          <Link to="/rooms" className="mt-6 inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700">
            Quay lại danh sách
          </Link>
        </div>
      </main>
    );
  }

  const room = roomQuery.data;

  const handleSaveBooking = () => {
    saveMyBooking({ room, user, checkIn, checkOut });
    navigate('/my-bookings');
  };

  return (
    <main className="detail-page-bg">
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="surface-card p-6 sm:p-8">
          <span className="eyebrow">Bước đặt phòng</span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Kiểm tra thông tin trước khi giữ chỗ
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            Bạn đã đăng nhập nên có thể giữ chỗ. Đơn mẫu sẽ được lưu vào tab Đặt chỗ của tôi.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Khách đặt phòng</span>
              <input type="text" value={user?.full_name || ''} readOnly className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Email liên hệ</span>
              <input type="email" value={user?.email || ''} readOnly className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Ngày nhận phòng</span>
              <input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Ngày trả phòng</span>
              <input type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none" />
            </label>
          </div>

          <div className="mt-8 rounded-lg border border-brand-100 bg-brand-50/70 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">Dịch vụ gợi ý</p>
            <div className="mt-4 grid gap-4">
              {ADD_ONS.map((service) => (
                <article key={service.title} className="rounded-lg border border-white bg-white px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-black text-slate-950">{service.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{service.description}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                      {service.price}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveBooking}
            className="mt-8 w-full rounded-md bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-brand-700"
          >
            Giữ chỗ tạm thời
          </button>
        </div>

        <aside className="subtle-card p-5 lg:sticky lg:top-24 lg:self-start">
          <img src={room.image_url} alt={`${room.hotel_name} ${room.room_name}`} className="h-56 w-full rounded-md object-cover" />
          <div className="mt-5">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">Chỗ ở đã chọn</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{room.hotel_name}</h2>
            <p className="mt-2 text-sm font-bold text-slate-600">{room.room_name}</p>
            <p className="mt-3 text-sm leading-7 text-slate-500">{room.address}</p>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-lg bg-slate-50 px-4 py-4">
              <p className="text-sm font-bold text-slate-500">Giá mỗi đêm</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{formatCurrency(room.price_per_night)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-4">
              <p className="text-sm font-bold text-slate-500">Sức chứa</p>
              <p className="mt-2 text-lg font-black text-slate-950">{room.max_guests} khách</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-800">
            Đây là giao diện giữ chỗ mẫu. Dữ liệu được lưu trên trình duyệt để kiểm tra luồng UI.
          </div>

          <Link to={`/rooms/${room.id}`} className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-600 hover:text-brand-700">
            Quay lại chi tiết
          </Link>
        </aside>
      </section>
    </main>
  );
}

export default BookingPage;
