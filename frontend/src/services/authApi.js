import api from './api';

export async function registerUser(payload) {
  const response = await api.post('/auth/register', payload);
  return response.data.data;
}

export async function loginUser(payload) {
  const response = await api.post('/auth/login', payload);
  return response.data.data;
}

export async function verifyEmailOtp(payload) {
  const response = await api.post('/auth/verify-email', payload);
  return response.data.data;
}

export async function resendEmailOtp(payload) {
  const response = await api.post('/auth/resend-otp', payload);
  return response.data.data;
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data.data;
}
