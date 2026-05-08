import ketNoiApi from './ketNoiApi';

export async function taoDatPhong(payload) {
  const response = await ketNoiApi.post('/bookings', payload);
  return response.data.data;
}
