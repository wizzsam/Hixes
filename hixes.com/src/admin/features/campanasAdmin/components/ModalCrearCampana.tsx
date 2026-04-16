import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Save, Loader2, Megaphone, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { campanaService } from '../services/campanaService';
import type { CampanaForm } from '../schemas/campana.interface';
import { useEmpresas } from '../../empresaAdmin/hooks/useEmpresas';

interface EtapaInicial {
  nombre: string;
  color: string;
}

const FRECUENCIAS = [
  { value: 'una_vez',   label: 'Una sola vez' },
  { value: 'semanal',   label: 'Semanal (cada 7 días)' },
  { value: 'quincenal', label: 'Quincenal (cada 15 días)' },
];

const DEFAULT_ETAPAS: EtapaInicial[] = [
  { nombre: 'Interesado',  color: '#3b82f6' },
  { nombre: 'En proceso',  color: '#f59e0b' },
  { nombre: 'Convertido',  color: '#10b981' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreada: () => void;
}

export default function ModalCrearCampana({ isOpen, onClose, onCreada }: Props) {
  const hoy = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState<CampanaForm>({
    empresa_id: '',
    nombre: '',
    descripcion: '',
    fecha_inicio: hoy,
    fecha_fin: '',
    mensaje_recordatorio: '',
    frecuencia_recordatorio: '',
    activo: true,
  });
  const [etapas, setEtapas] = useState<EtapaInicial[]>(DEFAULT_ETAPAS);
  const [loading, setLoading] = useState(false);
  const { empresas, fetchEmpresas } = useEmpresas();

  useEffect(() => {
    if (isOpen && empresas.length === 0) fetchEmpresas();
  }, [isOpen, empresas.length, fetchEmpresas]);

  const handleClose = () => {
    setForm({ empresa_id: '', nombre: '', descripcion: '', fecha_inicio: hoy, fecha_fin: '', mensaje_recordatorio: '', frecuencia_recordatorio: '', activo: true });
    setEtapas(DEFAULT_ETAPAS);
    onClose();
  };

  const addEtapa = () => setEtapas(prev => [...prev, { nombre: '', color: '#64748b' }]);

  const removeEtapa = (i: number) => setEtapas(prev => prev.filter((_, idx) => idx !== i));

  const updateEtapa = (i: number, field: keyof EtapaInicial, value: string) => {
    setEtapas(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.empresa_id) { toast.error('Selecciona una empresa'); return; }
    if (!form.nombre.trim()) { toast.error('El nombre es requerido'); return; }
    if (!form.fecha_fin) { toast.error('La fecha de fin es requerida'); return; }
    if (etapas.some(e => !e.nombre.trim())) { toast.error('Todos los nombres de etapa son requeridos'); return; }

    setLoading(true);
    try {
      await campanaService.crear({ ...form, etapas } as any);
      toast.success('Campaña creada exitosamente');
      onCreada();
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al crear la campaña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100">
              <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xl transition-all">

                {/* Header */}
                <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-100">
                      <Megaphone className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-slate-900">Nueva Campaña</Dialog.Title>
                      <p className="text-xs text-slate-500 mt-0.5">Configura la campaña y sus etapas kanban</p>
                    </div>
                  </div>
                  <button onClick={handleClose} className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

                  {/* Empresa */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Empresa *</label>
                    <select
                      value={form.empresa_id}
                      onChange={e => setForm(prev => ({ ...prev, empresa_id: e.target.value ? Number(e.target.value) : '' }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Seleccionar empresa...</option>
                      {empresas.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.razon_social}</option>
                      ))}
                    </select>
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre de la campaña *</label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Ej: Campaña Verano 2025"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
                    <textarea
                      value={form.descripcion}
                      onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                      rows={2}
                      placeholder="Breve descripción de la campaña..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* Fechas */}
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

                  {/* Mensaje y Frecuencia */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Mensaje de recordatorio</label>
                    <textarea
                      value={form.mensaje_recordatorio}
                      onChange={e => setForm(prev => ({ ...prev, mensaje_recordatorio: e.target.value }))}
                      rows={3}
                      placeholder="Ej: Hola {nombre}, te recordamos que nuestra campaña {campana} sigue activa. ¡Visítanos!"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                    <p className="mt-1 text-xs text-slate-500">Variables disponibles: <code className="bg-slate-100 px-1 rounded">{'{nombre}'}</code>, <code className="bg-slate-100 px-1 rounded">{'{campana}'}</code></p>
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

                  {/* Etapas del Kanban */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700">Etapas del Kanban *</label>
                      <button type="button" onClick={addEtapa} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Agregar etapa
                      </button>
                    </div>
                    <div className="space-y-2">
                      {etapas.map((etapa, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="color"
                            value={etapa.color}
                            onChange={e => updateEtapa(i, 'color', e.target.value)}
                            className="w-9 h-9 rounded cursor-pointer border border-slate-300 p-0.5"
                          />
                          <input
                            type="text"
                            value={etapa.nombre}
                            onChange={e => updateEtapa(i, 'nombre', e.target.value)}
                            placeholder={`Etapa ${i + 1}`}
                            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          {etapas.length > 1 && (
                            <button type="button" onClick={() => removeEtapa(i)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activo */}
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

                  {/* Footer */}
                  <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
                    <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors">
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-[#132436] text-white text-sm rounded-lg hover:bg-[#224666] transition-colors disabled:opacity-60"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Crear Campaña
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
