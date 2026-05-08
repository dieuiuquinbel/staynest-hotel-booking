import ketNoiApi from './ketNoiApi';

export async function guiXacNhanThanhToanDemo(payload) {
  const response = await ketNoiApi.post('/payments/demo-confirm', payload);
  return response.data.data;
}
