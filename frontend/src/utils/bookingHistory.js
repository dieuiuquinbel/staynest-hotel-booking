const BOOKINGS_KEY = 'staynest_my_bookings';

export const BOOKING_STATUS = {
  HOLDING: 'Đang giữ chỗ',
  COMPLETED: 'Đã hoàn tất',
  CANCELLED: 'Đã hủy',
};

function readArray() {
  try {
    const value = window.localStorage.getItem(BOOKINGS_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray(bookings) {
  window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 1;

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();

  if (!Number.isFinite(diff) || diff <= 0) return 1;
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function readMyBookings(userId) {
  const bookings = readArray();
  if (!userId) return bookings;
  return bookings.filter((booking) => String(booking.userId) === String(userId));
}

export function saveMyBooking({ room, user, checkIn, checkOut, guests = '2', rooms = '1', services = [], totalPriceOverride }) {
  const current = readArray();
  const nights = calculateNights(checkIn, checkOut);
  const pricePerNight = Number(room.price_per_night || 0);
  const totalPrice = Number(totalPriceOverride || 0) || pricePerNight * nights * Number(rooms || 1);
  const createdAt = new Date();

  const booking = {
    id: `DB-${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, '0')}${String(
      createdAt.getDate(),
    ).padStart(2, '0')}-${String(createdAt.getTime()).slice(-5)}`,
    userId: user?.id || user?.email || 'guest',
    guestName: user?.full_name || '',
    guestEmail: user?.email || '',
    roomId: room.id,
    hotel_name: room.hotel_name,
    room_name: room.room_name,
    city: room.city,
    address: room.address,
    image_url: room.image_url,
    price_per_night: pricePerNight,
    totalPrice,
    nights,
    guests,
    rooms,
    services,
    checkIn: checkIn || '',
    checkOut: checkOut || '',
    status: BOOKING_STATUS.HOLDING,
    createdAt: createdAt.toISOString(),
  };

  const next = [booking, ...current].slice(0, 30);
  writeArray(next);
  return booking;
}

export function cancelMyBooking(bookingId) {
  const next = readArray().map((booking) =>
    booking.id === bookingId ? { ...booking, status: BOOKING_STATUS.CANCELLED } : booking,
  );
  writeArray(next);
  return next;
}

export function completeMyBooking(bookingId) {
  const next = readArray().map((booking) =>
    booking.id === bookingId ? { ...booking, status: BOOKING_STATUS.COMPLETED } : booking,
  );
  writeArray(next);
  return next;
}
