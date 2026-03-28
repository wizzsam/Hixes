import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, User } from 'lucide-react';
import { menuItemsTrabajador, type MenuItem, type SubMenuItem } from '../context/items-sidebar-trabajador';

export const SidebarTrabajador = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

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
      if (item.link !== '/' && location.pathname.startsWith(item.link)) return true;
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
          {menuItemsTrabajador.map((item) => (
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
      
      {/* Footer / User Profile: Estética de "Conserjería" */}
      <div className="p-6 border-t border-gray-800 bg-[#0d0f11]">
        <div className="flex items-center group cursor-pointer">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center bg-gray-900 text-gray-400 group-hover:border-gray-400 transition-colors">
              <User size={18} strokeWidth={1.2} />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0d0f11] rounded-full"></span>
          </div>
          <div className="ml-4 truncate">
            <p className="text-[11px] font-medium text-gray-200 uppercase tracking-wider truncate">
              {(() => {
                const user = localStorage.getItem('userData');
                return user ? JSON.parse(user).nombre_completo.split(' ')[0] : 'Trabajador';
              })()}
            </p>
            <p className="text-[9px] text-gray-500 font-light uppercase tracking-[0.1em] mt-0.5 mt-0.5 truncate">
              {(() => {
                const sede = localStorage.getItem('sedeActiva');
                return sede ? JSON.parse(sede).nombre_sede : 'Sede Principal';
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};