import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { loginUser, registerUser } from '../services/authApi';
import useAuthStore from '../store/authStore';

const AUTH_IMAGE =
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=85';

function readErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage;
}

function AuthPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');

  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const redirectPath = searchParams.get('redirect') || '/';
  const loginMutation = useMutation({ mutationFn: loginUser });
  const registerMutation = useMutation({ mutationFn: registerUser });

  if (token && user) return <Navigate to={redirectPath} replace />;

  const switchMode = (nextMode) => {
    const next = new URLSearchParams(searchParams);
    next.set('mode', nextMode);
    setSearchParams(next, { replace: true });
    setLoginError('');
    setRegisterError('');
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoginError('');
    try {
      const session = await loginMutation.mutateAsync(loginForm);
      setSession(session);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setLoginError(readErrorMessage(error, 'Không thể đăng nhập. Vui lòng kiểm tra email và mật khẩu.'));
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setRegisterError('');
    if (registerForm.password.length < 6) {
      setRegisterError('Mật khẩu cần ít nhất 6 ký tự.');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError('Mật khẩu xác nhận chưa khớp.');
      return;
    }
    try {
      const session = await registerMutation.mutateAsync({
        fullName: registerForm.fullName,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
      });
      setSession(session);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setRegisterError(readErrorMessage(error, 'Không thể tạo tài khoản. Vui lòng thử lại.'));
    }
  };

  return (
    <main className="auth-page-bg">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="surface-card grid min-h-[620px] overflow-hidden lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="relative min-h-[520px] bg-slate-950 text-white">
            <img src={AUTH_IMAGE} alt="Không gian nghỉ dưỡng" className="absolute inset-0 h-full w-full object-cover opacity-85" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/10" />
            <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
              <Link to="/" className="inline-flex w-fit rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur transition hover:bg-white/25">
                Về trang chủ
              </Link>
              <div>
                <p className="text-sm font-bold text-sky-100">StayNest account</p>
                <h1 className="mt-4 max-w-md text-4xl font-black leading-tight tracking-tight">
                  {mode === 'login' ? 'Đăng nhập để tiếp tục đặt phòng.' : 'Tạo tài khoản để đặt phòng nhanh hơn.'}
                </h1>
                <p className="mt-4 max-w-md text-sm leading-7 text-sky-50">
                  Lưu thông tin liên hệ, xem lại khách sạn đã mở và quay lại đúng bước đặt phòng sau khi đăng nhập.
                </p>
              </div>
            </div>
          </aside>

          <section className="overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="eyebrow">Tài khoản</span>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
                  {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  {mode === 'login'
                    ? 'Nhập email và mật khẩu để tiếp tục đặt phòng.'
                    : 'Tạo tài khoản mới để lưu thông tin liên hệ và lịch sử xem.'}
                </p>
              </div>

              <div className="grid grid-cols-2 rounded-full border border-sky-100 bg-sky-50 p-1 text-sm font-bold">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`rounded-full px-4 py-2 transition ${mode === 'login' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-brand-700'}`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`rounded-full px-4 py-2 transition ${mode === 'register' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-brand-700'}`}
                >
                  Đăng ký
                </button>
              </div>
            </div>

            <div className="auth-form-stage">
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="auth-form-panel mt-8 grid gap-5">
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-700">Email</span>
                    <input
                      type="email"
                      name="email"
                      value={loginForm.email}
                      onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                      required
                      placeholder="ban@example.com"
                      className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-700">Mật khẩu</span>
                    <input
                      type="password"
                      name="password"
                      value={loginForm.password}
                      onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                      required
                      placeholder="Nhập mật khẩu"
                      className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </label>
                  {loginError ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{loginError}</div> : null}
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="rounded-xl bg-brand-600 px-5 py-4 text-sm font-bold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="auth-form-panel mt-8 grid gap-5 md:grid-cols-2">
                  <label className="grid gap-2 md:col-span-2">
                    <span className="text-sm font-bold text-slate-700">Họ và tên</span>
                    <input
                      type="text"
                      name="fullName"
                      value={registerForm.fullName}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))}
                      required
                      placeholder="Nguyễn Văn A"
                      className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-700">Email</span>
                    <input
                      type="email"
                      name="email"
                      value={registerForm.email}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                      required
                      placeholder="ban@example.com"
                      className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-700">Số điện thoại</span>
                    <input
                      type="tel"
                      name="phone"
                      value={registerForm.phone}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
                      placeholder="090..."
                      className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-700">Mật khẩu</span>
                    <input
                      type="password"
                      name="password"
                      value={registerForm.password}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                      required
                      placeholder="Ít nhất 6 ký tự"
                      className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-700">Xác nhận mật khẩu</span>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={registerForm.confirmPassword}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                      required
                      placeholder="Nhập lại mật khẩu"
                      className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </label>
                  {registerError ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 md:col-span-2">{registerError}</div> : null}
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="rounded-xl bg-brand-600 px-5 py-4 text-sm font-bold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 md:col-span-2"
                  >
                    {registerMutation.isPending ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
