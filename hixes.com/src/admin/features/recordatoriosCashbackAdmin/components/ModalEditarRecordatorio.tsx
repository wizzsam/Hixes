import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Save, Loader2, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { recordatoriosService } from '../services/recordatoriosService';
import type { RecordatorioCashback, RecordatorioCashbackForm } from '../schemas/recordatorio.interface';
import { useEmpresas } from '../../empresaAdmin/hooks/useEmpresas';

interface Props {
  isOpen: boolean;
  recordatorio: RecordatorioCashback | null;
  onClose: () => void;
  onActualizado: () => void;
}

const CANALES = [{ value: 'whatsapp', label: 'WhatsApp' }];

const TIPOS_SALDO = [
  { value: 'cashback', label: 'Cashback' },
  { value: 'wallet',   label: 'Wallet' },
  { value: 'ambos',    label: 'Cashback y Wallet' },
];

const VARIABLES_DISPONIBLES = [
  { variable: '{nombre}', descripcion: 'Nombre completo del cliente' },
  { variable: '{monto}',  descripcion: 'Saldo disponible (S/X.XX)' },
  { variable: '{vence}',  descripcion: 'Fecha de vencimiento (DD/MM/AAAA)' },
  { variable: '{dias}',   descripcion: 'Días restantes para vencer' },
];

export default function ModalEditarRecordatorio({ isOpen, recordatorio, onClose, onActualizado }: Props) {
  const [form, setForm] = useState<RecordatorioCashbackForm>({
    empresa_id: '',
    tipo_saldo: 'cashback',
    canal: 'whatsapp',
    mensaje_plantilla: '',
    dias_antes: 2,
    activo: true,
  });
  const [loading, setLoading] = useState(false);
  const { empresas, fetchEmpresas } = useEmpresas();

  useEffect(() => {
    if (isOpen && empresas.length === 0) fetchEmpresas();
  }, [isOpen, empresas.length, fetchEmpresas]);

  useEffect(() => {
    if (recordatorio) {
      setForm({
        empresa_id: recordatorio.empresa_id,
        tipo_saldo: recordatorio.tipo_saldo ?? 'cashback',
        canal: recordatorio.canal,
        mensaje_plantilla: recordatorio.mensaje_plantilla,
        dias_antes: recordatorio.dias_antes,
        activo: recordatorio.activo,
      });
    }
  }, [recordatorio]);

  const insertarVariable = (variable: string) => {
    setForm(prev => ({ ...prev, mensaje_plantilla: prev.mensaje_plantilla + variable }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordatorio) return;
    if (!form.empresa_id) {
      toast.error('Selecciona una empresa');
      return;
    }
    if (!form.mensaje_plantilla.trim()) {
      toast.error('El mensaje no puede estar vacío');
      return;
    }
    setLoading(true);
    try {
      await recordatoriosService.actualizar(recordatorio.id, form);
      toast.success('Recordatorio actualizado');
      onActualizado();
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
          <div className="fixed inset-0 transition-opacity bg-slate-900/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100">
              <Dialog.Panel className="relative w-full max-w-xl text-left transition-all transform bg-white shadow-2xl rounded-2xl border border-slate-200">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-amber-100">
                        <Bell className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <Dialog.Title className="text-lg font-semibold text-slate-900">Editar Recordatorio</Dialog.Title>
                        <p className="text-sm text-slate-500">Modifica el mensaje o la configuración</p>
                      </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Empresa */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Empresa</label>
                    <select
                      value={form.empresa_id}
                      onChange={e => setForm(prev => ({ ...prev, empresa_id: Number(e.target.value) }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="">Selecciona una empresa...</option>
                      {empresas.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.razon_social}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo de saldo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de saldo a recordar</label>
                    <select
                      value={form.tipo_saldo}
                      onChange={e => setForm(prev => ({ ...prev, tipo_saldo: e.target.value as 'cashback' | 'wallet' | 'ambos' }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      {TIPOS_SALDO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  {/* Canal */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Canal de envío</label>
                    <select
                      value={form.canal}
                      onChange={e => setForm(prev => ({ ...prev, canal: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      {CANALES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>

                  {/* Días antes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Enviar con <span className="font-bold text-amber-600">{form.dias_antes}</span> día(s) de anticipación
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={form.dias_antes}
                      onChange={e => setForm(prev => ({ ...prev, dias_antes: Number(e.target.value) }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  {/* Variables disponibles */}
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Variables disponibles</p>
                    <div className="flex flex-wrap gap-2">
                      {VARIABLES_DISPONIBLES.map(v => (
                        <button
                          key={v.variable}
                          type="button"
                          title={v.descripcion}
                          onClick={() => insertarVariable(v.variable)}
                          className="px-2.5 py-1 text-xs font-mono bg-amber-50 border border-amber-200 text-amber-800 rounded-md hover:bg-amber-100 transition-colors"
                        >
                          {v.variable}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Mensaje</label>
                    <textarea
                      rows={5}
                      value={form.mensaje_plantilla}
                      onChange={e => setForm(prev => ({ ...prev, mensaje_plantilla: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                    />
                  </div>

                  {/* Activo */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, activo: !prev.activo }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.activo ? 'bg-amber-500' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.activo ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm text-slate-700">{form.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>

                  {/* Acciones */}
                  <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#132436] rounded-lg hover:bg-[#224666] disabled:opacity-60 transition-colors">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Guardar cambios
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
