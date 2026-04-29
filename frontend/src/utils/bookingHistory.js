const BOOKINGS_KEY = 'staynest_my_bookings';

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

export function readMyBookings(userId) {
  const bookings = readArray();
  if (!userId) return bookings;
  return bookings.filter((booking) => String(booking.userId) === String(userId));
}

export function saveMyBooking({ room, user, checkIn, checkOut }) {
  const current = readArray();
  const booking = {
    id: `SN-${Date.now()}`,
    userId: user?.id || user?.email || 'guest',
    guestName: user?.full_name || '',
    guestEmail: user?.email || '',
    roomId: room.id,
    hotel_name: room.hotel_name,
    room_name: room.room_name,
    city: room.city,
    address: room.address,
    image_url: room.image_url,
    price_per_night: room.price_per_night,
    checkIn: checkIn || '',
    checkOut: checkOut || '',
    status: 'Đang giữ chỗ',
    createdAt: new Date().toISOString(),
  };

  const next = [booking, ...current].slice(0, 30);
  window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(next));
  return booking;
}

export function cancelMyBooking(bookingId) {
  const current = readArray();
  const next = current.map((booking) =>
    booking.id === bookingId ? { ...booking, status: 'Đã hủy' } : booking,
  );
  window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(next));
  return next;
}
