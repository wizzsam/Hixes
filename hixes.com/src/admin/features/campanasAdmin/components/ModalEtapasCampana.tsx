import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Plus, Trash2, Edit2, Save, Loader2, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { campanaService } from '../services/campanaService';
import type { Campana, CampanaEtapa } from '../schemas/campana.interface';

interface Props {
  isOpen: boolean;
  campana: Campana | null;
  onClose: () => void;
  onCambiada: () => void;
}

export default function ModalEtapasCampana({ isOpen, campana, onClose, onCambiada }: Props) {
  const [etapas, setEtapas] = useState<CampanaEtapa[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editColor, setEditColor] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoColor, setNuevoColor] = useState('#64748b');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && campana) {
      setEtapas(campana.etapas);
    }
  }, [isOpen, campana]);

  const startEdit = (etapa: CampanaEtapa) => {
    setEditingId(etapa.id);
    setEditNombre(etapa.nombre);
    setEditColor(etapa.color);
  };

  const saveEdit = async (etapaId: number) => {
    if (!campana || !editNombre.trim()) return;
    setLoading(true);
    try {
      await campanaService.actualizarEtapa(campana.id, etapaId, { nombre: editNombre, color: editColor });
      setEtapas(prev => prev.map(e => e.id === etapaId ? { ...e, nombre: editNombre, color: editColor } : e));
      setEditingId(null);
      onCambiada();
      toast.success('Etapa actualizada');
    } catch {
      toast.error('Error al actualizar etapa');
    } finally {
      setLoading(false);
    }
  };

  const deleteEtapa = async (etapaId: number) => {
    if (!campana) return;
    if (!window.confirm('¿Eliminar esta etapa? Los clientes en esta etapa quedarán sin etapa asignada.')) return;
    setLoading(true);
    try {
      await campanaService.eliminarEtapa(campana.id, etapaId);
      setEtapas(prev => prev.filter(e => e.id !== etapaId));
      onCambiada();
      toast.success('Etapa eliminada');
    } catch {
      toast.error('Error al eliminar etapa');
    } finally {
      setLoading(false);
    }
  };

  const addEtapa = async () => {
    if (!campana || !nuevoNombre.trim()) { toast.error('El nombre es requerido'); return; }
    setLoading(true);
    try {
      const nueva = await campanaService.crearEtapa(campana.id, { nombre: nuevoNombre, color: nuevoColor });
      setEtapas(prev => [...prev, nueva]);
      setNuevoNombre('');
      setNuevoColor('#64748b');
      onCambiada();
      toast.success('Etapa agregada');
    } catch {
      toast.error('Error al crear etapa');
    } finally {
      setLoading(false);
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
                    <div className="p-2.5 rounded-xl bg-violet-100">
                      <Layers className="w-5 h-5 text-violet-700" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-slate-900">Etapas del Kanban</Dialog.Title>
                      <p className="text-xs text-slate-500 mt-0.5">{campana?.nombre}</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                  {etapas.map(etapa => (
                    <div key={etapa.id} className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50">
                      {editingId === etapa.id ? (
                        <>
                          <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-slate-300 p-0.5" />
                          <input
                            type="text"
                            value={editNombre}
                            onChange={e => setEditNombre(e.target.value)}
                            className="flex-1 border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                          />
                          <button onClick={() => saveEdit(etapa.id)} disabled={loading} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: etapa.color }} />
                          <span className="flex-1 text-sm font-medium text-slate-700">{etapa.nombre}</span>
                          <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">{etapa.total}</span>
                          <button onClick={() => startEdit(etapa)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteEtapa(etapa.id)} disabled={loading} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Agregar nueva etapa */}
                  <div className="flex items-center gap-2 pt-2">
                    <input type="color" value={nuevoColor} onChange={e => setNuevoColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-slate-300 p-0.5" />
                    <input
                      type="text"
                      value={nuevoNombre}
                      onChange={e => setNuevoNombre(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addEtapa()}
                      placeholder="Nueva etapa..."
                      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <button onClick={addEtapa} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
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
