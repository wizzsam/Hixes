import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAuth } from './services/login';

export const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    correo: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const response = await loginAuth(credentials);

    if (response.success && response.token && response.user) {
      const { nombre_rol, sede_id, nombre_sede, empresa_id, nombre_empresa } = response.user;

      // Guardamos la sesión
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userRole', nombre_rol || '');
      localStorage.setItem('userData', JSON.stringify(response.user));

      // Guardamos contexto de sede activa (para el trabajador)
      if (sede_id) {
        localStorage.setItem('sedeActiva', JSON.stringify({
          sede_id,
          nombre_sede,
          empresa_id,
          nombre_empresa,
        }));
      }

      // Redirección según rol
      const rolesPortal = ['ADMIN_EMPRESA', 'TRABAJADOR', 'VENTAS'];
      const rolesUsuario = response.user.roles?.map(r => r.nombre_rol) ?? (nombre_rol ? [nombre_rol] : []);

      if (nombre_rol === 'SUPER_ADMIN') {
        navigate('/administrator');
      } else if (rolesUsuario.some(r => rolesPortal.includes(r))) {
        navigate('/portal');
      } else {
        setError('Acceso denegado. No tienes permisos para ingresar.');
        localStorage.clear();
      }
    } else {
      setError(response.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    }

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4 antialiased"
      style={{
        backgroundImage: 'linear-gradient(to bottom right, rgba(249, 250, 251, 0.90), rgba(240, 241, 243, 0.95)), url("https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?q=80&w=2000")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-sm p-10 rounded-xl shadow-lg border border-gray-100">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="font-serif text-4xl font-extralight text-gray-900 tracking-wide">HEXIS</h2>
          <p className="mt-3 text-sm text-gray-500 font-light tracking-normal">
            Acceso al Sistema
          </p>
          <p className="mt-1 text-xs text-gray-400 font-light">
            Introduce tus credenciales para continuar
          </p>
        </div>

        {/* Formulario */}
        <form className="mt-10 space-y-7" onSubmit={handleSubmit}>
          
          <div className="space-y-5">
            <div>
              <label htmlFor="correo" className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                required
                value={credentials.correo}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-gray-200 bg-gray-50/50 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 sm:text-sm transition-colors"
                placeholder="Ej. usuario@hexis.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-gray-200 bg-gray-50/50 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 sm:text-sm transition-colors"
                placeholder="********"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50/60 border border-red-200 text-red-700 rounded-md p-3.5 text-sm font-light">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
         
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3.5 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 uppercase tracking-widest"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Verificando...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          <div className="border-t border-gray-100">
            <div className="p-2 bg-gray-50/50 rounded-lg border border-gray-100">
              <p className="text-[11px] text-gray-500 text-center font-light leading-relaxed">
                <strong className="font-medium text-gray-700">ACCESO SEGURO:</strong><br />
                Plataforma protegida con cifrado extremo a extremo.<br />
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};