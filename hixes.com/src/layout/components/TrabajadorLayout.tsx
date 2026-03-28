import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarTrabajador } from './SidebarTrabajador';
import { LogOut, User, Menu } from 'lucide-react';
import { Toaster } from 'sonner';
import { logoutAuth } from '../../core/components/auth/services/logout';

export const TrabajadorLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userStr = localStorage.getItem('userData');
  const userData = userStr ? JSON.parse(userStr) : null;
  const userName = userData?.nombre || 'Mi Perfil';

  const handleLogout = async () => {
    try {
      if (localStorage.getItem('authToken')) {
         await logoutAuth();
      }
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/';
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased overflow-hidden">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}>
        <SidebarTrabajador />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden relative w-full">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10 transition-all duration-300">
          <div className="flex justify-between items-center px-4 lg:px-8 py-4 lg:py-5">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-lg hover:bg-slate-100 lg:hidden text-slate-700 active:bg-slate-200 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
                  Espacio de Trabajo
                </h1>
                <p className="hidden md:block text-sm text-slate-500 font-medium mt-1">
                  Bienvenido al panel, {userName.split(' ')[0] || 'Administrador'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-6">
              <div className="hidden md:flex items-center space-x-3 bg-slate-50 hover:bg-slate-100 transition-colors px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer">
                <div className="bg-white p-1.5 rounded-full shadow-sm ring-1 ring-slate-200">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700 pr-1">{userName}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="group flex items-center justify-center p-2.5 md:px-4 md:py-2.5 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl md:rounded-2xl transition-all duration-300 border border-transparent hover:border-red-100 hover:shadow-sm"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5 md:w-4 md:h-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden md:inline ml-2">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Usamos un degradado sutil en el fondo del main para evitar que se vea completamente blanco/plano */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] scroll-smooth">
          <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-8 h-full">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};
