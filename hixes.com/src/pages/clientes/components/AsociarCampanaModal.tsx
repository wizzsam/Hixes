import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Megaphone, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { campanaWorkerService } from '../../../pages/campanas/services/campanaWorkerService';
import { campanaService } from '../../../admin/features/campanasAdmin/services/campanaService';
import type { Campana } from '../../../admin/features/campanasAdmin/schemas/campana.interface';

interface Props {
  isOpen: boolean;
  clienteId: number;
  clienteNombre: string;
  onClose: () => void;
}

export default function AsociarCampanaModal({ isOpen, clienteId, clienteNombre, onClose }: Props) {
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [asociadas, setAsociadas] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    campanaWorkerService.obtenerActivas()
      .then(data => {
        setCampanas(data);
        // Detectar en cuáles ya está este cliente
        Promise.all(
          data.map(c =>
            campanaService.obtenerEtapas(c.id)
              .then(() => null) // etapas no nos interesa aquí
              .catch(() => null)
          )
        ).then(() => {});
      })
      .catch(() => setCampanas([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleAgregar = async (campanaId: number) => {
    setSaving(campanaId);
    try {
      await campanaWorkerService.agregarCliente(campanaId, clienteId);
      setAsociadas(prev => new Set(prev).add(campanaId));
      toast.success('Cliente asociado a la campaña');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.errors?.cliente_id?.[0];
      if (msg?.includes('ya')) {
        setAsociadas(prev => new Set(prev).add(campanaId));
        toast.info('El cliente ya estaba en esta campaña');
      } else {
        toast.error(msg ?? 'Error al asociar');
      }
    } finally {
      setSaving(null);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100">
              <Dialog.Panel className="relative w-full max-w-md transform rounded-2xl bg-white border border-slate-200 shadow-2xl transition-all">

                <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-100">
                      <Megaphone className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div>
                      <Dialog.Title className="text-base font-semibold text-slate-900">Asociar a Campaña</Dialog.Title>
                      <p className="text-xs text-slate-500 mt-0.5">{clienteNombre}</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
                    </div>
                  ) : campanas.length === 0 ? (
                    <p className="text-sm text-center text-slate-500 py-8">No hay campañas activas en este momento</p>
                  ) : campanas.map(c => {
                    const yaAsociado = asociadas.has(c.id);
                    return (
                      <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{c.nombre}</p>
                          <p className="text-xs text-slate-500">{c.fecha_inicio} → {c.fecha_fin}</p>
                        </div>
                        <button
                          onClick={() => !yaAsociado && handleAgregar(c.id)}
                          disabled={saving === c.id || yaAsociado}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
                            yaAsociado
                              ? 'bg-emerald-100 text-emerald-700 cursor-default'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60'
                          }`}
                        >
                          {saving === c.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : yaAsociado
                            ? <><Check className="w-3.5 h-3.5" /> Asociado</>
                            : 'Agregar'
                          }
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
                  <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 transition-colors">
                    Cerrar
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
