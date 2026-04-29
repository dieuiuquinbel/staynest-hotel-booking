import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SiteHeader from './components/layout/SiteHeader';
import { getCurrentUser } from './services/authApi';
import useAuthStore from './store/authStore';
import AuthPage from './pages/AuthPage';
import BookingPage from './pages/BookingPage';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import MyBookingsPage from './pages/MyBookingsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import RoomListPage from './pages/RoomListPage';

function App() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const markReady = useAuthStore((state) => state.markReady);
  const markPending = useAuthStore((state) => state.markPending);

  const authQuery = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: getCurrentUser,
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (token) {
      markPending();
      return;
    }

    markReady();
  }, [token, markPending, markReady]);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (authQuery.isSuccess) {
      if (!user || user.id !== authQuery.data.id) {
        setUser(authQuery.data);
      }
      markReady();
      return;
    }

    if (authQuery.isError) {
      clearSession();
    }
  }, [authQuery.data, authQuery.isError, authQuery.isSuccess, clearSession, markReady, setUser, token, user]);

  return (
    <div className="min-h-screen text-slate-900">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomListPage />} />
        <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
