import { useState, useMemo, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, ClipboardList, Calendar, Filter,
  ArrowDownCircle, ChevronDown, ChevronUp, MapPin, Star, ArrowRight,
  MessageCircle, Info, X, User, Phone, CreditCard, Mail
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import RegistrarConsumoGeneralModal from './components/RegistrarConsumoGeneralModal';
import { useClientes } from './hooks/useClientes';
import { exportarHistorialExcel } from '../../shared/utils/exportExcel';

const TX_LABELS: Record<string, string> = {
  consumo:           'Consumo',
  recarga_wallet:    'Recarga',
  pago_saldo:        'Pago Saldo',
  cashback:          'Cashback',
  cashback_expirado: 'EXPIRADO',
  wallet_expirado:   'EXPIRADO',
};

export const ClienteGeneralDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    clienteDetalle: cliente,
    transacciones: txs,
    isLoading,
    registrarConsumo,
    habilitarBeneficios,
  } = useClientes(Number(id));

  const [modalConsumo, setModalConsumo] = useState(false);
  const [modalInfo, setModalInfo] = useState(false);
  const [expandirId, setExpandirId] = useState<number | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [habilitando, setHabilitando] = useState(false);
  const itemsPorPagina = 10;

  // Solo mostrar transacciones de consumo (sin wallet/cashback)
  const transaccionesFiltradas = useMemo(() =>
    txs.filter((t: any) => t.tipo === 'consumo'),
    [txs]
  );

  const totalPaginas = Math.max(1, Math.ceil(transaccionesFiltradas.length / itemsPorPagina));
  const transaccionesPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return transaccionesFiltradas.slice(inicio, inicio + itemsPorPagina);
  }, [transaccionesFiltradas, paginaActual]);

  useEffect(() => { setPaginaActual(1); }, []);

  const handleExportarExcel = () => {
    if (!cliente) return;
    exportarHistorialExcel(
      {
        nombre_completo:   cliente.nombre_completo,
        dni:               cliente.dni,
        telefono:          cliente.telefono,
        consumo_acumulado: cliente.consumo_acumulado,
        nivelNombre:       'General',
      },
      transaccionesFiltradas
    );
  };

  const handleWhatsAppRecordatorio = () => {
    if (!cliente) return;
    const nombre = cliente.nombre_completo.split(' ')[0];
    const lineas: string[] = [
      `Hola ${nombre} 👋`,
      ``,
      `Te escribimos desde *HEXIS* para recordarte que te esperamos en tu próxima visita.`,
      ``,
      `✨ Cada visita cuenta — ¡acumula consumo y pronto podrás acceder a beneficios exclusivos!`,
      ``,
      `_— Tu equipo HEXIS_`,
    ];
    const phoneClean = cliente.telefono.replace(/\D/g, '');
    const fullPhone  = phoneClean.length === 9 ? `51${phoneClean}` : phoneClean;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(lineas.join('\n'))}`, '_blank');
  };

  const handleHabilitar = async () => {
    if (!cliente) return;
    setHabilitando(true);
    try {
      await habilitarBeneficios(cliente.id);
      navigate('/trabajador/clientes');
    } finally {
      setHabilitando(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Cargando perfil...</p>
      </div>
    );
  }

  if (!cliente) return null;

  const consumoTotal = parseFloat(String(cliente.consumo_acumulado));

  return (
    <div className="space-y-5 animate-fade-in pb-10">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{cliente.nombre_completo}</h1>
              {!cliente.estado && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider">
                  Inactivo
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">DNI: {cliente.dni} &middot; Tel: {cliente.telefono}</p>
          </div>
        </div>
        {/* Boton habilitar beneficios */}
        {!cliente.con_beneficios && (
          <button
            onClick={handleHabilitar}
            disabled={habilitando}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm disabled:opacity-60"
          >
            {habilitando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
            Habilitar beneficios
          </button>
        )}
        {cliente.con_beneficios && (
          <button
            onClick={() => navigate('/trabajador/clientes')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            Ver en Cashback & Wallet
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consumo Total</p>
            <p className="text-2xl font-black text-slate-900">S/ {consumoTotal.toFixed(2)}</p>
          </div>
          <div className="p-2.5 bg-purple-50 rounded-xl text-purple-500"><Clock size={20} /></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visitas Registradas</p>
            <p className="text-2xl font-black text-slate-900">{transaccionesFiltradas.length}</p>
          </div>
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500"><ClipboardList size={20} /></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sede</p>
            <p className="text-base font-black text-slate-900">{cliente.sede?.nombre_sede ?? '—'}</p>
          </div>
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-500"><MapPin size={20} /></div>
        </div>
      </div>

      {/* Panel operaciones */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Panel de Operaciones</h2>
        {!cliente.estado && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
            <span>&#9888;</span>
            Este cliente está inactivo. No se pueden registrar operaciones hasta que sea reactivado.
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setModalConsumo(true)}
            disabled={!cliente.estado}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ClipboardList className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-blue-700">Registrar Consumo</span>
          </button>

          <button
            onClick={() => setModalInfo(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
          >
            <Info className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-purple-700">Info Cliente</span>
          </button>

          <button
            onClick={handleWhatsAppRecordatorio}
            disabled={!cliente.telefono || !cliente.estado}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all group"
          >
            <MessageCircle className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-green-700">Recordatorio</span>
          </button>

          <button
            onClick={handleExportarExcel}
            disabled={transaccionesFiltradas.length === 0}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all group"
          >
            <ArrowDownCircle className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-emerald-700">Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Historial de Consumos</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Sede</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transaccionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Sin consumos registrados
                  </td>
                </tr>
              ) : (
                transaccionesPaginadas.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors text-xs font-medium">
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold italic">
                        <Calendar size={12} />
                        {new Date(tx.fecha).toLocaleDateString('es-PE')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tx.sede ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">{tx.sede.nombre_sede}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[11px]">—</span>
                      )}
                    </td>
                    <td
                      className="px-6 py-4 text-slate-600 italic cursor-pointer group min-w-[200px]"
                      onClick={() => setExpandirId(expandirId === tx.id ? null : tx.id)}
                    >
                      <div className="flex items-center gap-2">
                        <p className={expandirId === tx.id ? '' : 'truncate max-w-[200px]'}>
                          "{tx.descripcion}"
                        </p>
                        {expandirId === tx.id
                          ? <ChevronUp size={14} className="text-slate-400" />
                          : <ChevronDown size={14} className="text-slate-400 opacity-0 group-hover:opacity-100" />
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-slate-900">
                        S/ {parseFloat(String(tx.monto)).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando {Math.min((paginaActual - 1) * itemsPorPagina + 1, transaccionesFiltradas.length)}
              -{Math.min(paginaActual * itemsPorPagina, transaccionesFiltradas.length)} de {transaccionesFiltradas.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >Anterior</button>
              <div className="flex items-center gap-1.5 min-w-[60px] justify-center">
                <span className="text-xs font-black text-slate-800">{paginaActual}</span>
                <span className="text-xs text-slate-400">/</span>
                <span className="text-xs font-bold text-slate-400">{totalPaginas}</span>
              </div>
              <button
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal consumo */}
      {modalConsumo && cliente && (
        <RegistrarConsumoGeneralModal
          isOpen={modalConsumo}
          onClose={() => setModalConsumo(false)}
          cliente={cliente}
          onRegistrar={async (monto, servicio) => {
            await registrarConsumo(cliente.id, monto, servicio);
            setModalConsumo(false);
          }}
        />
      )}

      {/* Modal info cliente */}
      <Transition.Root show={modalInfo} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setModalInfo(false)}>
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
            <Transition.Child as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <Dialog.Title className="text-base font-bold text-slate-900">Información del Cliente</Dialog.Title>
                  <button onClick={() => setModalInfo(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-6 py-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre</p>
                      <p className="text-sm font-semibold text-slate-800">{cliente?.nombre_completo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DNI</p>
                      <p className="text-sm font-semibold text-slate-800">{cliente?.dni}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</p>
                      <p className="text-sm font-semibold text-slate-800">{cliente?.telefono || '—'}</p>
                    </div>
                  </div>
                  {cliente?.correo && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correo</p>
                        <p className="text-sm font-semibold text-slate-800">{cliente.correo}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sede</p>
                      <p className="text-sm font-semibold text-slate-800">{cliente?.sede?.nombre_sede || '—'}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Consumo acumulado</span>
                    <span className="text-sm font-black text-slate-800">S/ {parseFloat(String(cliente?.consumo_acumulado ?? 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Estado</span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${cliente?.estado ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {cliente?.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};