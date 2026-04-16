import { useState, useEffect, useMemo, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Loader2, Search, CheckCircle2, Circle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Cliente } from '../schemas/cliente.interface';
import { obtenerServicios } from '../../../admin/features/serviciosHixesAdmin/services/obtenerServicios';
import type { ServicioHixes } from '../../../admin/features/serviciosHixesAdmin/schemas/servicio.interface';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
  onRegistrar: (monto: number, servicio: string) => Promise<void>;
}

export default function RegistrarConsumoGeneralModal({ isOpen, onClose, cliente, onRegistrar }: Props) {
  const [serviciosDisponibles, setServiciosDisponibles] = useState<ServicioHixes[]>([]);
  const [seleccionados, setSeleccionados] = useState<ServicioHixes[]>([]);
  const [montoStr, setMontoStr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingServicios, setIsLoadingServicios] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSeleccionados([]);
      setMontoStr('');
      setBusqueda('');
      const fetchServicios = async () => {
        setIsLoadingServicios(true);
        try {
          const data = await obtenerServicios();
          setServiciosDisponibles(data.filter(s => s.estado));
        } catch {
          toast.error('No se pudieron cargar los servicios.');
        } finally {
          setIsLoadingServicios(false);
        }
      };
      fetchServicios();
    }
  }, [isOpen]);

  const serviciosFiltrados = useMemo(() =>
    serviciosDisponibles.filter(s =>
      s.tratamiento.toLowerCase().includes(busqueda.toLowerCase())
    ),
    [serviciosDisponibles, busqueda]
  );

  const toggleServicio = (s: ServicioHixes) => {
    setSeleccionados(prev => {
      const yaEsta = prev.some(x => x.id === s.id);
      const nuevo = yaEsta ? prev.filter(x => x.id !== s.id) : [...prev, s];
      // Recalcular monto automáticamente si no fue editado manualmente
      const suma = nuevo.reduce((acc, x) => acc + parseFloat(String(x.precio_base)), 0);
      setMontoStr(suma > 0 ? suma.toFixed(2) : '');
      return nuevo;
    });
  };

  const quitarServicio = (id: number) => {
    setSeleccionados(prev => {
      const nuevo = prev.filter(x => x.id !== id);
      const suma = nuevo.reduce((acc, x) => acc + parseFloat(String(x.precio_base)), 0);
      setMontoStr(suma > 0 ? suma.toFixed(2) : '');
      return nuevo;
    });
  };

  const monto = parseFloat(montoStr);
  const montoValido = !isNaN(monto) && monto > 0;
  const puedeRegistrar = seleccionados.length > 0 && montoValido;

  const handleSubmit = async () => {
    if (!puedeRegistrar) return;
    setIsLoading(true);
    try {
      const descripcion = seleccionados.map(s => s.tratamiento).join(', ');
      await onRegistrar(monto, descripcion);
      toast.success('Consumo registrado correctamente');
      onClose();
    } catch {
      // error ya notificado
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 scale-95" enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 scale-100" leaveTo="opacity-0 translate-y-4 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <Dialog.Title className="text-lg font-bold text-slate-900">Registrar Consumo</Dialog.Title>
                    <p className="text-xs text-slate-500 mt-0.5">{cliente.nombre_completo}</p>
                  </div>
                  <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-6 py-6 space-y-5">
                  {/* Servicios seleccionados (chips) */}
                  {seleccionados.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {seleccionados.map(s => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold"
                        >
                          {s.tratamiento}
                          <button type="button" onClick={() => quitarServicio(s.id)} className="hover:text-blue-900">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Buscar y listar servicios */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Servicios <span className="font-normal text-slate-400">(selecciona uno o varios)</span>
                    </label>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        placeholder="Buscar servicio..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                      />
                    </div>
                    {isLoadingServicios ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                      </div>
                    ) : (
                      <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                        {serviciosFiltrados.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4">Sin resultados</p>
                        ) : serviciosFiltrados.map(s => {
                          const activo = seleccionados.some(x => x.id === s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => toggleServicio(s)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                activo ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              {activo
                                ? <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                                : <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                              }
                              <span className={`flex-1 text-left ${activo ? 'font-semibold' : ''}`}>{s.tratamiento}</span>
                              <span className="text-xs font-bold text-slate-400">S/ {parseFloat(String(s.precio_base)).toFixed(2)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Monto */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Monto Total (S/)
                      {seleccionados.length > 1 && (
                        <span className="ml-2 text-xs font-normal text-slate-400">suma automática, editable</span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={montoStr}
                      onChange={e => setMontoStr(e.target.value)}
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading || !puedeRegistrar}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Registrando...</> : 'Registrar consumo'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}