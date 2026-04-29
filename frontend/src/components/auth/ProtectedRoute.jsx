import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { buildLoginRedirectPath } from '../../utils/routes';

function ProtectedRoute() {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  if (!isAuthReady) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="surface-card flex min-h-[280px] items-center justify-center p-10">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
        </div>
      </main>
    );
  }

  if (!token) {
    const redirectPath = `${location.pathname}${location.search}`;
    return <Navigate to={buildLoginRedirectPath(redirectPath)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
