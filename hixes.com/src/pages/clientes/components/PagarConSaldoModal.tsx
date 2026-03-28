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
  onPagar: (montoTotal: number, servicio: string, walletDeducido: number, cashbackDeducido: number) => void;
  nivelActual: Nivel;
}

export default function PagarConSaldoModal({ isOpen, onClose, cliente, onPagar, nivelActual }: Props) {
  const [serviciosDisponibles, setServiciosDisponibles] = useState<ServicioHixes[]>([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<ServicioHixes[]>([]);
  const [montoStr, setMontoStr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingServicios, setIsLoadingServicios] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // 1. Carga de servicios dinámicos
  useEffect(() => {
    if (isOpen) {
      const fetchServicios = async () => {
        setIsLoadingServicios(true);
        try {
          const data = await obtenerServicios();
          setServiciosDisponibles(data.filter(s => s.estado));
        } catch (error) {
          console.error('Error:', error);
          toast.error('Error al cargar servicios de la base de datos.');
        } finally {
          setIsLoadingServicios(false);
        }
      };
      setServiciosSeleccionados([]);
      setMontoStr('');
      setBusqueda('');
      fetchServicios();
    }
  }, [isOpen]);

  // 2. Cálculo automático del monto al seleccionar servicios
  useEffect(() => {
    if (serviciosSeleccionados.length > 0) {
      const sum = serviciosSeleccionados.reduce((acc, curr) => acc + Number(curr.precio_base), 0);
      setMontoStr(sum.toString());
    } else {
      setMontoStr('');
    }
  }, [serviciosSeleccionados]);

  // --- LÓGICA MATEMÁTICA DE DESCUENTOS ---
  const montoTotal = parseFloat(montoStr) || 0;

  // Paso 1: Wallet HEXIS (Se aplica primero sobre el total)
  const deductWallet = Math.min(montoTotal, cliente.wallet);
  const restanteTrasWallet = montoTotal - deductWallet;

  // Paso 2: Cashback (Máximo 30% del monto total del servicio)
  const limiteCashback = montoTotal * 0.30;
  const cashbackDisponibleReal = Math.min(cliente.cashback, limiteCashback);
  const deductCashback = Math.min(restanteTrasWallet, cashbackDisponibleReal);

  const montoFinalEfectivo = restanteTrasWallet - deductCashback;

  // Paso 3: Nuevo Cashback a generar (Solo sobre lo pagado en efectivo/wallet, no sobre cashback usado)
  // Regla Senior: No generamos cashback sobre la parte pagada con cashback
  const montoBaseParaNuevoCB = Math.max(0, montoTotal - deductCashback);
  const nuevoCashback = (montoBaseParaNuevoCB * nivelActual.cashback_porcentaje) / 100;

  const handleClose = () => {
    setServiciosSeleccionados([]);
    setMontoStr('');
    setBusqueda('');
    onClose();
  };

  const serviciosFiltrados = serviciosDisponibles.filter(s =>
    s.tratamiento.toLowerCase().includes(busqueda.toLowerCase())
  );

  const toggleServicio = (s: ServicioHixes) => {
    setServiciosSeleccionados(prev => 
      prev.some(x => x.id === s.id) 
        ? prev.filter(x => x.id !== s.id) 
        : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (serviciosSeleccionados.length === 0) { toast.error('Selecciona al menos un servicio.'); return; }
    if (montoTotal <= 0) { toast.error('Monto inválido.'); return; }

    setIsLoading(true);
    await new Promise(res => setTimeout(res, 800)); // Simulación de red
    
    const nombresServicios = serviciosSeleccionados.map(s => s.tratamiento).join(', ');
    onPagar(montoTotal, nombresServicios, deductWallet, deductCashback);
    
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
              <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 shrink-0">
                <div>
                  <Dialog.Title className="text-lg font-bold text-slate-900">Pagar con Saldo</Dialog.Title>
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Aplicando beneficios de cliente</p>
                </div>
                <button onClick={handleClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                <div className="px-6 py-5 space-y-5 overflow-y-auto">
                  
                  {/* Info Saldos Disponibles */}
                  <div className="grid grid-cols-2 gap-3 shrink-0">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                      <p className="text-[10px] uppercase font-bold text-blue-400 mb-1 flex items-center gap-1">
                        <CreditCard size={10}/> Wallet Disp.
                      </p>
                      <p className="text-sm font-black text-blue-700">S/{Number(cliente.wallet).toFixed(2)}</p>
                    </div>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
                      <p className="text-[10px] uppercase font-bold text-emerald-400 mb-1 flex items-center gap-1">
                        <DollarSign size={10}/> Cashback Disp.
                      </p>
                      <p className="text-sm font-black text-emerald-700">S/{Number(cliente.cashback).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Selector de Servicios Dinámico */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between items-center">
                      <span>Servicios Realizados</span>
                      {isLoadingServicios && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                    </label>
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
                    <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1.5 bg-slate-50/30">
                      {serviciosFiltrados.map(s => (
                        <label key={s.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${serviciosSeleccionados.some(x => x.id === s.id) ? 'bg-white border-slate-900 shadow-sm' : 'bg-white/50 border-transparent hover:border-slate-200'}`}>
                          <input
                            type="checkbox"
                            checked={serviciosSeleccionados.some(x => x.id === s.id)}
                            onChange={() => toggleServicio(s)}
                            className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                          />
                          <div className="flex-1 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">{s.tratamiento}</span>
                            <span className="text-xs font-black text-slate-900">S/{Number(s.precio_base).toFixed(2)}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Monto Manual (Opcional por si hay recargos extras) */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-center">Monto Total del Servicio (S/)</label>
                    <input
                      type="number" step="0.01" value={montoStr}
                      onChange={e => setMontoStr(e.target.value)}
                      className="w-full px-4 py-3 text-xl font-black text-center border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:ring-0 transition-all"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Resumen de Cobro Dinámico - ESTILO SENIOR */}
                  {montoTotal > 0 && (
                    <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-3 shadow-xl">
                      <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-widest">
                        <span>Subtotal Servicio</span>
                        <span>S/{montoTotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="space-y-2 border-y border-white/10 py-3">
                        {deductWallet > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-blue-300"><CheckCircle2 size={14}/> Wallet HEXIS</span>
                            <span className="font-bold text-blue-300">- S/{deductWallet.toFixed(2)}</span>
                          </div>
                        )}
                        {deductCashback > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-emerald-300"><CheckCircle2 size={14}/> Cashback (Lím. 30%)</span>
                            <span className="font-bold text-emerald-300">- S/{deductCashback.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-xs font-black text-slate-400 uppercase">A pagar en caja</span>
                        <span className="text-2xl font-black text-white">S/{montoFinalEfectivo.toFixed(2)}</span>
                      </div>

                      <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Cashback generado</span>
                          <span className="text-[9px] text-slate-500 italic">Por nivel {nivelActual.nombre}</span>
                        </div>
                        <span className="text-lg font-black text-emerald-400">+ S/{nuevoCashback.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Acciones */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
                  <button type="button" onClick={handleClose} disabled={isLoading}
                    className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isLoading || montoTotal <= 0}
                    className="flex-[2] flex items-center justify-center gap-2 py-3 text-sm font-black text-white bg-slate-900 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Operación'}
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