import ketNoiApi from './ketNoiApi';

export async function taoDatPhong(payload) {
  const response = await ketNoiApi.post('/bookings', payload);
  return response.data.data;
}

export async function layDatPhongCuaToiApi() {
  const response = await ketNoiApi.get('/bookings/my');
  return response.data.data;
}

export async function layTatCaDatPhongAdminApi() {
  const response = await ketNoiApi.get('/admin/bookings');
  return response.data.data;
}

export async function capNhatTrangThaiDatPhongApi(bookingId, status, note) {
  const response = await ketNoiApi.patch(`/bookings/${bookingId}/status`, { status, note });
  return response.data.data;
}

export async function capNhatTrangThaiDatPhongAdminApi(bookingId, status, note) {
  const response = await ketNoiApi.patch(`/admin/bookings/${bookingId}/status`, { status, note });
  return response.data.data;
}

export async function xacNhanThanhToanDatPhongApi(bookingId, method, paymentCode, voucherCode) {
  const response = await ketNoiApi.post(`/bookings/${bookingId}/payments/confirm`, { method, paymentCode, voucherCode });
  return response.data.data;
}

export async function xacNhanThanhToanAdminApi(bookingId, method, paymentCode, voucherCode) {
  const response = await ketNoiApi.post(`/admin/bookings/${bookingId}/payments/confirm`, { method, paymentCode, voucherCode });
  return response.data.data;
}

export async function luuGhiChuAdminApi(bookingId, note) {
  const response = await ketNoiApi.patch(`/admin/bookings/${bookingId}/note`, { note });
  return response.data.data;
}

export async function guiPhanHoiDatPhongApi(bookingId, payload) {
  const response = await ketNoiApi.post(`/bookings/${bookingId}/feedbacks`, payload);
  return response.data.data;
}
