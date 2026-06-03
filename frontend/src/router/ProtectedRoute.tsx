import { Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  isAuthRoute?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false, isAuthRoute = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isAuthRoute && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isAuthRoute && (!isAuthenticated || !user)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthRoute && requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
