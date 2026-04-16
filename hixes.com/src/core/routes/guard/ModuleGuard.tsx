import { Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { tieneAlgunRol } from '../../utils/roles';

interface ModuleGuardProps {
  children: ReactNode;
  /** El usuario debe tener AL MENOS UNO de estos roles */
  requiredRoles: string[];
  /** Ruta a la que redirigir si no tiene acceso (por defecto dashboard) */
  redirectTo?: string;
}

/**
 * Guard de módulo para rutas del trabajador.
 * Si el usuario no tiene ninguno de los roles requeridos, redirige.
 */
export const ModuleGuard = ({
  children,
  requiredRoles,
  redirectTo = '/trabajador/dashboard',
}: ModuleGuardProps) => {
  const hasAccess = tieneAlgunRol(requiredRoles);
  if (!hasAccess) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
};
