import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, Loader2, Calendar, Pencil,
  Mail, MapPin, ToggleLeft, ToggleRight, Star, ArrowRight, ArrowUpRight, Briefcase
} from 'lucide-react';
import NuevoClienteModal from './components/NuevoClienteModal';
import EditarClienteModal from './components/EditarClienteModal';
import { useClientes } from './hooks/useClientes';
import type { Cliente } from './schemas/cliente.interface';

const inicial = (nombre: string) => nombre.charAt(0).toUpperCase();
const ITEMS_POR_PAGINA = 10;

export const ClientesGeneralPage = () => {
  const {
    clientes,
    isLoading,
    agregarCliente,
    actualizarCliente,
    toggleEstado,
    habilitarBeneficios,
  } = useClientes();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroBeneficios, setFiltroBeneficios] = useState<'todos' | 'sin_beneficios' | 'con_beneficios'>('todos');
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [toggling, setToggling] = useState<number | null>(null);
  const [habilitando, setHabilitando] = useState<number | null>(null);

  const filtrados = useMemo(() => {
    let lista = clientes.filter(c => {
      const coincideBusqueda =
        c.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.dni.includes(busqueda) ||
        c.telefono.includes(busqueda);
      if (!coincideBusqueda) return false;
      if (filtroBeneficios === 'sin_beneficios' && c.con_beneficios) return false;
      if (filtroBeneficios === 'con_beneficios' && !c.con_beneficios) return false;
      return true;
    });
    // Sin beneficios primero (activos), luego con beneficios al final
    lista = lista.sort((a, b) => {
      if (a.con_beneficios !== b.con_beneficios) return a.con_beneficios ? 1 : -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return lista;
  }, [clientes, busqueda, filtroBeneficios]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));
  const paginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return filtrados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [filtrados, paginaActual]);

  const resetPagina = () => setPaginaActual(1);

  const totalClientes = clientes.length;
  const totalActivos = clientes.filter(c => c.estado).length;
  const totalConBeneficios = clientes.filter(c => c.con_beneficios).length;

  const handleToggleEstado = async (cliente: Cliente) => {
    setToggling(cliente.id);
    try { await toggleEstado(cliente.id); } finally { setToggling(null); }
  };

  const handleHabilitarBeneficios = async (cliente: Cliente) => {
    setHabilitando(cliente.id);
    try { await habilitarBeneficios(cliente.id); } finally { setHabilitando(null); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 md:gap-0 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 md:space-x-4 w-full">
          <div className="bg-blue-50 p-2.5 md:p-3 rounded-xl ring-1 ring-blue-100 shrink-0">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg md:text-xl font-bold text-slate-800">Clientes</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5 font-medium leading-tight md:leading-normal">
              Gestiona tu base de clientes. Habilita beneficios para acceder a Cashback y Wallet.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-600/20 whitespace-nowrap"
          >
            + Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Clientes</p>
          <p className="text-2xl font-black text-slate-800">{totalClientes}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Activos</p>
          <p className="text-2xl font-black text-emerald-600">{totalActivos}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Con Beneficios</p>
          <p className="text-2xl font-black text-indigo-600">{totalConBeneficios}</p>
        </div>
      </div>

      {/* Buscador + Filtros */}
      <div className="space-y-3">
        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); resetPagina(); }}
            placeholder="Buscar por nombre, DNI o teléfono..."
            className="w-full pl-11 pr-4 py-3.5 text-sm bg-transparent rounded-2xl focus:outline-none text-slate-700 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 gap-0.5 shadow-sm">
            {([
              { key: 'todos', label: 'Todos' },
              { key: 'sin_beneficios', label: '● Sin beneficios' },
              { key: 'con_beneficios', label: '★ Con beneficios' },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => { setFiltroBeneficios(key); resetPagina(); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${filtroBeneficios === key ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Cargando clientes...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <Users className="w-16 h-16 text-slate-200 mb-4" />
            <h2 className="text-lg font-bold text-slate-700">No se encontraron clientes</h2>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">Intenta ajustar los filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Información del Cliente</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Sede</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Contacto</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Registro</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Consumo</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Estado</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginados.map(cliente => {
                  const conBeneficios = cliente.con_beneficios;
                  const inactivo = !cliente.estado;

                  return (
                    <tr key={cliente.id}
                      className={`group transition-all cursor-default ${conBeneficios ? 'opacity-60 bg-slate-50/60' : inactivo ? 'opacity-50' : 'hover:bg-slate-50/50'}`}
                    >
                      {/* Cliente */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 ${conBeneficios ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-100 border-slate-200'}`}>
                            <span className={`font-bold text-xs ${conBeneficios ? 'text-indigo-600' : 'text-slate-600'}`}>{inicial(cliente.nombre_completo)}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-slate-800 leading-none">{cliente.nombre_completo}</span>
                            <span className="text-[11px] text-slate-400 font-medium">DNI: {cliente.dni}</span>
                            {cliente.empresa && (
                              <div className="flex items-center gap-1 text-slate-500">
                                <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="text-[11px] truncate max-w-36">{cliente.empresa}</span>
                              </div>
                            )}
                            {conBeneficios && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold w-fit">
                                <Star className="w-2.5 h-2.5" />
                                Con beneficios
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Sede */}
                      <td className="px-6 py-4">
                        {cliente.sede ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="text-xs font-semibold text-slate-700">{cliente.sede.nombre_sede}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Contacto */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-slate-700">{cliente.telefono}</span>
                          {cliente.correo ? (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-[11px] truncate max-w-36">{cliente.correo}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-300">Sin correo</span>
                          )}
                        </div>
                      </td>

                      {/* Registro */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">
                            {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString() : '---'}
                          </span>
                        </div>
                      </td>

                      {/* Consumo */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-slate-700">
                          S/ {parseFloat(String(cliente.consumo_acumulado)).toFixed(2)}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 text-center">
                        {conBeneficios ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <button
                            onClick={() => handleToggleEstado(cliente)}
                            disabled={toggling === cliente.id}
                            title={cliente.estado ? 'Desactivar' : 'Activar'}
                            className={`p-2 rounded-lg transition-colors ${
                              toggling === cliente.id
                                ? 'opacity-50 cursor-not-allowed text-slate-300'
                                : cliente.estado
                                  ? 'text-emerald-500 hover:text-red-500 hover:bg-red-50'
                                  : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50'
                            }`}
                          >
                            {toggling === cliente.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : cliente.estado
                                ? <ToggleRight className="w-4 h-4" />
                                : <ToggleLeft className="w-4 h-4" />
                            }
                          </button>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-center">
                        {conBeneficios ? (
                          <button
                            onClick={() => navigate('/trabajador/clientes')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            Gestionar en Cashback & Wallet
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => navigate(`/trabajador/clientes-general/${cliente.id}`)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver perfil del cliente"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setClienteEditando(cliente)}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Editar datos"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleHabilitarBeneficios(cliente)}
                              disabled={habilitando === cliente.id}
                              title="Habilitar Cashback y Wallet"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {habilitando === cliente.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Star className="w-3.5 h-3.5" />
                              }
                              {habilitando === cliente.id ? '' : 'Habilitar beneficios'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginacion */}
        {!isLoading && totalPaginas > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando {Math.min((paginaActual - 1) * ITEMS_POR_PAGINA + 1, filtrados.length)}
              -{Math.min(paginaActual * ITEMS_POR_PAGINA, filtrados.length)} de {filtrados.length} clientes
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Anterior
              </button>
              <div className="flex items-center gap-1.5 min-w-[60px] justify-center">
                <span className="text-xs font-black text-slate-800">{paginaActual}</span>
                <span className="text-xs text-slate-400">/</span>
                <span className="text-xs font-bold text-slate-400">{totalPaginas}</span>
              </div>
              <button
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <NuevoClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClienteCreado={async (data) => {
          await agregarCliente({ ...data, con_beneficios: false });
        }}
      />

      {clienteEditando && (
        <EditarClienteModal
          isOpen={!!clienteEditando}
          onClose={() => setClienteEditando(null)}
          cliente={clienteEditando}
          onActualizar={async (id, data) => {
            await actualizarCliente(id, data);
            setClienteEditando(null);
          }}
        />
      )}
    </div>
  );
};