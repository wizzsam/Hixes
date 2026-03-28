// src/pages/ClienteDetallePage.tsx
import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, DollarSign, Clock, ClipboardList, 
  RefreshCw, BarChart2, Calendar, Filter, ArrowDownCircle, ChevronDown, ChevronUp, MessageCircle, MapPin
} from 'lucide-react';

import RegistrarConsumoModal from './components/RegistrarConsumoModal';
import RecargarWalletModal from './components/RecargarWalletModal';
import InfoNivelesModal from './components/InfoNivelesModal';
import ResumenMensajeModal from './components/ResumenMensajeModal';
import ResumenWalletModal from './components/ResumenWalletModal';

import { useClientes } from './hooks/useClientes';
import { useNiveles } from './hooks/useNiveles';
import { exportarHistorialExcel } from '../../shared/utils/exportExcel';

const TX_LABELS: Record<string, string> = {
  consumo:           'Consumo',
  recarga_wallet:    'Recarga',
  pago_saldo:        'Pago Saldo',
  cashback:          'Cashback',
  cashback_expirado: 'EXPIRADO',
  wallet_expirado:   'EXPIRADO',
};

const formFecha = (iso: string | undefined) => {
  if (!iso) return '';
  const f = new Date(iso);
  return `Vence: ${new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }).format(f)}`;
};

