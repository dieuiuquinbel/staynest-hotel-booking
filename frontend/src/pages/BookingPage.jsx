import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createBooking } from '../services/bookingApi';
import { getRoomById } from '../services/roomApi';
import useAuthStore from '../store/authStore';
import { calculateNights, saveMyBooking } from '../utils/bookingHistory';
import { formatCurrency } from '../utils/format';
import { addRewardPoints } from '../utils/rewards';

const ADD_ONS = [
  {
    id: 'breakfast',
    title: 'Bữa sáng buffet',
    description: 'Thêm bữa sáng cho toàn bộ khách trong phòng.',
    priceValue: 120000,
  },
  {
    id: 'airport-transfer',
    title: 'Đưa đón sân bay',
    description: 'Phù hợp cho khách đến muộn hoặc gia đình có trẻ nhỏ.',
    priceValue: 350000,
  },
  {
    id: 'early-checkin',
    title: 'Check-in sớm',
    description: 'Tối ưu cho chuyến công tác hoặc lịch trình ngắn ngày.',
    priceValue: 180000,
  },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function NumberField({ label, value, onChange, min, max }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none"
      />
    </label>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none"
      />
    </label>
  );
}

function EmptyState({ title, actionLabel }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="surface-card p-8 text-center">
        <p className="eyebrow">Đặt phòng</p>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">{title}</h1>
        <Link to="/rooms" className="mt-6 inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700">
          {actionLabel}
        </Link>
      </div>
    </main>
  );
}

function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const user = useAuthStore((state) => state.user);
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || todayISO());
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || addDaysISO(1));
  const [guests, setGuests] = useState(searchParams.get('guests') || '2');
  const [rooms, setRooms] = useState(searchParams.get('rooms') || '1');
  const [selectedServices, setSelectedServices] = useState([]);
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roomQuery = useQuery({
    queryKey: ['booking-room', roomId],
    queryFn: () => getRoomById(roomId),
    enabled: Boolean(roomId),
  });

  if (!roomId) {
    return <EmptyState title="Bạn chưa chọn chỗ ở để đặt." actionLabel="Xem danh sách chỗ ở" />;
  }

  if (roomQuery.isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="surface-card h-[520px] animate-pulse bg-slate-100" />
      </main>
    );
  }

  if (roomQuery.isError || !roomQuery.data) {
    return <EmptyState title="Không tải được thông tin chỗ ở." actionLabel="Quay lại danh sách" />;
  }

  const room = roomQuery.data;
  const nights = calculateNights(checkIn, checkOut);
  const roomTotalPrice = Number(room.price_per_night || 0) * nights * Number(rooms || 1);
  const serviceTotalPrice = selectedServices.reduce((sum, service) => sum + service.priceValue, 0);
  const totalPrice = roomTotalPrice + serviceTotalPrice;
  const canSubmit = Boolean(user?.email_verified) && !isSubmitting;

  const toggleService = (service) => {
    setSelectedServices((current) =>
      current.some((item) => item.id === service.id)
        ? current.filter((item) => item.id !== service.id)
        : [...current, service],
    );
  };

  const handleSaveBooking = async () => {
    setBookingError('');
    setIsSubmitting(true);

    try {
      await createBooking({
        roomId: room.id,
        checkIn,
        checkOut,
        guests,
        rooms,
        paymentMethod: 'pay_at_hotel',
        services: selectedServices.map((service) => ({
          title: service.title,
          price: service.priceValue,
          quantity: 1,
        })),
      });

      saveMyBooking({
        room,
        user,
        checkIn,
        checkOut,
        guests,
        rooms,
        services: selectedServices,
        totalPriceOverride: totalPrice,
      });
      addRewardPoints(100);

      navigate('/my-bookings');
    } catch (error) {
      setBookingError(error?.response?.data?.message || 'Không thể đặt phòng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="detail-page-bg flex-1">
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="surface-card p-6 sm:p-8">
          <span className="eyebrow">Bước đặt phòng</span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Kiểm tra thông tin trước khi đặt phòng
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            Sau khi đặt thành công, hệ thống sẽ gửi email xác nhận và lưu hóa đơn vào thư mục admin.
          </p>

          {!user?.email_verified ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              Tài khoản cần xác minh email trước khi đặt phòng.
            </div>
          ) : null}

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Khách đặt phòng</span>
              <input type="text" value={user?.full_name || ''} readOnly className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Email liên hệ</span>
              <input type="email" value={user?.email || ''} readOnly className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none" />
            </label>
            <DateField label="Ngày nhận phòng" value={checkIn} onChange={setCheckIn} />
            <DateField label="Ngày trả phòng" value={checkOut} onChange={setCheckOut} />
            <NumberField label="Số khách" min="1" max="12" value={guests} onChange={setGuests} />
            <NumberField label="Số phòng" min="1" max="5" value={rooms} onChange={setRooms} />
          </div>

          <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Số đêm</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{nights}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Giá mỗi đêm</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{formatCurrency(room.price_per_night)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Tạm tính phòng</p>
              <p className="mt-2 text-2xl font-black text-brand-700">{formatCurrency(roomTotalPrice)}</p>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-brand-100 bg-brand-50/70 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">Dịch vụ gợi ý</p>
            <div className="mt-4 grid gap-4">
              {ADD_ONS.map((service) => {
                const checked = selectedServices.some((item) => item.id === service.id);

                return (
                  <article key={service.id} className={`rounded-lg border px-4 py-4 ${checked ? 'border-brand-300 bg-sky-50' : 'border-white bg-white'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <label className="flex min-w-0 flex-1 cursor-pointer gap-3">
                        <input type="checkbox" checked={checked} onChange={() => toggleService(service)} className="mt-1 h-4 w-4 accent-brand-600" />
                        <div>
                          <h2 className="text-base font-black text-slate-950">{service.title}</h2>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{service.description}</p>
                        </div>
                      </label>
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                        {formatCurrency(service.priceValue)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {bookingError ? (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {bookingError}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSaveBooking}
            disabled={!canSubmit}
            className="mt-8 w-full rounded-md bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? 'Đang đặt phòng...' : 'Đặt phòng và gửi email xác nhận'}
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

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-bold text-slate-600">Tiền phòng</span>
              <span className="font-black text-slate-950">{formatCurrency(roomTotalPrice)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 text-sm">
              <span className="font-bold text-slate-600">Dịch vụ đã chọn</span>
              <span className="font-black text-slate-950">{formatCurrency(serviceTotalPrice)}</span>
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="font-black text-slate-950">Tổng thanh toán</span>
                <span className="text-2xl font-black text-brand-700">{formatCurrency(totalPrice)}</span>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500">Thanh toán khi nhận phòng. Email xác nhận sẽ được gửi sau khi đặt.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-lg bg-slate-50 px-4 py-4">
              <p className="text-sm font-bold text-slate-500">Sức chứa</p>
              <p className="mt-2 text-lg font-black text-slate-950">{room.max_guests} khách</p>
            </div>
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
