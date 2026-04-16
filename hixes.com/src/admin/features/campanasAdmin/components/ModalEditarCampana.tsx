import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Save, Loader2, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { campanaService } from '../services/campanaService';
import type { Campana, CampanaForm } from '../schemas/campana.interface';

const FRECUENCIAS = [
  { value: 'una_vez',   label: 'Una sola vez' },
  { value: 'semanal',   label: 'Semanal (cada 7 días)' },
  { value: 'quincenal', label: 'Quincenal (cada 15 días)' },
];

interface Props {
  isOpen: boolean;
  campana: Campana | null;
  onClose: () => void;
  onEditada: () => void;
}

export default function ModalEditarCampana({ isOpen, campana, onClose, onEditada }: Props) {
  const [form, setForm] = useState<Omit<CampanaForm, 'empresa_id'>>({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    mensaje_recordatorio: '',
    frecuencia_recordatorio: '',
    activo: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (campana) {
      setForm({
        nombre: campana.nombre,
        descripcion: campana.descripcion ?? '',
        fecha_inicio: campana.fecha_inicio,
        fecha_fin: campana.fecha_fin,
        mensaje_recordatorio: campana.mensaje_recordatorio ?? '',
        frecuencia_recordatorio: campana.frecuencia_recordatorio ?? '',
        activo: campana.activo,
      });
    }
  }, [campana]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campana) return;
    if (!form.nombre.trim()) { toast.error('El nombre es requerido'); return; }
    if (!form.fecha_fin) { toast.error('La fecha de fin es requerida'); return; }

    setLoading(true);
    try {
      await campanaService.actualizar(campana.id, form);
      toast.success('Campaña actualizada');
      onEditada();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al actualizar');
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
              <Dialog.Panel className="relative w-full max-w-xl transform overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xl transition-all">

                <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-100">
                      <Megaphone className="w-5 h-5 text-indigo-700" />
                    </div>
                    <Dialog.Title className="text-lg font-semibold text-slate-900">Editar Campaña</Dialog.Title>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre *</label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
                    <textarea
                      value={form.descripcion}
                      onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                      rows={2}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha inicio *</label>
                      <input
                        type="date"
                        value={form.fecha_inicio}
                        onChange={e => setForm(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha fin *</label>
                      <input
                        type="date"
                        value={form.fecha_fin}
                        min={form.fecha_inicio}
                        onChange={e => setForm(prev => ({ ...prev, fecha_fin: e.target.value }))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Mensaje de recordatorio</label>
                    <textarea
                      value={form.mensaje_recordatorio}
                      onChange={e => setForm(prev => ({ ...prev, mensaje_recordatorio: e.target.value }))}
                      rows={3}
                      placeholder="Variables: {nombre}, {campana}"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Frecuencia de envío</label>
                    <select
                      value={form.frecuencia_recordatorio}
                      onChange={e => setForm(prev => ({ ...prev, frecuencia_recordatorio: e.target.value as any }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Sin recordatorios automáticos</option>
                      {FRECUENCIAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.activo}
                        onChange={e => setForm(prev => ({ ...prev, activo: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                    <span className="text-sm text-slate-700">Campaña activa</span>
                  </div>

                  <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors">
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-[#132436] text-white text-sm rounded-lg hover:bg-[#224666] transition-colors disabled:opacity-60"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
