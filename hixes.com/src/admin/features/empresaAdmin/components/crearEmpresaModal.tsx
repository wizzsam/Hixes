import { useState, Fragment, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Building2, Save, Loader2, Upload, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { crearEmpresa } from '../services/crearEmpresa'

// Definimos la estructura de los datos de la empresa para TypeScript
interface EmpresaInput {
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  direccion: string;
  telefono: string;
  estado: number; // 1 para Activo, 0 para Inactivo
  logo_path?: string;
}

// Definimos las propiedades que acepta el componente
interface CrearEmpresaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmpresaCreada: () => void; 
}

export default function CrearEmpresaModal({ isOpen, onClose, onEmpresaCreada }: CrearEmpresaModalProps) {
  // Estado para manejar los valores de los campos del formulario
  const [formData, setFormData] = useState<EmpresaInput>({
    ruc: '',
    razon_social: '',
    nombre_comercial: '',
    direccion: '',
    telefono: '',
    estado: 1, // Por defecto, la empresa se crea como activa
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para manejar la carga, errores y mensajes de éxito
  const [isLoading, setIsLoading] = useState(false);

  // Función para actualizar el estado del formulario cuando cambia un campo
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'estado' ? parseInt(value) : value, // Convertimos 'estado' a número
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El logo no debe superar los 5MB');
        return;
      }
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  // Función para resetear el formulario a sus valores iniciales
  const resetForm = () => {
    setFormData({
      ruc: '',
      razon_social: '',
      nombre_comercial: '',
      direccion: '',
      telefono: '',
      estado: 1,
    });
    setLogoFile(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Función para cerrar el modal y resetear el formulario
  const handleClose = () => {
    onClose();
    resetForm();
  };

  // Función para validar el RUC (básica: debe tener 11 dígitos numéricos)
  const validarRUC = (ruc: string) => {
    return /^\d{11}$/.test(ruc);
  };

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ruc || !formData.razon_social || !formData.direccion || !formData.telefono) {
        toast.error('Por favor, completa todos los campos obligatorios (*)');
        return;
    }

    if (!validarRUC(formData.ruc)) {
        toast.error('El RUC debe tener exactamente 11 dígitos numéricos.');
        return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('ruc', formData.ruc);
      submitData.append('razon_social', formData.razon_social);
      if (formData.nombre_comercial) submitData.append('nombre_comercial', formData.nombre_comercial);
      submitData.append('direccion', formData.direccion);
      submitData.append('telefono', formData.telefono);
      submitData.append('estado', Number(formData.estado) === 1 ? '1' : '0');
      
      if (logoFile) {
          submitData.append('logo', logoFile);
      }

      const response = await crearEmpresa(submitData as any);
      
      if (response.success) {
          toast.success('¡Empresa creada con éxito!');
          onEmpresaCreada();
          setTimeout(() => {
             handleClose();
          }, 300);
      } else {
          // Si el servidor envía errores de validación
          if (response.errors) {
              const errorMessages = Object.values(response.errors).flat().join('\n');
              toast.error(errorMessages || 'Error de validación en los campos');
          } else {
              toast.error(response.message || 'Error al crear la empresa.');
          }
      }

    } catch (err: any) {
      console.error('Error al crear la empresa:', err);
      toast.error(err.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Fondo oscuro detrás del modal */}
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
              {/* Contenedor principal del modal */}
              <Dialog.Panel className="relative overflow-hidden text-left transition-all transform bg-white border shadow-2xl rounded-2xl border-slate-200 sm:my-8 sm:w-full sm:max-w-2xl">
                
                {/* Cabecera del Modal */}
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-blue-100">
                            <Building2 className="w-6 h-6 text-blue-700" />
                        </div>
                        <div>
                            <Dialog.Title as="h3" className="text-xl font-bold text-slate-950">
                                Registrar Nueva Empresa
                            </Dialog.Title>
                            <p className="mt-1 text-sm text-slate-600">
                                Completa la información para dar de alta una nueva empresa cliente.
                            </p>
                        </div>
                    </div>
                    {/* Botón para cerrar (X) */}
                    <button
                      type="button"
                      className="p-1.5 transition-colors rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      onClick={handleClose}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-8 space-y-6 bg-white">
                    
                    {/* Sección: Identificación de la Empresa */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* RUC */}
                        <div>
                            <label htmlFor="ruc" className="block text-sm font-medium text-slate-700">
                                RUC <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="ruc"
                                id="ruc"
                                value={formData.ruc}
                                onChange={handleInputChange}
                                maxLength={11}
                                required
                                placeholder="Ej: 20123456789"
                                className="w-full px-4 py-2.5 mt-1.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        {/* Estado */}
                        <div>
                            <label htmlFor="estado" className="block text-sm font-medium text-slate-700">
                                Estado <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="estado"
                                id="estado"
                                value={formData.estado}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2.5 mt-1.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors bg-white"
                            >
                                <option value={1}>Activo</option>
                                <option value={0}>Inactivo</option>
                            </select>
                        </div>
                    </div>

                    {/* Razón Social */}
                    <div>
                        <label htmlFor="razon_social" className="block text-sm font-medium text-slate-700">
                            Razón Social <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="razon_social"
                            id="razon_social"
                            value={formData.razon_social}
                            onChange={handleInputChange}
                            required
                            placeholder="Ej: Hexis Soluciones Tecnológicas S.A.C."
                            className="w-full px-4 py-2.5 mt-1.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* Nombre Comercial (Opcional) */}
                    <div>
                        <label htmlFor="nombre_comercial" className="block text-sm font-medium text-slate-700">
                            Nombre Comercial
                        </label>
                        <input
                            type="text"
                            name="nombre_comercial"
                            id="nombre_comercial"
                            value={formData.nombre_comercial}
                            onChange={handleInputChange}
                            placeholder="Ej: Hexis"
                            className="w-full px-4 py-2.5 mt-1.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* Sección: Ubicación y Contacto */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Dirección */}
                        <div className="sm:col-span-2">
                            <label htmlFor="direccion" className="block text-sm font-medium text-slate-700">
                                Dirección <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="direccion"
                                id="direccion"
                                value={formData.direccion}
                                onChange={handleInputChange}
                                required
                                placeholder="Ej: Av. Pacífico 123, Nuevo Chimbote"
                                className="w-full px-4 py-2.5 mt-1.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        {/* Teléfono */}
                        <div>
                            <label htmlFor="telefono" className="block text-sm font-medium text-slate-700">
                                Teléfono <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                id="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                required
                                placeholder="Ej: 943123456"
                                className="w-full px-4 py-2.5 mt-1.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                    {/* Logo de la Empresa */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Logo de la Empresa (Opcional)
                        </label>
                        <div className="flex items-center space-x-6">
                            <div className="flex-shrink-0 h-24 w-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-slate-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleLogoChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Subir imagen
                                </button>
                                <p className="mt-2 text-xs text-slate-500">
                                    Formatos soportados: PNG, JPG, GIF. Máx 5MB.
                                </p>
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Acciones del Formulario (Botones) */}
                  <div className="px-6 py-4 border-t bg-slate-50 border-slate-200">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        className="px-5 py-2.5 text-sm font-semibold transition-colors rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 hover:border-slate-400"
                        onClick={handleClose}
                        disabled={isLoading} // Deshabilitar si está cargando
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex items-center px-5 py-2.5 space-x-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={isLoading} // Deshabilitar si está cargando
                      >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Crear Empresa</span>
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