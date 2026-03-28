import { useState, Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, MapPin, Save, Loader2, Building } from 'lucide-react'
import { toast } from 'sonner'
import { actualizarSede } from '../services/actualizarSedes'
import { useEmpresas } from '../../empresaAdmin/hooks/useEmpresas'
import type { SedeInput } from './crearSedeModal'

interface EditarSedeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sedeData: SedeInput | null;
  onSedeEditada: () => void;
}

export default function EditarSedeModal({ isOpen, onClose, sedeData, onSedeEditada }: EditarSedeModalProps) {
  const [formData, setFormData] = useState<SedeInput>({
    empresa_id: 0,
    nombre_sede: '',
    direccion_sede: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const { empresas, fetchEmpresas } = useEmpresas();

  // Load companies
  useEffect(() => {
    if (isOpen && empresas.length === 0) {
      fetchEmpresas();
    }
  }, [isOpen, empresas.length, fetchEmpresas]);

  useEffect(() => {
    if (sedeData && isOpen) {
        setFormData({
            id: sedeData.id,
            empresa_id: sedeData.empresa_id,
            nombre_sede: sedeData.nombre_sede || '',
            direccion_sede: sedeData.direccion_sede || '',
            fecha_creacion: sedeData.fecha_creacion,
        });
    } else {
        setFormData({ empresa_id: 0, nombre_sede: '', direccion_sede: '' });
    }
  }, [sedeData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'empresa_id' ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre_sede || !formData.direccion_sede || !formData.empresa_id) {
        toast.error('Por favor, completa todos los campos obligatorios (*)');
        return;
    }

    if (!formData.id) return;

    setIsLoading(true);

    try {
      const sedeEditada = await actualizarSede(formData.id, {
        empresa_id: formData.empresa_id,
        nombre_sede: formData.nombre_sede,
        direccion_sede: formData.direccion_sede
      });

      if (sedeEditada) {
        onSedeEditada(); 
        toast.success('¡Sede actualizada con éxito!');
        onClose();
      } else {
        toast.error('No se pudo actualizar la sede.');
      }
    } catch (err: any) {
      console.error('Error al editar sede:', err);
      toast.error(err.message || 'Ocurrió un error inesperado al guardar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 transition-opacity bg-slate-900/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative overflow-hidden text-left transition-all transform bg-white border shadow-2xl rounded-2xl border-slate-200 sm:my-8 sm:w-full sm:max-w-xl">
                
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-emerald-100">
                            <MapPin className="w-6 h-6 text-emerald-700" />
                        </div>
                        <div>
                            <Dialog.Title as="h3" className="text-xl font-bold text-slate-950">
                                Editar Sede
                            </Dialog.Title>
                            <p className="mt-1 text-sm text-slate-600">
                                Modifica los datos del establecimiento seleccionado.
                            </p>
                        </div>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 transition-colors rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      onClick={onClose}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-8 space-y-6 bg-white">
                    
                    <div>
                        <label htmlFor="empresa_id" className="block text-sm font-medium text-slate-700">
                            Empresa Asociada <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1.5">
                            <div className="absolute inset-y-0 flex items-center pointer-events-none left-3">
                                <Building className="w-5 h-5 text-slate-400" />
                            </div>
                            <select
                                name="empresa_id"
                                id="empresa_id"
                                value={formData.empresa_id}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2.5 pl-10 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-colors bg-white appearance-none"
                            >
                                {empresas.length === 0 && <option value={0}>Cargando empresas...</option>}
                                {empresas.map(empresa => (
                                    <option key={empresa.id} value={empresa.id}>{empresa.razon_social}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="nombre_sede" className="block text-sm font-medium text-slate-700">
                            Nombre de la Sede <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nombre_sede"
                            id="nombre_sede"
                            value={formData.nombre_sede}
                            onChange={handleInputChange}
                            required
                            placeholder="Ej: Sucursal Centro Sur"
                            className="w-full px-4 py-2.5 mt-1.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label htmlFor="direccion_sede" className="block text-sm font-medium text-slate-700">
                            Dirección completa <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="direccion_sede"
                            id="direccion_sede"
                            value={formData.direccion_sede}
                            onChange={handleInputChange}
                            required
                            placeholder="Ej: Av. Principal 1234, Ciudad"
                            className="w-full px-4 py-2.5 mt-1.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-colors"
                        />
                    </div>

                  </div>

                  <div className="px-6 py-4 border-t bg-slate-50 border-slate-200">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        className="px-5 py-2.5 text-sm font-semibold transition-colors rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-100"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex items-center px-5 py-2.5 space-x-2 text-sm font-semibold text-white transition-colors bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={isLoading || formData.empresa_id === 0}
                      >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Guardar Cambios</span>
                            </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
