import { useState, Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Save, Loader2, User, Mail, Shield, Building, Lock, Search, Check } from 'lucide-react'
import { toast } from 'sonner'
import { actualizarUsuario } from '../services/actualizarUsuario'
import { obtenerSedesPorEmpresa } from '../services/obtenerSedesPorEmpresa'
import type { SedeSimple } from '../services/obtenerSedesPorEmpresa'
import { useEmpresas } from '../../empresaAdmin/hooks/useEmpresas'
import { useRoles } from '../hooks/useRoles'
import type { UsuarioInput } from './crearUsuarioModal'

interface EditarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioData: UsuarioInput | null;
  onUsuarioEditada: () => void;
}

export default function EditarUsuarioModal({ isOpen, onClose, usuarioData, onUsuarioEditada }: EditarUsuarioModalProps) {
  const [formData, setFormData] = useState<UsuarioInput>({
    nombre_completo: '',
    correo: '',
    password: '',
    rol_ids: [],
    empresa_id: null,
    sede_ids: [],
    estado: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [sedes, setSedes] = useState<SedeSimple[]>([]);
  const [loadingSedes, setLoadingSedes] = useState(false);
  const [busquedaSede, setBusquedaSede] = useState('');
  
  const { empresas, fetchEmpresas } = useEmpresas();
  const { roles, fetchRoles } = useRoles();

  useEffect(() => {
    if (isOpen) {
      if (empresas.length === 0) fetchEmpresas();
      if (roles.length === 0) fetchRoles();
    }
  }, [isOpen, empresas.length, roles.length, fetchEmpresas, fetchRoles]);

  useEffect(() => {
    if (usuarioData && isOpen) {
        setFormData({
            id_usuario: usuarioData.id_usuario,
            nombre_completo: usuarioData.nombre_completo || '',
            correo: usuarioData.correo || '',
            password: '',
            rol_ids: usuarioData.rol_ids ?? [],
            empresa_id: usuarioData.empresa_id,
            sede_ids: usuarioData.sede_ids ?? [],
            estado: usuarioData.estado ?? 1,
        });
    } else {
        setFormData({
            nombre_completo: '',
            correo: '',
            password: '',
            rol_ids: [],
            empresa_id: null,
            sede_ids: [],
            estado: 1,
        });
    }
  }, [usuarioData, isOpen]);

  useEffect(() => {
    const fetchSedesParaEmpresa = async () => {
      if (formData.empresa_id) {
        setLoadingSedes(true);
        const sedesData = await obtenerSedesPorEmpresa(formData.empresa_id);
        setSedes(sedesData);
        setLoadingSedes(false);
      } else {
        setSedes([]);
      }
    };

    if (isOpen) {
      fetchSedesParaEmpresa();
    }
  }, [formData.empresa_id, isOpen]);

  const toggleSede = (id: number) => {
    setFormData(prev => ({
      ...prev,
      sede_ids: prev.sede_ids.includes(id)
        ? prev.sede_ids.filter(s => s !== id)
        : [...prev.sede_ids, id],
    }));
  };

  const toggleRol = (id: number) => {
    setFormData(prev => ({
      ...prev,
      rol_ids: prev.rol_ids.includes(id)
        ? prev.rol_ids.filter(r => r !== id)
        : [...prev.rol_ids, id],
    }));
  };

  const sedesFiltradas = sedes.filter(s =>
    s.nombre_sede.toLowerCase().includes(busquedaSede.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'empresa_id') {
      setFormData(prev => ({
        ...prev,
        empresa_id: value === '' ? null : parseInt(value),
        sede_ids: [],
      }));
      setBusquedaSede('');
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === 'estado' ? parseInt(value) : value,
    }));
  };

  const handleClose = () => {
    onClose();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre_completo || !formData.correo || formData.rol_ids.length === 0) {
        toast.error('Por favor, completa todos los campos obligatorios (*)');
        return;
    }

    if (!formData.id_usuario) return;

    setIsLoading(true);

    try {
      const dataToUpdate: any = {
        nombre_completo: formData.nombre_completo,
        correo: formData.correo,
        rol_ids: formData.rol_ids,
        empresa_id: formData.empresa_id,
        sede_ids: formData.sede_ids,
      };

      if (formData.password) {
        dataToUpdate.password = formData.password;
      }

      const usuarioActualizado = await actualizarUsuario(formData.id_usuario, dataToUpdate);

      if (usuarioActualizado) {
        onUsuarioEditada(); 
        toast.success('¡Usuario actualizado con éxito!');
        handleClose();
      } else {
        toast.error('No se pudo actualizar el usuario.');
      }
    } catch (err: any) {
      console.error('Error al editar usuario:', err);
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
                        <div className="p-2.5 rounded-xl bg-orange-100">
                            <User className="w-6 h-6 text-orange-700" />
                        </div>
                        <div>
                            <Dialog.Title as="h3" className="text-xl font-bold text-slate-950">
                                Editar Usuario
                            </Dialog.Title>
                            <p className="mt-1 text-sm text-slate-600">
                                Modifica los datos del usuario seleccionado.
                            </p>
                        </div>
                    </div>
                    <button type="button" className="p-1.5 transition-colors rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100" onClick={handleClose}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-8 space-y-6 bg-white overflow-y-auto max-h-[60vh]">
                    
                    <div>
                        <label htmlFor="nombre_completo" className="block text-sm font-medium text-slate-700">
                            Nombre Completo <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1.5">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <User className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                name="nombre_completo"
                                id="nombre_completo"
                                value={formData.nombre_completo}
                                onChange={handleInputChange}
                                required
                                placeholder="Ej: Juan Pérez"
                                className="w-full pl-10 px-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="correo" className="block text-sm font-medium text-slate-700">
                            Correo Electrónico <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1.5">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Mail className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                name="correo"
                                id="correo"
                                value={formData.correo}
                                onChange={handleInputChange}
                                required
                                placeholder="Ej: juan.perez@empresa.com"
                                className="w-full pl-10 px-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                            Contraseña <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <div className="relative mt-1.5">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Lock className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Dejar en blanco para no cambiar"
                                className="w-full pl-10 px-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Rol(es) del Sistema <span className="text-red-500">*</span>
                            </label>
                            {roles.length === 0 ? (
                                <div className="flex items-center gap-2 h-10 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando roles...</div>
                            ) : (
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                    <div className="max-h-36 overflow-y-auto divide-y divide-slate-100">
                                        {roles.map(r => {
                                            const checked = formData.rol_ids.includes(r.id);
                                            return (
                                                <label key={r.id} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${checked ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                                        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                                    </div>
                                                    <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="text-sm text-slate-700">{r.nombre_rol}</span>
                                                    <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleRol(r.id)} />
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {formData.rol_ids.length > 0 && (
                                <p className="mt-1 text-xs text-indigo-600 font-medium">{formData.rol_ids.length} rol(es) seleccionado(s)</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="empresa_id" className="block text-sm font-medium text-slate-700">
                                Empresa Asociada
                            </label>
                            <div className="relative mt-1.5">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Building className="w-5 h-5 text-slate-400" />
                                </div>
                                <select
                                    name="empresa_id"
                                    id="empresa_id"
                                    value={formData.empresa_id === null ? "" : formData.empresa_id}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 px-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-colors bg-white appearance-none"
                                >
                                    <option value="">Ninguna (Sistema Global)</option>
                                    {empresas.map(e => (
                                        <option key={e.id} value={e.id}>{e.razon_social}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {formData.empresa_id !== null && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Sedes <span className="text-slate-400 font-normal">(selecciona las que apliquen)</span>
                                </label>
                                {loadingSedes ? (
                                    <div className="flex items-center gap-2 h-10 text-slate-400 text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Cargando sedes...
                                    </div>
                                ) : sedes.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic">No hay sedes registradas para esta empresa.</p>
                                ) : (
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                        <div className="relative border-b border-slate-200">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder="Buscar sede..."
                                                value={busquedaSede}
                                                onChange={e => setBusquedaSede(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:bg-orange-50"
                                            />
                                        </div>
                                        <div className="max-h-36 overflow-y-auto divide-y divide-slate-100">
                                            {sedesFiltradas.length === 0 ? (
                                                <p className="px-4 py-3 text-sm text-slate-400 italic">Sin resultados.</p>
                                            ) : sedesFiltradas.map(s => {
                                                const checked = formData.sede_ids.includes(s.id);
                                                return (
                                                    <label
                                                        key={s.id}
                                                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${checked ? 'bg-orange-50' : 'hover:bg-slate-50'}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-orange-500 border-orange-500' : 'border-slate-300'}`}>
                                                            {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                                        </div>
                                                        <span className="text-sm text-slate-700">{s.nombre_sede}</span>
                                                        <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleSede(s.id)} />
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {formData.sede_ids.length > 0 && (
                                    <p className="mt-1 text-xs text-orange-600 font-medium">{formData.sede_ids.length} sede(s) seleccionada(s)</p>
                                )}
                            </div>
                        )}
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
                        className="flex items-center px-5 py-2.5 space-x-2 text-sm font-semibold text-white transition-colors bg-orange-600 rounded-lg shadow-sm hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed"
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
