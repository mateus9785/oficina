import { lazy } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

const LandingPage = lazy(() => import('../../pages/LandingPage').then(m => ({ default: m.LandingPage })));

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    if (location.pathname === '/') return <LandingPage />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
