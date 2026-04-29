import api from './api';

export async function getRooms(queryString = '') {
  const suffix = queryString ? `?${queryString}` : '';
  const response = await api.get(`/rooms${suffix}`);
  return response.data;
}

export async function getFeaturedRooms(limit = 4) {
  const response = await api.get(`/rooms/featured?limit=${limit}`);
  return response.data.data;
}

export async function getRoomById(roomId) {
  const response = await api.get(`/rooms/${roomId}`);
  return response.data.data;
}