const diasRestantes = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const ClienteDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    clienteDetalle: cliente,
    transacciones: txs,
    isLoading: loadingCliente,
    registrarConsumo,
    recargarWallet,
    pagarConSaldo,
  } = useClientes(Number(id));

  const { niveles, isLoading: loadingNiveles, getNivelActual, getSiguienteNivel } = useNiveles();
  const isLoading = loadingCliente || loadingNiveles;

  const [modalConsumo, setModalConsumo]       = useState(false);
  const [modalWallet,  setModalWallet]        = useState(false);
  const [modalNiveles, setModalNiveles]         = useState(false);
  const [expandirCashback, setExpandirCashback] = useState(false);
  const [txResumen,    setTxResumen]          = useState<{ servicio: string; monto: number; walletUsado?: number; cashbackUsado?: number } | null>(null);
  const [walletResumen, setWalletResumen] = useState<{ montoRecargado: number; montoTotal: number; porcentajeBono: number; montoBono: number } | null>(null);
  const [filtroTipo,   setFiltroTipo]       = useState<'todos' | 'wallet' | 'cashback'>('todos');
  const [expandirId,   setExpandirId]       = useState<number | null>(null);
  const [paginaActual, setPaginaActual]     = useState(1);
  const itemsPorPagina = 10;

  // Filtrado de transacciones
  const transaccionesFiltradas = useMemo(() => {
    let filtradas = txs;
    if (filtroTipo === 'wallet')   filtradas = txs.filter((t: any) => t.tipo === 'recarga_wallet' || t.tipo === 'pago_saldo' || t.tipo === 'wallet_expirado');
    if (filtroTipo === 'cashback') filtradas = txs.filter((t: any) => t.tipo === 'cashback' || t.tipo === 'cashback_expirado');
    return filtradas;
  }, [txs, filtroTipo]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(transaccionesFiltradas.length / itemsPorPagina));
  const transaccionesPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return transaccionesFiltradas.slice(inicio, inicio + itemsPorPagina);
  }, [transaccionesFiltradas, paginaActual, itemsPorPagina]);

  // Al cambiar el filtro, regresar a la página 1
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroTipo]);

  // Cashbacks individuales activos (para desglose)
  const cashbacksActivos = useMemo(() =>
    txs.filter((tx: any) => tx.tipo === 'cashback' && !tx.expirado && !tx.consumido && tx.vence_at),
    [txs]
  );

  // ── Exportar Excel ──────────────────────────────────────────
  const handleExportarExcel = () => {
    if (!cliente || !nivelActual) return;
    exportarHistorialExcel(
      {
        nombre_completo:   cliente.nombre_completo,
        dni:               cliente.dni,
        telefono:          cliente.telefono,
        consumo_acumulado: cliente.consumo_acumulado,
        nivelNombre:       nivelActual.nombre,
      },
      transaccionesFiltradas
    );
  };

  // ── WhatsApp Recordatorio ───────────────────────────────────
  const handleWhatsAppRecordatorio = () => {
    if (!cliente) return;
    const nombre = cliente.nombre_completo.split(' ')[0];
    const lineas: string[] = [
      `Hola ${nombre} 👋`,
      ``,
      `Te recordamos desde *HEXIS* sobre tus beneficios vigentes:`,
    ];

    if (parseFloat(String(cliente.wallet)) > 0) {
      const vence = cliente.wallet_vence
        ? new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long' }).format(new Date(cliente.wallet_vence))
        : null;
      lineas.push(``);
      lineas.push(`💳 *Wallet HEXIS:* S/ ${parseFloat(String(cliente.wallet)).toFixed(2)}`);
      if (vence) lineas.push(`   Vence el *${vence}*`);
    }

    if (cashbacksActivos.length > 0) {
      lineas.push(``);
      lineas.push(`🎁 *Cashback disponible:* S/ ${parseFloat(String(cliente.cashback)).toFixed(2)}`);
      (cashbacksActivos as any[]).forEach(cb => {
        if (cb.vence_at) {
          const v = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long' }).format(new Date(cb.vence_at));
          lineas.push(`   • S/ ${cb.monto.toFixed(2)} — vence el *${v}*`);
        }
      });
    } else if (parseFloat(String(cliente.cashback)) > 0) {
      lineas.push(``);
      lineas.push(`🎁 *Cashback disponible:* S/ ${parseFloat(String(cliente.cashback)).toFixed(2)}`);
    }

    lineas.push(``);
    lineas.push(`¡No olvides usarlos en tu próxima visita! ✨`);
    lineas.push(`_— Tu equipo HEXIS_`);

    const phoneClean = cliente.telefono.replace(/\D/g, '');
    const fullPhone  = phoneClean.length === 9 ? `51${phoneClean}` : phoneClean;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(lineas.join('\n'))}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Sincronizando con HEXIS...</p>
      </div>
    );
  }

  if (!cliente) return null;

  const nivelActual    = getNivelActual(cliente.consumo_acumulado);
  const siguienteNivel = getSiguienteNivel(nivelActual);
  const faltaParaSig   = siguienteNivel
    ? Math.max(0, siguienteNivel.consumo_minimo - cliente.consumo_acumulado)
    : 0;

  if (!nivelActual) return null;

  return (
    <div className="space-y-5 animate-fade-in pb-10">

      {/* ── Header Perfil ─────────────────────────────────────── */}
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
            <p className="text-sm text-slate-500">DNI: {cliente.dni} · Tel: {cliente.telefono}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200">
          <span className="text-lg">{nivelActual.icono}</span>
          <span className="text-xs font-black uppercase tracking-widest">{nivelActual.nombre}</span>
        </div>
      </div>

      {/* ── Cards de Saldo ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Wallet</p>
            <p className="text-2xl font-black text-slate-900">S/ {parseFloat(String(cliente.wallet)).toFixed(2)}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{formFecha(cliente.wallet_vence)}</p>
          </div>
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500"><CreditCard size={20} /></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cashback Acumulado</p>
              <p className="text-2xl font-black text-emerald-600">S/ {parseFloat(String(cliente.cashback)).toFixed(2)}</p>
              {cashbacksActivos.length === 0 && cliente.cashback_vence && (
                <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{formFecha(cliente.cashback_vence)}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {cashbacksActivos.length > 0 && (
                <button
                  onClick={() => setExpandirCashback(v => !v)}
                  className="flex items-center gap-1 text-[10px] font-black text-emerald-500 hover:text-emerald-700 transition-colors"
                >
                  {cashbacksActivos.length} activo{cashbacksActivos.length > 1 ? 's' : ''}
                  {expandirCashback ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
                </button>
              )}
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-500 shrink-0"><DollarSign size={20} /></div>
            </div>
          </div>
          {expandirCashback && cashbacksActivos.length > 0 && (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <div className="space-y-2 overflow-y-auto max-h-[120px] pr-1">
                {(cashbacksActivos as any[]).map(cb => {
                  const dias = diasRestantes(cb.vence_at);
                  const colorDias = dias <= 7
                    ? 'bg-red-50 text-red-500 border-red-200'
                    : dias <= 14
                    ? 'bg-amber-50 text-amber-500 border-amber-200'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200';
                  return (
                    <div key={cb.id} className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border shrink-0 ${colorDias}`}>
                        {dias}d
                      </span>
                      <span className="text-[10px] text-slate-400 italic flex-1 truncate">{formFecha(cb.vence_at)}</span>
                      <span className="text-xs font-bold text-emerald-600 shrink-0">S/ {cb.monto.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consumo Total</p>
            <p className="text-2xl font-black text-slate-900">S/ {parseFloat(String(cliente.consumo_acumulado)).toFixed(2)}</p>
            {siguienteNivel && (
              <p className="text-[10px] text-slate-400 mt-1">
                Faltan <span className="font-bold text-slate-600">S/ {faltaParaSig.toFixed(2)}</span> para {siguienteNivel.nombre}
              </p>
            )}
          </div>
          <div className="p-2.5 bg-purple-50 rounded-xl text-purple-500"><Clock size={20} /></div>
        </div>
      </div>

      {/* ── Panel de Operaciones ──────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Panel de Operaciones</h2>
        {!cliente.estado && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
            <span className="text-sm">&#9888;</span>
            Este cliente está inactivo. No se pueden registrar operaciones hasta que sea reactivado.
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setModalConsumo(true)}
            disabled={!cliente.estado}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white"
          >
            <ClipboardList className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-blue-700">Registrar Consumo</span>
          </button>

          <button
            onClick={() => setModalWallet(true)}
            disabled={!cliente.estado}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all group disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white"
          >
            <RefreshCw className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-amber-700">Recargar Wallet</span>
          </button>

          <button
            onClick={() => setModalNiveles(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
          >
            <BarChart2 className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-purple-700">Info Niveles</span>
          </button>

          <button
            onClick={handleWhatsAppRecordatorio}
            disabled={!cliente.telefono || !cliente.estado}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white transition-all group"
          >
            <MessageCircle className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-green-700">Recordatorio</span>
          </button>
        </div>
      </div>

      {/* ── Historial de Movimientos ──────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" /> Historial de Movimientos
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportarExcel}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-100 transition-all"
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              Exportar Excel
            </button>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['todos', 'wallet', 'cashback'] as const).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setFiltroTipo(tipo)}
                  className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase ${
                    filtroTipo === tipo
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Operación</th>
                <th className="px-6 py-4">Sede</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4 text-right">Efectivo</th>
                <th className="px-6 py-4 text-right">Wallet</th>
                <th className="px-6 py-4 text-right">Cashback</th>
                <th className="px-6 py-4 text-right">Monto Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transaccionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Sin movimientos registrados
                  </td>
                </tr>
              ) : (
                transaccionesPaginadas.map((tx: any) => {
                  const isCargo   = tx.tipo === 'pago_saldo' || tx.tipo === 'consumo';
                  const isExpired = tx.tipo === 'cashback_expirado' || tx.tipo === 'wallet_expirado';
                  let walletDescontado = 0, cashbackDescontado = 0, efectivoPagado = 0;

                  if (tx.tipo === 'pago_saldo') {
                    const wMatch = tx.descripcion.match(/Wallet: -S\/([0-9.]+)/);
                    const cMatch = tx.descripcion.match(/Cashback: -S\/([0-9.]+)/);
                    if (wMatch) walletDescontado   = parseFloat(wMatch[1]);
                    if (cMatch) cashbackDescontado = parseFloat(cMatch[1]);
                    efectivoPagado = parseFloat(tx.monto) - walletDescontado - cashbackDescontado;
                  } else if (tx.tipo === 'consumo') {
                    efectivoPagado = parseFloat(tx.monto);
                  }

                  return (
                    <tr key={tx.id} className={`hover:bg-slate-50/30 transition-colors text-xs font-medium ${isExpired ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold italic">
                          <Calendar size={12} />
                          {new Date(tx.fecha).toLocaleDateString('es-PE')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          tx.tipo === 'recarga_wallet'    ? 'bg-amber-100 text-amber-700'     :
                          tx.tipo === 'pago_saldo'        ? 'bg-blue-100 text-blue-700'       :
                          tx.tipo === 'cashback'          ? 'bg-emerald-100 text-emerald-700' :
                          tx.tipo === 'cashback_expirado' ? 'bg-red-50 text-red-400'          :
                          tx.tipo === 'wallet_expirado'   ? 'bg-red-50 text-red-400'          :
                                                            'bg-slate-100 text-slate-600'
                        }`}>
                          {TX_LABELS[tx.tipo] ?? tx.tipo}
                        </span>
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
                          <p className={expandirId === tx.id ? '' : 'truncate max-w-[150px]'}>
                            "{tx.descripcion}"
                          </p>
                          {expandirId === tx.id
                            ? <ChevronUp size={14} className="text-slate-400" />
                            : <ChevronDown size={14} className="text-slate-400 opacity-0 group-hover:opacity-100" />
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400">
                        {efectivoPagado > 0 ? `S/ ${efectivoPagado.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        {tx.tipo === 'recarga_wallet'
                          ? <span className="text-blue-600">+{tx.monto.toFixed(2)}</span>
                          : tx.tipo === 'wallet_expirado'
                            ? <span className="text-red-400 line-through text-[10px]">-{tx.monto.toFixed(2)}</span>
                            : tx.tipo === 'pago_saldo' && walletDescontado > 0
                              ? <span className="text-red-500">-{walletDescontado.toFixed(2)}</span>
                              : <span className="text-slate-200">-</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        {tx.tipo === 'cashback'
                          ? <span className="text-emerald-600">+{tx.monto.toFixed(2)}</span>
                          : tx.tipo === 'cashback_expirado'
                            ? <span className="text-red-400 line-through text-[10px]">-{tx.monto.toFixed(2)}</span>
                            : tx.tipo === 'pago_saldo' && cashbackDescontado > 0
                              ? <span className="text-red-500">-{cashbackDescontado.toFixed(2)}</span>
                              : <span className="text-slate-200">-</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isExpired ? (
                          <span className="text-xs font-black text-red-400 line-through italic">
                            S/ {tx.monto.toFixed(2)}
                          </span>
                        ) : (
                          <span className={`text-sm font-black ${isCargo ? 'text-red-500' : 'text-slate-900'}`}>
                            {isCargo ? '-' : '+'} S/ {tx.monto.toFixed(2)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando {Math.min((paginaActual - 1) * itemsPorPagina + 1, transaccionesFiltradas.length)} a {Math.min(paginaActual * itemsPorPagina, transaccionesFiltradas.length)} de {transaccionesFiltradas.length} resultados
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600"
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
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modales ───────────────────────────────────────────── */}
      <RegistrarConsumoModal
        isOpen={modalConsumo}
        onClose={() => setModalConsumo(false)}
        cliente={cliente}
        onRegistrar={(monto, servicio) => {
          registrarConsumo(cliente.id, monto, servicio);
          setTxResumen({ monto, servicio, walletUsado: 0, cashbackUsado: 0 });
        }}
        onPagar={(mTotal, serv, wDed, cDed) => {
          pagarConSaldo(cliente.id, mTotal, serv, wDed, cDed);
          setTxResumen({ monto: mTotal, servicio: serv, walletUsado: wDed, cashbackUsado: cDed });
        }}
        nivelActual={nivelActual}
      />
      <RecargarWalletModal
        isOpen={modalWallet}
        onClose={() => setModalWallet(false)}
        cliente={cliente}
        onRecargar={monto => {
          // Calcular bono igual que el modal
          let pct = 0;
          if (monto >= 2000) pct = 12;
          else if (monto >= 1000) pct = 10;
          else if (monto >= 500) pct = 8;
          else if (monto >= 300) pct = 5;
          else if (monto >= 1) pct = 3;
          const bono = (monto * pct) / 100;
          recargarWallet(cliente.id, monto);
          setWalletResumen({ montoRecargado: monto, montoTotal: monto + bono, porcentajeBono: pct, montoBono: bono });
        }}
      />
      <InfoNivelesModal
        isOpen={modalNiveles}
        onClose={() => setModalNiveles(false)}
        cliente={cliente}
        niveles={niveles}
      />
      {txResumen && (
        <ResumenMensajeModal
          isOpen={true}
          onClose={() => setTxResumen(null)}
          cliente={cliente}
          servicio={txResumen.servicio}
          monto={txResumen.monto}
          walletUsado={txResumen.walletUsado ?? 0}
          cashbackUsado={txResumen.cashbackUsado ?? 0}
          nivelActual={nivelActual}
          siguienteNivel={siguienteNivel}
          faltaParaSig={faltaParaSig}
        />
      )}
      {walletResumen && (
        <ResumenWalletModal
          isOpen={true}
          onClose={() => setWalletResumen(null)}
          cliente={cliente}
          montoRecargado={walletResumen.montoRecargado}
          montoTotal={walletResumen.montoTotal}
          porcentajeBono={walletResumen.porcentajeBono}
          montoBono={walletResumen.montoBono}
        />
      )}
    </div>
  );
};

// ── Loader local ─────────────────────────────────────────────────
const Loader2 = ({ className }: { className?: string }) => (
  <RefreshCw className={`${className} animate-spin`} />
);