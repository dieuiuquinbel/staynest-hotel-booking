import ketNoiApi from './ketNoiApi';

const KHOA_TAI_KHOAN_DEMO = 'dieubel_demo_auth_users';
const KHOA_XAC_MINH_DEMO = 'dieubel_demo_auth_pending';
const EMAIL_ADMIN_DEMO = 'quinquin04052005@gmail.com';
const OTP_DEMO = '123456';

function laLoiBackendKhongSanSang(error) {
  return !error?.response || error.response.status >= 500;
}

function docMangLocal(key) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ghiMangLocal(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function chuanHoaEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function taoNguoiDungDemo(payload) {
  const email = chuanHoaEmail(payload.email);
  return {
    id: `local-${email}`,
    full_name: String(payload.fullName || payload.full_name || '').trim(),
    username: String(payload.username || email.split('@')[0] || '').trim().toLowerCase(),
    email,
    phone: String(payload.phone || '').trim(),
    email_verified: true,
    role: email === EMAIL_ADMIN_DEMO ? 'admin' : 'customer',
    status: 'active',
    created_at: new Date().toISOString(),
  };
}

function taoSessionDemo(user) {
  return {
    token: `local-demo-token-${user.id}`,
    user,
  };
}

function dangKyTaiKhoanDemo(payload) {
  const email = chuanHoaEmail(payload.email);
  const username = String(payload.username || '').trim().toLowerCase();
  const users = docMangLocal(KHOA_TAI_KHOAN_DEMO);
  const existed = users.find((user) => user.email === email || user.username === username);

  if (existed) {
    return {
      otpRequired: true,
      email: existed.email,
      user: existed,
      devOtp: OTP_DEMO,
      localDemo: true,
    };
  }

  const user = taoNguoiDungDemo(payload);
  const nextUsers = [{ ...user, password: payload.password }, ...users].slice(0, 50);
  ghiMangLocal(KHOA_TAI_KHOAN_DEMO, nextUsers);
  ghiMangLocal(KHOA_XAC_MINH_DEMO, [{ email: user.email, otp: OTP_DEMO, createdAt: new Date().toISOString() }]);

  return {
    otpRequired: true,
    email: user.email,
    user,
    devOtp: OTP_DEMO,
    localDemo: true,
  };
}

function dangNhapTaiKhoanDemo(payload) {
  const identifier = String(payload.identifier || payload.email || '').trim().toLowerCase();
  const users = docMangLocal(KHOA_TAI_KHOAN_DEMO);
  let user = users.find((item) => item.email === identifier || item.username === identifier);

  if (!user && identifier === EMAIL_ADMIN_DEMO) {
    user = taoNguoiDungDemo({
      fullName: 'Quản trị DieuBel',
      username: 'admin',
      email: EMAIL_ADMIN_DEMO,
      phone: '',
    });
    ghiMangLocal(KHOA_TAI_KHOAN_DEMO, [{ ...user, password: payload.password }, ...users].slice(0, 50));
  }

  if (!user || user.password !== payload.password) {
    const error = new Error('Email/tên tài khoản hoặc mật khẩu không đúng.');
    error.response = { status: 401, data: { message: error.message } };
    throw error;
  }

  const { password, ...safeUser } = user;
  return taoSessionDemo(safeUser);
}

function xacMinhOtpDemo(payload) {
  const email = chuanHoaEmail(payload.email);
  if (String(payload.otp || '').trim() !== OTP_DEMO) {
    const error = new Error('Mã OTP demo là 123456.');
    error.response = { status: 400, data: { message: error.message } };
    throw error;
  }

  const users = docMangLocal(KHOA_TAI_KHOAN_DEMO);
  const user = users.find((item) => item.email === email);
  if (!user) {
    const error = new Error('Không tìm thấy tài khoản demo.');
    error.response = { status: 404, data: { message: error.message } };
    throw error;
  }

  const { password, ...safeUser } = user;
  return taoSessionDemo({ ...safeUser, email_verified: true });
}

function docNguoiDungTuTokenLocal() {
  const rawSession = window.localStorage.getItem('staynest-auth');
  if (!rawSession) return null;

  try {
    const parsed = JSON.parse(rawSession);
    const user = parsed?.state?.user;
    const token = parsed?.state?.token;
    return String(token || '').startsWith('local-demo-token-') ? user : null;
  } catch {
    return null;
  }
}

export async function dangKyTaiKhoan(payload) {
  try {
    const response = await ketNoiApi.post('/auth/register', payload);
    return response.data.data;
  } catch (error) {
    if (laLoiBackendKhongSanSang(error)) {
      return dangKyTaiKhoanDemo(payload);
    }
    throw error;
  }
}

export async function dangNhapTaiKhoan(payload) {
  try {
    const response = await ketNoiApi.post('/auth/login', payload);
    return response.data.data;
  } catch (error) {
    if (laLoiBackendKhongSanSang(error)) {
      return dangNhapTaiKhoanDemo(payload);
    }
    throw error;
  }
}

export async function xacMinhOtpEmail(payload) {
  try {
    const response = await ketNoiApi.post('/auth/verify-email', payload);
    return response.data.data;
  } catch (error) {
    if (laLoiBackendKhongSanSang(error)) {
      return xacMinhOtpDemo(payload);
    }
    throw error;
  }
}

export async function guiLaiOtpEmail(payload) {
  try {
    const response = await ketNoiApi.post('/auth/resend-otp', payload);
    return response.data.data;
  } catch (error) {
    if (laLoiBackendKhongSanSang(error)) {
      return {
        email: chuanHoaEmail(payload.email),
        devOtp: OTP_DEMO,
        localDemo: true,
      };
    }
    throw error;
  }
}

export async function layNguoiDungHienTai() {
  const localUser = docNguoiDungTuTokenLocal();
  if (localUser) return localUser;

  const response = await ketNoiApi.get('/auth/me');
  return response.data.data;
}
