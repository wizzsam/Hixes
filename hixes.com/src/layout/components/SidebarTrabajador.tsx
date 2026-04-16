import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, User } from 'lucide-react';
import { menuItemsTrabajador, type MenuItem, type SubMenuItem } from '../context/items-sidebar-trabajador';
import { getUserRoles } from '../../core/utils/roles';
import { axiosWithoutMultipart } from '../../api/axiosInstance';

export const SidebarTrabajador = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const userRoles = getUserRoles();

  // ── Sesión activa (disponible como vendedor) ───────────────────────────────
  const [sesionActiva, setSesionActiva] = useState<boolean>(false);
  const esVendedor = userRoles.includes('VENTAS') || userRoles.includes('ADMIN_EMPRESA');

  useEffect(() => {
    if (!esVendedor) return;
    axiosWithoutMultipart.get('/vendedor/sesion')
      .then(({ data }) => setSesionActiva(!!data.sesion_activa))
      .catch(() => { /* no crítico */ });
  }, [esVendedor]);

  const toggleSesion = async () => {
    const nuevo = !sesionActiva;
    setSesionActiva(nuevo); // Optimistic
    try {
      await axiosWithoutMultipart.post('/vendedor/sesion', { sesion_activa: nuevo });
    } catch {
      setSesionActiva(!nuevo); // Revert
    }
  };

  const puedeVerItem = (item: MenuItem): boolean => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some(r => userRoles.includes(r));
  };

  const visibleItems = menuItemsTrabajador.filter(puedeVerItem);

  const toggleExpand = (titulo: string) => {
    setExpandedItems(prev =>
      prev.includes(titulo)
        ? prev.filter(item => item !== titulo)
        : [...prev, titulo]
    );
  };

  const isItemActive = (item: MenuItem | SubMenuItem): boolean => {
    if ('link' in item && item.link) {
      if (location.pathname === item.link) return true;
      if (item.link !== '/' && location.pathname.startsWith(item.link + '/')) return true;
      return false;
    }
    if ('subMenu' in item && item.subMenu) {
      return item.subMenu.some(subItem => location.pathname === subItem.link);
    }
    return false;
  };

  const isExpanded = (titulo: string): boolean => {
    return expandedItems.includes(titulo);
  };

  return (
    
    <div className="w-72 bg-[#121417] h-full border-r border-gray-800 text-white flex flex-col transition-all duration-300">
      
      {/* Header: Coherente con el estilo Serif del Login */}
      <div className="p-8 border-b border-gray-800/50">
        <h2 className="text-2xl font-serif font-light tracking-[0.2em] text-white">HEXIS</h2>
        <div className="flex items-center mt-2.5">
          <span className="w-1 h-1 rounded-full bg-gray-500 mr-2"></span>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-light">
            Staff Portal
          </p>
        </div>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 overflow-y-auto px-5 py-8 custom-scrollbar">
        <ul className="space-y-4">
          {visibleItems.map((item) => (
            <li key={item.titulo}>
              {item.link ? (
                <Link
                  to={item.link}
                  className={`group flex items-center w-full px-4 py-3 text-xs uppercase tracking-widest transition-all duration-500 rounded-sm ${
                    isItemActive(item)
                      ? 'bg-white text-black shadow-xl' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`w-4 h-4 mr-4 transition-transform duration-300 ${isItemActive(item) ? 'text-black' : 'text-gray-600 group-hover:text-gray-300'}`} />
                  {item.titulo}
                </Link>
              ) : (
                <button
                  onClick={() => toggleExpand(item.titulo)}
                  className={`group flex items-center justify-between w-full px-4 py-3 text-xs uppercase tracking-widest transition-all duration-300 rounded-sm ${
                    isExpanded(item.titulo)
                      ? 'text-white border-b border-gray-700 pb-4'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="w-4 h-4 mr-4 text-gray-600 group-hover:text-gray-300" />
                    {item.titulo}
                  </div>
                  {isExpanded(item.titulo) ? (
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              )}

              {/* Submenú: Diseño Minimalista */}
              {item.subMenu && isExpanded(item.titulo) && (
                <ul className="mt-3 ml-8 space-y-3">
                  {item.subMenu.map((subItem) => (
                    <li key={subItem.titulo}>
                      <Link
                        to={subItem.link}
                        className={`flex items-center text-[11px] uppercase tracking-widest transition-colors duration-200 ${
                          isItemActive(subItem)
                            ? 'text-white font-medium italic'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <span className={`w-1 h-1 mr-3 rounded-full ${isItemActive(subItem) ? 'bg-white' : 'bg-gray-700'}`}></span>
                        {subItem.titulo}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer / User Profile */}
      <div className="p-6 border-t border-gray-800 bg-[#0d0f11]">
        <div className="flex items-center group">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center bg-gray-900 text-gray-400 group-hover:border-gray-400 transition-colors">
              <User size={18} strokeWidth={1.2} />
            </div>
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-[#0d0f11] rounded-full transition-colors ${sesionActiva ? 'bg-green-500' : 'bg-gray-600'}`}
            />
          </div>
          <div className="ml-4 truncate flex-1">
            <p className="text-[11px] font-medium text-gray-200 uppercase tracking-wider truncate">
              {(() => {
                const user = localStorage.getItem('userData');
                return user ? JSON.parse(user).nombre_completo.split(' ')[0] : 'Trabajador';
              })()}
            </p>
            <p className="text-[9px] text-gray-500 font-light uppercase tracking-[0.1em] mt-0.5 truncate">
              {(() => {
                const sede = localStorage.getItem('sedeActiva');
                return sede ? JSON.parse(sede).nombre_sede : 'Sede Principal';
              })()}
            </p>
          </div>
        </div>

        {/* Toggle disponible — solo para vendedores */}
        {esVendedor && (
          <button
            onClick={toggleSesion}
            className={`mt-4 w-full flex items-center justify-between px-3 py-2 rounded text-[11px] uppercase tracking-widest transition-colors ${
              sesionActiva
                ? 'bg-green-900/30 text-green-400 border border-green-700/40 hover:bg-green-900/50'
                : 'bg-gray-800/50 text-gray-500 border border-gray-700/40 hover:bg-gray-800'
            }`}
          >
            <span>{sesionActiva ? 'Disponible' : 'No disponible'}</span>
            <span
              className={`w-7 h-4 rounded-full relative transition-colors ${sesionActiva ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${sesionActiva ? 'left-3.5' : 'left-0.5'}`}
              />
            </span>
          </button>
        )}
      </div>
    </div>
  );
};