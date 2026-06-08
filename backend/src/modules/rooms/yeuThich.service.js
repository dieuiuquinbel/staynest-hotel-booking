// Chức năng: Xử lý logic liên quan đến danh sách phòng yêu thích của người dùng.
const ketNoiDb = require('../../config/coSoDuLieu');

function docMangJson(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function layTrangThaiConPhong(inventoryCount) {
  const count = Number(inventoryCount) || 0;
  if (count <= 0) return 'sold_out';
  if (count <= 3) return 'limited';
  return 'available';
}

function chuanHoaPhong(row) {
  return {
    ...row,
    amenities: docMangJson(row.amenities_json),
    gallery: docMangJson(row.gallery_json),
    breakfast_included: Boolean(row.breakfast_included),
    free_cancellation: Boolean(row.free_cancellation),
    is_active: Boolean(row.is_active),
    availability_status: layTrangThaiConPhong(row.inventory_count),
  };
}

async function layDanhSachYeuThich(userId) {
  const [rows] = await ketNoiDb.query(
    `SELECT
        r.id,
        r.hotel_name,
        r.room_name,
        r.slug,
        r.city,
        r.address,
        r.room_type,
        r.description,
        r.amenities_json,
        r.image_url,
        r.gallery_json,
        r.price_per_night,
        r.rating_avg,
        r.total_reviews,
        r.max_guests,
        r.inventory_count,
        r.breakfast_included,
        r.free_cancellation,
        r.is_active,
        fr.created_at AS favorited_at
     FROM favorite_rooms fr
     JOIN rooms r ON fr.room_id = r.id
     WHERE fr.user_id = ? AND r.is_active = TRUE
     ORDER BY fr.created_at DESC`,
    [userId]
  );

  return rows.map(chuanHoaPhong);
}

async function toggleYeuThich(userId, roomId) {
  const [existing] = await ketNoiDb.query(
    'SELECT id FROM favorite_rooms WHERE user_id = ? AND room_id = ?',
    [userId, roomId]
  );

  if (existing.length > 0) {
    await ketNoiDb.query(
      'DELETE FROM favorite_rooms WHERE user_id = ? AND room_id = ?',
      [userId, roomId]
    );
    return { isFavorite: false };
  }

  await ketNoiDb.query(
    'INSERT INTO favorite_rooms (user_id, room_id) VALUES (?, ?)',
    [userId, roomId]
  );
  return { isFavorite: true };
}

module.exports = {
  layDanhSachYeuThich,
  toggleYeuThich,
};
