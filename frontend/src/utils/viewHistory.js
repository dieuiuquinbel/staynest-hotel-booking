const VIEWED_KEY = 'staynest_viewed_rooms';
const FAVORITES_KEY = 'staynest_favorite_rooms';

function readArray(key) {
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readViewedRooms() {
  return readArray(VIEWED_KEY);
}

export function saveViewedRoom(room) {
  if (!room?.id) return readViewedRooms();

  const current = readViewedRooms();
  const normalized = {
    id: room.id,
    hotel_name: room.hotel_name,
    room_name: room.room_name,
    city: room.city,
    address: room.address,
    image_url: room.image_url,
    price_per_night: room.price_per_night,
    rating_avg: room.rating_avg,
    total_reviews: room.total_reviews,
    room_type: room.room_type,
    inventory_count: room.inventory_count,
    viewedAt: new Date().toISOString(),
  };

  const next = [normalized, ...current.filter((item) => item.id !== room.id)].slice(0, 12);
  writeArray(VIEWED_KEY, next);
  return next;
}

export function clearViewedRooms() {
  window.localStorage.removeItem(VIEWED_KEY);
}

export function readFavoriteRooms() {
  return readArray(FAVORITES_KEY);
}

export function isFavoriteRoom(roomId) {
  return readFavoriteRooms().some((room) => String(room.id) === String(roomId));
}

export function toggleFavoriteRoom(room) {
  if (!room?.id) return readFavoriteRooms();

  const current = readFavoriteRooms();
  const exists = current.some((item) => String(item.id) === String(room.id));

  if (exists) {
    const next = current.filter((item) => String(item.id) !== String(room.id));
    writeArray(FAVORITES_KEY, next);
    return next;
  }

  const normalized = {
    id: room.id,
    hotel_name: room.hotel_name,
    room_name: room.room_name,
    city: room.city,
    address: room.address,
    image_url: room.image_url,
    price_per_night: room.price_per_night,
    rating_avg: room.rating_avg,
    total_reviews: room.total_reviews,
    room_type: room.room_type,
    inventory_count: room.inventory_count,
    savedAt: new Date().toISOString(),
  };

  const next = [normalized, ...current.filter((item) => String(item.id) !== String(room.id))].slice(0, 24);
  writeArray(FAVORITES_KEY, next);
  return next;
}
