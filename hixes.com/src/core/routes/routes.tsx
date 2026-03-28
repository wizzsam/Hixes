import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { LazyWrapper } from './components/LazyWrapper';
import { ProtectedRoute } from './guard/ProtectedRoute';
import { AdminLayout } from '../../layout/components/AdminLayout';

// Lazy loading de las páginas principales

const LoginForm = lazy(() =>
  import('../components/auth/LoginForm').then((module) => ({ default: module.LoginForm }))
);

const FormularioPage = lazy(() =>
  import('../../pages/formulario/FormularioPage').then((module) => ({ default: module.FormularioPage }))
);

// Lazy loading de las páginas administrativas
const EmpresasAdmin = lazy(() =>
  import('../../admin/features/empresaAdmin/pages/empresasAdmin').then((module) => ({ default: module.default }))
);

const SedesAdmin = lazy(() =>
  import('../../admin/features/sedesAdmin/pages/sedesAdmin').then((module) => ({ default: module.default }))
);
const RolesAdmin = lazy(() =>
  import('../../admin/features/rolesAdmin/pages/rolesAdmin').then((module) => ({ default: module.default }))
);
const UsuariosAdmin = lazy(() =>
  import('../../admin/features/usuarioAdmin/pages/usuarioAdmin').then((module) => ({ default: module.default }))
);
const BonoWalletAdmin = lazy(() =>
import ('../../admin/features/bonoWalletAdmin/pages/BonoWalletAdmin').then((module) => ({default: module.default}))
);
const NivelesAdmin = lazy(() =>
import ('../../admin/features/nivelesAdmin/pages/NivelesAdmin').then((module) => ({default: module.default}))
);
const ServicioHixesAdmin = lazy(() =>
import ('../../admin/features/serviciosHixesAdmin/pages/ServiciosHixesAdmin').then((module) => ({default: module.default}))
);
// Lazy loading de las páginas del trabajador
const TrabajadorDashboard = lazy(() => import('../../pages/dashboard/DashboardPage').then(module => ({ default: module.DashboardPage })));
const TrabajadorClientes = lazy(() => import('../../pages/clientes/ClientesPage').then(module => ({ default: module.ClientesPage })));
const TrabajadorClienteDetalle = lazy(() => import('../../pages/clientes/ClienteDetallePage').then(module => ({ default: module.ClienteDetallePage })));

const TrabajadorLayoutComponent = lazy(() =>
  import('../../layout/components/TrabajadorLayout').then((module) => ({ default: module.TrabajadorLayout }))
);

// Portal de selección de sistemas (post-login trabajador)
const PortalPage = lazy(() =>
  import('../../portal/PortalPage').then((module) => ({ default: module.PortalPage }))
);

export const routes = [
  // Ruta principal - Login
  {
    path: '/',
    element: (
      <LazyWrapper>
        <LoginForm />
      </LazyWrapper>
    ),
  },

  // Ruta pública - Formulario
  {
    path: '/formulario',
    element: (
      <LazyWrapper>
        <FormularioPage />
      </LazyWrapper>
    ),
  },

  // Portal del trabajador — selección de sistemas/sedes
  {
    path: '/portal',
    element: (
      <ProtectedRoute allowedRoles={['TRABAJADOR', 'ADMIN_EMPRESA']}>
        <LazyWrapper>
          <PortalPage />
        </LazyWrapper>
      </ProtectedRoute>
    ),
  },

  // Trabajador - Vista para empleados (protegida bajo su propia lógica/layout)
  {
    path: '/trabajador',
    element: (
      <ProtectedRoute allowedRoles={['TRABAJADOR', 'ADMIN_EMPRESA']}>
        <LazyWrapper>
           <TrabajadorLayoutComponent />
        </LazyWrapper>
      </ProtectedRoute>
    ),
    children: [
      {
         index: true,
         element: <Navigate to="/trabajador/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <LazyWrapper>
             <TrabajadorDashboard />
          </LazyWrapper>
        )
      },
      {
        path: 'clientes',
        element: (
          <LazyWrapper>
             <TrabajadorClientes />
          </LazyWrapper>
        )
      },
      {
        path: 'clientes/:id',
        element: (
          <LazyWrapper>
             <TrabajadorClienteDetalle />
          </LazyWrapper>
        )
      },
  
      
    ]
  },


  // Administrator - Vista solo para SUPER_ADMIN
  {
    path: '/administrator',
    element: (
      <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/administrator/empresas" replace />,
      },
      // Gestión de Contenido
      {
        path: 'empresas',
        element: (
          <LazyWrapper>
            <EmpresasAdmin />
          </LazyWrapper>
        ),
      },
      {
        path: 'sedes',
        element: (
          <LazyWrapper>
            <SedesAdmin />
          </LazyWrapper>
        ),
      },
      {
        path: 'roles',
        element: (
          <LazyWrapper>
            <RolesAdmin />
          </LazyWrapper>
        ),
      },
      {
        path: 'usuarios',
        element: (
          <LazyWrapper>
            <UsuariosAdmin />
          </LazyWrapper>
        ),
      },
          {
        path: 'wallets',
        element:(
          <LazyWrapper>
            <BonoWalletAdmin/>
          </LazyWrapper>
        )
      },
      {
        path: 'niveles',
        element:(
          <LazyWrapper>
            <NivelesAdmin/>
          </LazyWrapper>
        )
      },
      {
        path: 'servicios',
        element:(
          <LazyWrapper>
            <ServicioHixesAdmin/>
          </LazyWrapper>
        )
      }
    ],
  },

  // Ruta 404 - Página no encontrada
  {
    path: '/404',
    element: (
      <div className='flex items-center justify-center min-h-screen p-6 bg-gray-50'>
        <div className='w-full max-w-md p-8 text-center bg-white shadow-lg rounded-xl'>
          <div className='flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full'>
            <svg className='w-10 h-10 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h1 className='mb-2 text-4xl font-bold text-gray-900'>404</h1>
          <h2 className='mb-4 text-xl font-semibold text-gray-700'>Página no encontrada</h2>
          <p className='mb-6 text-gray-600'>La página que buscas no existe</p>
          <a
            href='/'
            className='inline-flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700'>
            <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
            </svg>
            Volver al inicio
          </a>
        </div>
      </div>
    ),
  },

  // Catch all - Redirige a 404
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
];
