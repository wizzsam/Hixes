import { useState, Fragment, useMemo, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Save, Loader2, Wallet, Percent, Search, Building2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useEmpresas } from '../../empresaAdmin/hooks/useEmpresas'
import { crearBono } from '../services/crearBono'
import type { BonoWalletFormInput } from '../schemas/bono.interface'

interface CrearBonoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBonoCreado: () => void;
}

export default function CrearBonoModal({ isOpen, onClose, onBonoCreado }: CrearBonoModalProps) {
  // Estado inicial del formulario alineado con el Schema
  const [formData, setFormData] = useState<BonoWalletFormInput>({
    monto_minimo: 0,
    monto_maximo: null,
    bono_porcentaje: 0,
    empresa_ids: [], // Backend espera empresa_ids (sin la 's' extra)
  });

  const [beneficioTag, setBeneficioTag] = useState(""); // Etiqueta visual opcional
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { empresas, fetchEmpresas } = useEmpresas();

  useEffect(() => {
    if (isOpen && empresas.length === 0) fetchEmpresas();
  }, [isOpen, empresas.length, fetchEmpresas]);

  // Buscador de empresas
  const filteredEmpresas = useMemo(() => {
    return empresas.filter(emp => 
      emp.razon_social.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [empresas, searchTerm]);

  const handleEmpresaToggle = (id: number) => {
    setFormData(prev => ({
      ...prev,
      empresa_ids: prev.empresa_ids.includes(id)
        ? prev.empresa_ids.filter(empId => empId !== id)
        : [...prev.empresa_ids, id]
    }));
  };

  const handleClose = () => {
    setSearchTerm("");
    setFormData({ monto_minimo: 0, monto_maximo: null, bono_porcentaje: 0, empresa_ids: [] });
    setBeneficioTag("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones preventivas
    if (formData.empresa_ids.length === 0) {
      toast.error('Debes seleccionar al menos una empresa');
      return;
    }

    if (formData.monto_maximo !== null && formData.monto_maximo !== undefined && formData.monto_maximo <= formData.monto_minimo) {
    toast.error('El monto máximo debe ser mayor al mínimo');
    return;
}

    setIsLoading(true);

    try {
      // Aseguramos que los valores sean numéricos para el JSON
      const dataToSubmit: BonoWalletFormInput = {
        monto_minimo: Number(formData.monto_minimo),
        monto_maximo: formData.monto_maximo ? Number(formData.monto_maximo) : null,
        bono_porcentaje: Number(formData.bono_porcentaje),
        empresa_ids: formData.empresa_ids
      };

      const result = await crearBono(dataToSubmit);

      if (result) {
        toast.success('Escala de bono creada correctamente');
        onBonoCreado(); // Refresca la tabla en el componente padre
        handleClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el bono');
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
                      <div className="p-2.5 rounded-xl bg-emerald-100">
                        <Wallet className="w-6 h-6 text-emerald-700" />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-xl font-bold text-slate-950">Nueva Escala de Bono Wallet</Dialog.Title>
                        <p className="text-sm text-slate-500">Define el % de regalo por recargas en HEXIS</p>
                      </div>
                    </div>
                    <button onClick={handleClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X size={20}/></button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
                    
                    {/* Lado Izquierdo: Configuración */}
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Etiqueta (Opcional)</label>
                        <input type="text" placeholder="Ej: Rango Plata" value={beneficioTag} onChange={(e) => setBeneficioTag(e.target.value)} className="w-full px-4 py-2 mt-1.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Mínimo (S/)</label>
                          <input type="number" step="0.01" required value={formData.monto_minimo} onChange={(e) => setFormData({...formData, monto_minimo: Number(e.target.value)})} className="w-full px-4 py-2 mt-1 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Máximo (S/)</label>
                          <input type="number" step="0.01" placeholder="Sin límite" value={formData.monto_maximo || ''} onChange={(e) => setFormData({...formData, monto_maximo: e.target.value ? Number(e.target.value) : null})} className="w-full px-4 py-2 mt-1 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">% Bono Adicional</label>
                        <div className="relative mt-1">
                          <input type="number" step="0.01" required value={formData.bono_porcentaje} onChange={(e) => setFormData({...formData, bono_porcentaje: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 pl-10 outline-none" />
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Lado Derecho: Empresas */}
                    <div className="flex flex-col border border-slate-200 rounded-xl bg-slate-50/50 p-4">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-xs font-bold text-slate-700 uppercase">Asociar a Sedes:</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">{formData.empresa_ids.length} selec.</span>
                      </div>

                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input type="text" placeholder="Filtrar sede..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="flex-1 max-h-[160px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {filteredEmpresas.map(emp => (
                          <div 
                            key={emp.id} 
                            onClick={() => handleEmpresaToggle(emp.id)} 
                            className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                              formData.empresa_ids.includes(emp.id) 
                                ? 'bg-white border-emerald-500 shadow-sm' 
                                : 'bg-transparent border-transparent hover:bg-white/60 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Building2 size={14} className={formData.empresa_ids.includes(emp.id) ? 'text-emerald-600' : 'text-slate-400'} />
                              <span className="text-[11px] font-medium text-slate-700">{emp.razon_social}</span>
                            </div>
                            {formData.empresa_ids.includes(emp.id) && <CheckCircle2 size={14} className="text-emerald-600" />}
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
                      className="flex items-center px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-all disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                      Guardar Escala
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