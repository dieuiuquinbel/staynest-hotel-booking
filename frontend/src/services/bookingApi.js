import api from './api';

export async function createBooking(payload) {
  const response = await api.post('/bookings', payload);
  return response.data.data;
}
