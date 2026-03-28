import { Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');

  // Si no se especifican roles, por defecto usamos los de administrador
  const defaultAllowed = ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'administrator'];
  const rolesToCheck = allowedRoles || defaultAllowed;

  if (!isAuthenticated || !rolesToCheck.includes(userRole || '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};