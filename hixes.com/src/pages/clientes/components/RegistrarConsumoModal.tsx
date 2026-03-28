import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Loader2, CreditCard, DollarSign, CheckCircle2, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { Cliente, Nivel } from '../schemas/cliente.interface';
import { obtenerServicios } from '../../../admin/features/serviciosHixesAdmin/services/obtenerServicios';
import type { ServicioHixes } from '../../../admin/features/serviciosHixesAdmin/schemas/servicio.interface';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
  onRegistrar: (monto: number, servicio: string) => void;
  onPagar: (montoTotal: number, servicio: string, walletDeducido: number, cashbackDeducido: number) => void;
  nivelActual: Nivel;
}

export default function RegistrarConsumoModal({ isOpen, onClose, cliente, onRegistrar, onPagar, nivelActual }: Props) {
  const [serviciosDisponibles, setServiciosDisponibles] = useState<ServicioHixes[]>([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<ServicioHixes[]>([]);
  const [montoStr, setMontoStr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingServicios, setIsLoadingServicios] = useState(false);
  const [usarWallet, setUsarWallet] = useState(false);
  const [usarCashback, setUsarCashback] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Al abrir: inicializar toggles según saldo disponible
  useEffect(() => {
    if (isOpen) {
      setUsarWallet(Number(cliente.wallet) > 0);
      setUsarCashback(Number(cliente.cashback) > 0);
      setServiciosSeleccionados([]);
      setMontoStr('');
      setBusqueda('');

      const fetchServicios = async () => {
        setIsLoadingServicios(true);
        try {
          const data = await obtenerServicios();
          setServiciosDisponibles(data.filter(s => s.estado));
        } catch (error) {
          console.error('Error al cargar servicios:', error);
          toast.error('No se pudieron cargar los servicios.');
        } finally {
          setIsLoadingServicios(false);
        }
      };
      fetchServicios();
    }
  }, [isOpen, cliente.wallet, cliente.cashback]);

  // Auto-calcular monto al seleccionar/deseleccionar servicios
  useEffect(() => {
    if (serviciosSeleccionados.length > 0) {
      const sum = serviciosSeleccionados.reduce((acc, s) => acc + Number(s.precio_base), 0);
      setMontoStr(sum.toString());
    } else {
      setMontoStr('');
    }
  }, [serviciosSeleccionados]);

  // ── Cálculos de descuentos (misma lógica que PagarConSaldoModal) ──
  const montoTotal = parseFloat(montoStr) || 0;

  const deductWallet   = usarWallet   ? Math.min(montoTotal, Number(cliente.wallet)) : 0;
  const restante1      = montoTotal - deductWallet;
  const limiteCashback = montoTotal * 0.30;
  const deductCashback = usarCashback
    ? Math.min(restante1, Math.min(Number(cliente.cashback), limiteCashback))
    : 0;
  const montoEfectivo = restante1 - deductCashback;

  const usaSaldo = usarWallet || usarCashback;

  // Cashback generado: no se genera sobre la parte pagada con cashback
  const montoBaseNuevoCB = Math.max(0, montoTotal - deductCashback);
  const nuevoCashback = (montoBaseNuevoCB * nivelActual.cashback_porcentaje) / 100;
  const cashbackSimple = (montoTotal * nivelActual.cashback_porcentaje) / 100;

  const hasSaldo = Number(cliente.wallet) > 0 || Number(cliente.cashback) > 0;
  const serviciosFiltrados = serviciosDisponibles.filter(s =>
    s.tratamiento.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleClose = () => {
    setServiciosSeleccionados([]);
    setMontoStr('');
    setBusqueda('');
    onClose();
  };

  const toggleServicio = (s: ServicioHixes) => {
    setServiciosSeleccionados(prev =>
      prev.some(x => x.id === s.id) ? prev.filter(x => x.id !== s.id) : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (serviciosSeleccionados.length === 0) { toast.error('Selecciona al menos un servicio.'); return; }
    if (montoTotal <= 0) { toast.error('Ingresa un monto válido.'); return; }

    setIsLoading(true);
    await new Promise(res => setTimeout(res, 700));

    const nombresServicios = serviciosSeleccionados.map(s => s.tratamiento).join(', ');

    if (usaSaldo && (deductWallet > 0 || deductCashback > 0)) {
      onPagar(montoTotal, nombresServicios, deductWallet, deductCashback);
    } else {
      onRegistrar(montoTotal, nombresServicios);
    }

    toast.success(`Operación de S/${montoTotal.toFixed(2)} registrada.`);
    setIsLoading(false);
    handleClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
            <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
                <div>
                  <Dialog.Title className="text-lg font-bold text-slate-900">Registrar Consumo</Dialog.Title>
                  <p className="text-[11px] text-slate-500 font-medium">{nivelActual.nombre} · {nivelActual.cashback_porcentaje}% cashback</p>
                </div>
                <button onClick={handleClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                <div className="px-6 py-5 space-y-5 overflow-y-auto">

                  {/* Saldos + Toggles */}
                  {hasSaldo && (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2 bg-slate-50 border-b border-slate-200">
                        Aplicar saldos del cliente
                      </p>
                      <div className="divide-y divide-slate-100">

                        {/* Toggle Wallet */}
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${usarWallet ? 'bg-blue-100' : 'bg-slate-100'}`}>
                              <CreditCard className={`w-3.5 h-3.5 ${usarWallet ? 'text-blue-600' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${usarWallet ? 'text-slate-800' : 'text-slate-400'}`}>Wallet HEXIS</p>
                              <p className="text-xs text-slate-400 font-medium">S/{Number(cliente.wallet).toFixed(2)} disponible</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => Number(cliente.wallet) > 0 && setUsarWallet(v => !v)}
                            disabled={Number(cliente.wallet) === 0}
                            className={`relative w-10 h-6 rounded-full transition-colors duration-200 disabled:opacity-40 ${usarWallet ? 'bg-blue-500' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${usarWallet ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Toggle Cashback */}
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${usarCashback ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                              <DollarSign className={`w-3.5 h-3.5 ${usarCashback ? 'text-emerald-600' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${usarCashback ? 'text-slate-800' : 'text-slate-400'}`}>
                                Cashback <span className="text-xs font-normal">(máx. 30%)</span>
                              </p>
                              <p className="text-xs text-slate-400 font-medium">S/{Number(cliente.cashback).toFixed(2)} disponible</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => Number(cliente.cashback) > 0 && setUsarCashback(v => !v)}
                            disabled={Number(cliente.cashback) === 0}
                            className={`relative w-10 h-6 rounded-full transition-colors duration-200 disabled:opacity-40 ${usarCashback ? 'bg-emerald-500' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${usarCashback ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lista de servicios */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-slate-700">Servicios</label>
                      {isLoadingServicios && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                    </div>
                    <div className="mb-2 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        placeholder="Buscar servicio..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 bg-white"
                      />
                    </div>
                    <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1.5 bg-slate-50/30">
                      {isLoadingServicios ? (
                        <p className="text-xs text-slate-500 text-center py-4">Cargando servicios...</p>
                      ) : serviciosDisponibles.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">No hay servicios disponibles</p>
                      ) : serviciosFiltrados.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">Sin resultados para "{busqueda}"</p>
                      ) : (
                        serviciosFiltrados.map(s => (
                          <label key={s.id} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border ${
                            serviciosSeleccionados.some(x => x.id === s.id)
                              ? 'bg-white border-blue-400 shadow-sm'
                              : 'bg-white/60 border-transparent hover:border-slate-200'
                          }`}>
                            <input
                              type="checkbox"
                              checked={serviciosSeleccionados.some(x => x.id === s.id)}
                              onChange={() => toggleServicio(s)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                            <div className="flex-1 flex justify-between items-center">
                              <span className="text-sm font-medium text-slate-700">{s.tratamiento}</span>
                              <span className="text-sm font-bold text-slate-800">S/{Number(s.precio_base).toFixed(2)}</span>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Monto */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-center">Monto Total (S/)</label>
                    <input
                      type="number" step="0.01" value={montoStr}
                      onChange={e => setMontoStr(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 text-xl font-black text-center border-2 border-slate-100 rounded-2xl focus:border-blue-400 focus:ring-0 transition-all"
                    />
                  </div>

                  {/* Resumen de pago */}
                  {montoTotal > 0 && (
                    <div className={`rounded-2xl p-5 space-y-3 ${usaSaldo ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 border border-slate-200'}`}>
                      <div className={`flex justify-between text-xs font-bold uppercase tracking-widest ${usaSaldo ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span>Subtotal Servicio</span>
                        <span>S/{montoTotal.toFixed(2)}</span>
                      </div>

                      {usaSaldo && (deductWallet > 0 || deductCashback > 0) && (
                        <div className="space-y-2 border-y border-white/10 py-3">
                          {deductWallet > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="flex items-center gap-2 text-blue-300"><CheckCircle2 size={13}/> Wallet HEXIS</span>
                              <span className="font-bold text-blue-300">- S/{deductWallet.toFixed(2)}</span>
                            </div>
                          )}
                          {deductCashback > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="flex items-center gap-2 text-emerald-300"><CheckCircle2 size={13}/> Cashback</span>
                              <span className="font-bold text-emerald-300">- S/{deductCashback.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-black uppercase ${usaSaldo ? 'text-slate-400' : 'text-slate-600'}`}>A pagar en caja</span>
                        <span className={`text-2xl font-black ${usaSaldo ? 'text-white' : 'text-slate-900'}`}>
                          S/{(usaSaldo ? montoEfectivo : montoTotal).toFixed(2)}
                        </span>
                      </div>

                      <div className={`p-3 rounded-xl flex items-center justify-between ${usaSaldo ? 'bg-white/5 border border-white/10' : 'bg-emerald-50 border border-emerald-100'}`}>
                        <div>
                          <p className={`text-[10px] font-bold uppercase ${usaSaldo ? 'text-slate-400' : 'text-emerald-700'}`}>Cashback a generar</p>
                          <p className={`text-[9px] italic ${usaSaldo ? 'text-slate-500' : 'text-emerald-500'}`}>Nivel {nivelActual.nombre} · vigencia {nivelActual.vigencia_dias} días</p>
                        </div>
                        <span className={`text-lg font-black ${usaSaldo ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          + S/{(usaSaldo ? nuevoCashback : cashbackSimple).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                  <button type="button" onClick={handleClose} disabled={isLoading}
                    className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isLoading || montoTotal <= 0}
                    className="flex-[2] flex items-center justify-center gap-2 py-2.5 text-sm font-black text-white bg-slate-900 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
