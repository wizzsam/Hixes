import { useState, Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Save, Loader2, Sparkles, Type, AlignLeft, Banknote } from 'lucide-react'
import { toast } from 'sonner'

// Servicios y Tipos
import { crearServicio } from '../services/crearServicio'
import { actualizarServicio } from '../services/actualizarServicio'
import type { ServicioHixes, ServicioFormInput } from '../schemas/servicio.interface'

interface ModalServicioHixesProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  servicioData?: ServicioHixes | null; // Si viene este dato, el modal entra en modo "Editar"
}

export default function ModalServicioHixes({ isOpen, onClose, onSuccess, servicioData }: ModalServicioHixesProps) {
  const isEditMode = !!servicioData;

  const [formData, setFormData] = useState<ServicioFormInput>({
    tratamiento: '',
    descripcion: '',
    precio_base: 0,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sincronizar datos cuando el modal se abre para editar
  useEffect(() => {
    if (servicioData && isOpen) {
      setFormData({
        tratamiento: servicioData.tratamiento,
        descripcion: servicioData.descripcion || '',
        precio_base: servicioData.precio_base,
      });
    } else if (!isOpen) {
      resetForm();
    }
  }, [servicioData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'precio_base' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
  };

  const resetForm = () => {
    setFormData({ tratamiento: '', descripcion: '', precio_base: 0 });
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.tratamiento.trim() || formData.precio_base <= 0) {
      toast.error('El nombre y un precio válido son obligatorios');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode && servicioData) {
        // LÓGICA DE ACTUALIZAR
        await actualizarServicio(servicioData.id, formData);
        toast.success('¡Tratamiento actualizado correctamente!');
      } else {
        // LÓGICA DE CREAR
        await crearServicio(formData);
        toast.success('¡Nuevo servicio añadido al catálogo!');
      }
      
      onSuccess(); // Refresca la tabla
      handleClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 transition-opacity bg-slate-900/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <Dialog.Panel className="relative overflow-hidden text-left transition-all transform bg-white border shadow-2xl rounded-2xl border-slate-200 sm:my-8 sm:w-full sm:max-w-lg">
                
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl ${isEditMode ? 'bg-amber-100' : 'bg-blue-100'}`}>
                        <Sparkles className={`w-6 h-6 ${isEditMode ? 'text-amber-700' : 'text-blue-700'}`} />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-xl font-bold text-slate-950">
                          {isEditMode ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
                        </Dialog.Title>
                        <p className="mt-1 text-sm text-slate-600">
                          {isEditMode ? 'Actualiza los detalles del servicio seleccionado.' : 'Añade un nuevo servicio al catálogo de bienestar.'}
                        </p>
                      </div>
                    </div>
                    <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" onClick={handleClose}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-8 space-y-6 bg-white">
                    <div>
                      <label htmlFor="tratamiento" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Type className="w-4 h-4 text-slate-400" /> Nombre del Tratamiento
                      </label>
                      <input
                        type="text"
                        name="tratamiento"
                        id="tratamiento"
                        value={formData.tratamiento}
                        onChange={handleInputChange}
                        required
                        placeholder="Ej: Ritual Sensaciones"
                        className="w-full px-4 py-2.5 mt-1.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="descripcion" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <AlignLeft className="w-4 h-4 text-slate-400" /> Descripción
                      </label>
                      <textarea
                        name="descripcion"
                        id="descripcion"
                        rows={3}
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        placeholder="Describe el servicio..."
                        className="w-full px-4 py-2.5 mt-1.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="precio_base" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Banknote className="w-4 h-4 text-slate-400" /> Precio Base (S/)
                      </label>
                      <div className="relative mt-1.5">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <span className="text-slate-500 sm:text-sm">S/</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          name="precio_base"
                          id="precio_base"
                          value={formData.precio_base || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t bg-slate-50 border-slate-200 flex justify-end space-x-3">
                    <button type="button" className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100" onClick={handleClose} disabled={isLoading}>
                      Cancelar
                    </button>
                    <button type="submit" className="flex items-center px-6 py-2.5 space-x-2 text-sm font-semibold text-white bg-[#132436] rounded-lg shadow-md hover:bg-[#224666] disabled:opacity-60" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>{isEditMode ? 'Actualizar' : 'Guardar'} Servicio</span>
                        </>
                      )}
                    </button>
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