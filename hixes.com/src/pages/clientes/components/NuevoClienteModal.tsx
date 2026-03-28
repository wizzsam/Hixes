import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, User, CreditCard, Phone, Mail, Save, Loader2 } from 'lucide-react';

interface NuevoClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClienteCreado: (data: { nombre_completo: string; dni: string; telefono: string; correo?: string }) => Promise<any>;
}

interface ClienteForm {
  nombre_completo: string;
  dni: string;
  telefono: string;
  correo: string;
}

export default function NuevoClienteModal({ isOpen, onClose, onClienteCreado }: NuevoClienteModalProps) {
  const [form, setForm] = useState<ClienteForm>({ nombre_completo: '', dni: '', telefono: '', correo: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ClienteForm>>({});

  const validate = (): boolean => {
    const newErrors: Partial<ClienteForm> = {};
    if (!form.nombre_completo.trim()) newErrors.nombre_completo = 'El nombre es obligatorio.';
    if (!/^\d{8}$/.test(form.dni)) newErrors.dni = 'El DNI debe tener exactamente 8 dígitos.';
    if (!/^\d{9}$/.test(form.telefono)) newErrors.telefono = 'El teléfono debe tener exactamente 9 dígitos.';
    if (form.correo && !/^[^\s@]+@gmail\.com$/i.test(form.correo)) newErrors.correo = 'Ingresa un correo Gmail válido (@gmail.com).';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ClienteForm]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleClose = () => {
    setForm({ nombre_completo: '', dni: '', telefono: '', correo: '' });
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await onClienteCreado({
        nombre_completo: form.nombre_completo.trim(),
        dni: form.dni,
        telefono: form.telefono,
        correo: form.correo.trim() || undefined,
      });
      handleClose();
    } catch {
      // el error ya fue notificado por el hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
                  <Dialog.Title className="text-lg font-bold text-slate-900">Nuevo Cliente</Dialog.Title>
                  <button onClick={handleClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <input type="text" name="nombre_completo" value={form.nombre_completo} onChange={handleChange}
                        placeholder="Ej. María García Lopez"
                        className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${errors.nombre_completo ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                      />
                    </div>
                    {errors.nombre_completo && <p className="mt-1 text-xs text-red-500">{errors.nombre_completo}</p>}
                  </div>

                  {/* DNI */}
                  <div>
                    <label className="block text-sm font-medium text-blue-600 mb-1.5">DNI</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                      </div>
                      <input type="text" name="dni" value={form.dni} onChange={handleChange}
                        maxLength={8} placeholder="12345678"
                        className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${errors.dni ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                      />
                    </div>
                    {errors.dni ? <p className="mt-1 text-xs text-red-500">{errors.dni}</p> : <p className="mt-1 text-xs text-slate-400">8 dígitos</p>}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-blue-600 mb-1.5">Teléfono</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Phone className="w-4 h-4 text-slate-400" />
                      </div>
                      <input type="text" name="telefono" value={form.telefono} onChange={handleChange}
                        maxLength={9} placeholder="987654321"
                        className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${errors.telefono ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                      />
                    </div>
                    {errors.telefono ? <p className="mt-1 text-xs text-red-500">{errors.telefono}</p> : <p className="mt-1 text-xs text-slate-400">9 dígitos, sin espacios</p>}
                  </div>

                  {/* Correo Gmail (opcional) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Correo Gmail <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Mail className="w-4 h-4 text-slate-400" />
                      </div>
                      <input type="text" name="correo" value={form.correo} onChange={handleChange}
                        placeholder="ejemplo@gmail.com"
                        className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${errors.correo ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                      />
                    </div>
                    {errors.correo ? <p className="mt-1 text-xs text-red-500">{errors.correo}</p> : <p className="mt-1 text-xs text-slate-400">Solo cuentas @gmail.com</p>}
                  </div>

                  {/* Footer */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button type="button" onClick={handleClose} disabled={isLoading}
                      className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={isLoading}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm shadow-blue-600/20">
                      {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Guardando...</span></> : <><Save className="w-4 h-4" /><span>Registrar Cliente</span></>}
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
