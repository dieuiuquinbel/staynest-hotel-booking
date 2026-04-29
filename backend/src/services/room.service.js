const pool = require('../config/db');

const SORT_MAP = {
  popular: 'r.total_reviews DESC, r.rating_avg DESC, r.price_per_night ASC',
  price_asc: 'r.price_per_night ASC',
  price_desc: 'r.price_per_night DESC',
  rating_desc: 'r.rating_avg DESC, r.total_reviews DESC',
  newest: 'r.id DESC',
};

function toBoolean(value) {
  return value === 'true' || value === '1' || value === true;
}

function getAvailabilityStatus(inventoryCount) {
  const count = Number(inventoryCount) || 0;

  if (count <= 0) {
    return 'sold_out';
  }

  if (count <= 3) {
    return 'limited';
  }

  return 'available';
}

function mapRoom(row) {
  let amenities = [];

  if (typeof row.amenities_json === 'string') {
    try {
      amenities = JSON.parse(row.amenities_json);
    } catch (error) {
      amenities = [];
    }
  } else if (Array.isArray(row.amenities_json)) {
    amenities = row.amenities_json;
  }

  let gallery = [];

  if (typeof row.gallery_json === 'string') {
    try {
      gallery = JSON.parse(row.gallery_json);
    } catch (error) {
      gallery = [];
    }
  } else if (Array.isArray(row.gallery_json)) {
    gallery = row.gallery_json;
  }

  return {
    ...row,
    amenities,
    gallery,
    breakfast_included: Boolean(row.breakfast_included),
    free_cancellation: Boolean(row.free_cancellation),
    is_active: Boolean(row.is_active),
    availability_status: getAvailabilityStatus(row.inventory_count),
  };
}

function buildRoomFilters(query = {}) {
  const conditions = ['r.is_active = TRUE'];
  const params = [];

  if (query.city) {
    const keyword = `%${query.city.trim()}%`;
    conditions.push('(r.city LIKE ? OR r.hotel_name LIKE ? OR r.address LIKE ?)');
    params.push(keyword, keyword, keyword);
  }

  if (query.guests) {
    conditions.push('r.max_guests >= ?');
    params.push(Number(query.guests));
  }

  if (query.minPrice) {
    conditions.push('r.price_per_night >= ?');
    params.push(Number(query.minPrice));
  }

  if (query.maxPrice) {
    conditions.push('r.price_per_night <= ?');
    params.push(Number(query.maxPrice));
  }

  if (query.minRating) {
    conditions.push('r.rating_avg >= ?');
    params.push(Number(query.minRating));
  }

  if (query.roomType) {
    const roomTypes = String(query.roomType)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (roomTypes.length > 0) {
      conditions.push(`r.room_type IN (${roomTypes.map(() => '?').join(', ')})`);
      params.push(...roomTypes);
    }
  }

  if (query.amenities) {
    const amenities = String(query.amenities)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    amenities.forEach((amenity) => {
      conditions.push('JSON_CONTAINS(r.amenities_json, JSON_QUOTE(?))');
      params.push(amenity);
    });
  }

  if (toBoolean(query.breakfastIncluded)) {
    conditions.push('r.breakfast_included = TRUE');
  }

  if (toBoolean(query.freeCancellation)) {
    conditions.push('r.free_cancellation = TRUE');
  }

  if (toBoolean(query.availableOnly)) {
    conditions.push('r.inventory_count > 0');
  }

  return { conditions, params };
}

async function getRooms(query = {}) {
  const { conditions, params } = buildRoomFilters(query);
  const whereClause = conditions.join(' AND ');
  const sortBy = SORT_MAP[query.sort] || SORT_MAP.popular;
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 40);
  const page = Math.max(Number(query.page) || 1, 1);
  const offset = (page - 1) * limit;

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS totalItems
     FROM rooms r
     WHERE ${whereClause}`,
    params
  );

  const [rows] = await pool.query(
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
        r.is_active
     FROM rooms r
     WHERE ${whereClause}
     ORDER BY ${sortBy}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const totalItems = countRows[0].totalItems;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    data: rows.map(mapRoom),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
}

async function getFeaturedRooms(limit = 4) {
  const safeLimit = Math.min(Math.max(Number(limit) || 4, 1), 12);
  const [rows] = await pool.query(
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
        r.is_active
     FROM rooms r
     WHERE r.is_active = TRUE
     ORDER BY r.rating_avg DESC, r.total_reviews DESC
     LIMIT ?`,
    [safeLimit]
  );

  return rows.map(mapRoom);
}

async function getRoomById(roomId) {
  const [rows] = await pool.query(
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
        r.is_active
     FROM rooms r
     WHERE r.id = ? AND r.is_active = TRUE
     LIMIT 1`,
    [roomId]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapRoom(rows[0]);
}

module.exports = {
  getRooms,
  getFeaturedRooms,
  getRoomById,
};
