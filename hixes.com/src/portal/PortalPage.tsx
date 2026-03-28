import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisSistemas } from './services/sistemasService';
import type { Sistema } from '../core/components/auth/schemas/login.interface';

export const PortalPage = () => {
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargarSistemas = async () => {
      const response = await getMisSistemas();
      if (response.success) {
        setSistemas(response.sistemas);
        setNombreUsuario(response.usuario?.nombre_completo || '');
      } else {
        setError(response.message || 'No se pudieron cargar tus sistemas.');
      }
      setIsLoading(false);
    };
    cargarSistemas();
  }, []);

  const handleIngresarSistema = (sistema: Sistema) => {
    // Guardamos la sede activa seleccionada
    localStorage.setItem('sedeActiva', JSON.stringify({
      sede_id: sistema.sede_id,
      nombre_sede: sistema.nombre_sede,
      empresa_id: sistema.empresa_id,
      nombre_empresa: sistema.nombre_empresa,
    }));
    navigate('/trabajador/dashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage:
          'linear-gradient(135deg, #f0f4ff 0%, #fafafa 50%, #f5f0ff 100%)',
      }}
    >
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-tight">P</span>
            </div>
            <span className="font-serif text-xl font-light text-gray-900 tracking-wide">PORTAL DE SISTEMAS</span>
          </div>

          <div className="flex items-center gap-4">
            {nombreUsuario && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {getInitials(nombreUsuario)}
                </div>
                <span className="text-sm text-gray-600 font-light hidden sm:block">{nombreUsuario}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider font-medium px-3 py-1.5 rounded-md hover:bg-gray-100"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header section */}
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium mb-3">
            Panel de Acceso
          </p>
          <h1 className="text-4xl font-serif font-extralight text-gray-900 tracking-wide mb-4">
            Mis Sistemas
          </h1>
          <p className="text-gray-500 font-light text-sm max-w-md mx-auto">
            Selecciona el sistema al que deseas acceder. Cada sistema corresponde a una sede asignada a tu cuenta.
          </p>
        </div>

        {/* Estados */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-400 font-light">Cargando tus sistemas...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="max-w-md mx-auto bg-red-50 border border-red-100 rounded-xl p-6 text-center">
            <p className="text-red-600 text-sm font-light">{error}</p>
          </div>
        )}

        {/* Tarjetas de sistemas */}
        {!isLoading && !error && sistemas.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sistemas.map((sistema) => (
              <div
                key={sistema.sede_id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden"
              >
                {/* Banda superior decorativa */}
                <div className="h-1.5 bg-gradient-to-r from-gray-800 to-gray-600 group-hover:from-gray-900 group-hover:to-gray-700 transition-all duration-300" />

                <div className="p-7">
                  {/* Icono empresa */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white text-lg font-serif font-light">
                        {sistema.nombre_empresa?.[0] || 'H'}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-medium uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      Activo
                    </span>
                  </div>

                  {/* Info */}
                  <div className="mb-6">
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-medium mb-1">
                      {sistema.nombre_empresa || 'Empresa'}
                    </p>
                    <h3 className="text-xl font-serif font-light text-gray-900 leading-tight mb-2">
                      {sistema.nombre_sede}
                    </h3>
                    {sistema.direccion_sede && (
                      <div className="flex items-start gap-1.5 mt-2">
                        <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-xs text-gray-400 font-light leading-relaxed">
                          {sistema.direccion_sede}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Botón */}
                  <button
                    onClick={() => handleIngresarSistema(sistema)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-gray-900 text-white text-xs font-medium rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all duration-150 uppercase tracking-widest group/btn"
                  >
                    <span>Ingresar</span>
                    <svg
                      className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-150"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sin sistemas */}
        {!isLoading && !error && sistemas.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-gray-400 font-light text-sm">No tienes sistemas asignados.</p>
            <p className="text-gray-300 font-light text-xs mt-1">Contacta a tu administrador para que te asigne una sede.</p>
          </div>
        )}
      </div>
    </div>
  );
};
