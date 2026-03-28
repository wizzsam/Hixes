import { useState, Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Save, Loader2, ShieldCheck, Info } from 'lucide-react'
import { toast } from 'sonner'
import { actualizarRol } from '../services/actualizarRol'
import type { RolInput } from './crearRolModal'

interface EditarRolModalProps {
  isOpen: boolean;
  onClose: () => void;
  rolData: RolInput | null;
  onRolEditada: () => void;
}

export default function EditarRolModal({ isOpen, onClose, rolData, onRolEditada }: EditarRolModalProps) {
  const [formData, setFormData] = useState<RolInput>({
    nombre_rol: '',
    descripcion: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (rolData && isOpen) {
        setFormData({
            id: rolData.id,
            nombre_rol: rolData.nombre_rol || '',
            descripcion: rolData.descripcion || '',
        });
    } else {
        setFormData({ nombre_rol: '', descripcion: '' });
    }
  }, [rolData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre_rol || !formData.descripcion) {
        toast.error('Por favor, completa todos los campos obligatorios (*)');
        return;
    }

    if (!formData.id) return;

    setIsLoading(true);

    try {
      const dataToUpdate = {
        nombre_rol: formData.nombre_rol,
        descripcion: formData.descripcion,
      };

      const rolActualizado = await actualizarRol(formData.id, dataToUpdate);

      if (rolActualizado) {
        onRolEditada(); 
        toast.success('¡Rol actualizado con éxito!');
        handleClose();
      } else {
        toast.error('No se pudo actualizar el rol.');
      }
    } catch (err: any) {
      console.error('Error al editar rol:', err);
      toast.error(err.message || 'Ocurrió un error inesperado al guardar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
                        <div className="p-2.5 rounded-xl bg-indigo-100">
                            <ShieldCheck className="w-6 h-6 text-indigo-700" />
                        </div>
                        <div>
                            <Dialog.Title as="h3" className="text-xl font-bold text-slate-950">
                                Editar Rol
                            </Dialog.Title>
                            <p className="mt-1 text-sm text-slate-600">
                                Modifica los datos del rol seleccionado.
                            </p>
                        </div>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 transition-colors rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      onClick={handleClose}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-8 space-y-6 bg-white">
                    
                    <div>
                        <label htmlFor="nombre_rol" className="block text-sm font-medium text-slate-700">
                            Nombre del Rol <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nombre_rol"
                            id="nombre_rol"
                            value={formData.nombre_rol}
                            onChange={handleInputChange}
                            required
                            placeholder="Ej: GERENTE_VENTAS"
                            className="w-full px-4 py-2.5 mt-1.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-colors uppercase"
                        />
                    </div>

                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700">
                            Descripción <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1.5">
                            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                <Info className="w-5 h-5 text-slate-400" />
                            </div>
                            <textarea
                                name="descripcion"
                                id="descripcion"
                                rows={3}
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                required
                                placeholder="Ej: Administra los usuarios y sedes de su propia empresa."
                                className="w-full pl-10 px-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-colors resize-none"
                            />
                        </div>
                    </div>

                  </div>

                  <div className="px-6 py-4 border-t bg-slate-50 border-slate-200">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        className="px-5 py-2.5 text-sm font-semibold transition-colors rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-100"
                        onClick={handleClose}
                        disabled={isLoading}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex items-center px-5 py-2.5 space-x-2 text-sm font-semibold text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={isLoading}
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
