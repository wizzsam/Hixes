import { useState, Fragment, useMemo, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Save, Loader2, Wallet, Percent, Search, Building2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useEmpresas } from '../../empresaAdmin/hooks/useEmpresas'
import { actualizarBono } from '../services/actualizarBono' // Importamos el servicio real
import type { BonoWalletEditInput } from '../schemas/bono.interface'

interface EditarBonoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBonoEditado: () => void;
  bonoData: BonoWalletEditInput | null;
}

export default function EditarBonoModal({ isOpen, onClose, onBonoEditado, bonoData }: EditarBonoModalProps) {
  const [formData, setFormData] = useState<BonoWalletEditInput>({
    id: 0,
    monto_minimo: 0,
    monto_maximo: null,
    bono_porcentaje: 0,
    beneficio: '',
    empresas_ids: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { empresas, fetchEmpresas } = useEmpresas();

  // EFECTO DE PRECARGA: Sincroniza el estado local con el bono seleccionado
  useEffect(() => {
    if (bonoData) {
      setFormData(bonoData);
    }
  }, [bonoData]);

  useEffect(() => {
    if (isOpen && empresas.length === 0) fetchEmpresas();
  }, [isOpen, empresas.length, fetchEmpresas]);

  const filteredEmpresas = useMemo(() => {
    return empresas.filter(emp => 
      emp.razon_social.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [empresas, searchTerm]);

  const handleEmpresaToggle = (id: number) => {
    setFormData(prev => ({
      ...prev,
      empresas_ids: prev.empresas_ids.includes(id)
        ? prev.empresas_ids.filter(empId => empId !== id)
        : [...prev.empresas_ids, id]
    }));
  };

  const handleClose = () => {
    setSearchTerm("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones preventivas
    if (formData.empresas_ids.length === 0) {
      toast.error('El bono debe estar asociado al menos a una empresa');
      return;
    }

    // Solución al error de narrowing: verificamos null y undefined explícitamente
    if (formData.monto_maximo !== null && 
        formData.monto_maximo !== undefined && 
        formData.monto_maximo <= formData.monto_minimo) {
      toast.error('El monto máximo debe ser mayor al mínimo');
      return;
    }

    setIsLoading(true);

    try {
      // Preparamos el payload mapeando empresas_ids -> empresa_ids para Laravel
      const payload = {
        monto_minimo: Number(formData.monto_minimo),
        monto_maximo: formData.monto_maximo !== null ? Number(formData.monto_maximo) : null,
        bono_porcentaje: Number(formData.bono_porcentaje),
        empresa_ids: formData.empresas_ids // Mapeo a nombre esperado por DTO
      };

      const result = await actualizarBono(formData.id, payload);

      if (result) {
        toast.success('Configuración de bono actualizada correctamente');
        onBonoEditado(); // Refresca la tabla principal
        handleClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el bono');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 transition-opacity bg-slate-900/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100">
              <Dialog.Panel className="relative w-full max-w-2xl overflow-hidden text-left transition-all transform bg-white shadow-2xl rounded-2xl border border-slate-200">
                
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-blue-100">
                        <Wallet className="w-6 h-6 text-blue-700" />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-xl font-bold text-slate-950">Editar Escala de Bono</Dialog.Title>
                        <p className="text-sm text-slate-500">Modifica los rangos y sedes vinculadas para HEXIS.</p>
                      </div>
                    </div>
                    <button onClick={handleClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"><X size={20}/></button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Etiqueta del Beneficio</label>
                        <input type="text" required placeholder="Ej: Rango Oro" value={formData.beneficio} onChange={(e) => setFormData({...formData, beneficio: e.target.value})} className="w-full px-4 py-2 mt-1.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Mínimo (S/)</label>
                          <input type="number" step="0.01" value={formData.monto_minimo} onChange={(e) => setFormData({...formData, monto_minimo: Number(e.target.value)})} className="w-full px-4 py-2 mt-1 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Máximo (S/)</label>
                          <input type="number" step="0.01" placeholder="Sin límite" value={formData.monto_maximo || ''} onChange={(e) => setFormData({...formData, monto_maximo: e.target.value ? Number(e.target.value) : null})} className="w-full px-4 py-2 mt-1 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">% Bono Adicional</label>
                        <div className="relative mt-1">
                          <input type="number" step="0.01" value={formData.bono_porcentaje} onChange={(e) => setFormData({...formData, bono_porcentaje: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg border-slate-300 pl-10 focus:ring-2 focus:ring-blue-500 outline-none" />
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col border border-slate-200 rounded-xl bg-slate-50/50 p-4">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-xs font-bold text-slate-700 uppercase">Sedes con este beneficio:</span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{formData.empresas_ids.length} selec.</span>
                      </div>

                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input type="text" placeholder="Buscar sede..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>

                      <div className="flex-1 max-h-[160px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {filteredEmpresas.map(emp => (
                          <div 
                            key={emp.id} 
                            onClick={() => handleEmpresaToggle(emp.id)} 
                            className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                              formData.empresas_ids.includes(emp.id) 
                                ? 'bg-white border-blue-500 shadow-sm' 
                                : 'bg-transparent border-transparent hover:bg-white/60 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Building2 size={14} className={formData.empresas_ids.includes(emp.id) ? 'text-blue-600' : 'text-slate-400'} />
                              <span className="text-[11px] font-medium text-slate-700">{emp.razon_social}</span>
                            </div>
                            {formData.empresas_ids.includes(emp.id) && <CheckCircle2 size={14} className="text-blue-600" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end items-center gap-3">
                    <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Cancelar</button>
                    <button 
                      type="submit" 
                      disabled={isLoading} 
                      className="flex items-center px-6 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-all disabled:opacity-50 shadow-sm"
                    >
                      {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
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
  )
}