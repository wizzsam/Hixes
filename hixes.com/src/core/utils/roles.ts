/**
 * Lee los roles del usuario desde localStorage.
 * Soporta tanto el array `roles[]` (multi-rol) como el string legado `nombre_rol`.
 */
export const getUserRoles = (): string[] => {
  try {
    const raw = localStorage.getItem('userData');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.roles) && parsed.roles.length > 0) {
      return parsed.roles.map((r: { nombre_rol: string }) => r.nombre_rol);
    }
    return parsed.nombre_rol ? [parsed.nombre_rol] : [];
  } catch {
    return [];
  }
};

/** Devuelve true si el usuario tiene al menos uno de los roles indicados. */
export const tieneAlgunRol = (roles: string[]): boolean => {
  const userRoles = getUserRoles();
  return roles.some(r => userRoles.includes(r));
};
