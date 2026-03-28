import { useState, Fragment, useMemo, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Save, Loader2, Award, Percent, Search, Building2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useEmpresas } from '../../empresaAdmin/hooks/useEmpresas'
import { actualizarNivel } from '../services/actualizarNiveles'

export interface NivelEditInput {
  id: number;
  nombre: string;
  cashback_porcentaje: number;
  vigencia_dias: number;
  consumo_minimo: number;
  empresa_ids: number[]; 
}

interface EditarNivelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNivelEditado: () => void;
  nivelData: NivelEditInput | null;
}

export default function EditarNivelModal({ isOpen, onClose, onNivelEditado, nivelData }: EditarNivelModalProps) {
  const [formData, setFormData] = useState<NivelEditInput>({
    id: 0,
    nombre: '',
    cashback_porcentaje: 0,
    vigencia_dias: 30,
    consumo_minimo: 0,
    empresa_ids: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { empresas, fetchEmpresas } = useEmpresas();

  useEffect(() => {
    if (nivelData) {
      // Limpiamos cualquier dato extra que traiga el objeto para enviar solo lo necesario
      setFormData({
        id: nivelData.id,
        nombre: nivelData.nombre,
        cashback_porcentaje: nivelData.cashback_porcentaje,
        vigencia_dias: nivelData.vigencia_dias,
        consumo_minimo: nivelData.consumo_minimo,
        empresa_ids: nivelData.empresa_ids || [],
      });
    }
  }, [nivelData]);

  useEffect(() => {
    if (isOpen && empresas.length === 0) fetchEmpresas();
  }, [isOpen, empresas.length, fetchEmpresas]);

  const filteredEmpresas = useMemo(() => {
    return empresas.filter(emp => 
      emp.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.ruc.includes(searchTerm)
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
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || formData.empresa_ids.length === 0) {
      toast.error('El nivel debe tener un nombre y al menos una empresa asociada');
      return;
    }

    setIsLoading(true);
    try {
      // Aseguramos que los números sean enviados como tales
      const payload = {
        ...formData,
        cashback_porcentaje: Number(formData.cashback_porcentaje),
        vigencia_dias: Number(formData.vigencia_dias),
        consumo_minimo: Number(formData.consumo_minimo),
      };

      const result = await actualizarNivel(formData.id, payload);
      
      if (result) {
        toast.success('Configuración de nivel actualizada correctamente');
        onNivelEditado(); 
        handleClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el nivel');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* ... Resto del componente UI se mantiene igual ... */}
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
                      <div className="p-2.5 rounded-xl bg-indigo-100">
                        <Award className="w-6 h-6 text-indigo-700" />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-xl font-bold text-slate-950">
                          Editar Nivel: {formData.nombre}
                        </Dialog.Title>
                        <p className="text-sm text-slate-500">Ajusta los beneficios y las empresas vinculadas.</p>
                      </div>
                    </div>
                    <button onClick={handleClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X size={20}/></button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Nivel</label>
                        <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-2 mt-1.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">% Cashback</label>
                          <div className="relative mt-1">
                            <input type="number" step="0.01" value={formData.cashback_porcentaje} onChange={(e) => setFormData({...formData, cashback_porcentaje: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg border-slate-300 pl-8" />
                            <Percent className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Vigencia (Días)</label>
                          <input type="number" value={formData.vigencia_dias} onChange={(e) => setFormData({...formData, vigencia_dias: Number(e.target.value)})} className="w-full px-4 py-2 mt-1 border rounded-lg border-slate-300" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Consumo Mínimo (S/)</label>
                        <input type="number" step="0.01" value={formData.consumo_minimo} onChange={(e) => setFormData({...formData, consumo_minimo: Number(e.target.value)})} className="w-full px-4 py-2 mt-1.5 border rounded-lg border-slate-300" />
                      </div>
                    </div>

                    <div className="flex flex-col border border-slate-200 rounded-xl bg-slate-50/50 p-4">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-xs font-bold text-slate-700 uppercase">Empresas con este nivel:</span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">{formData.empresa_ids.length}</span>
                      </div>
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg outline-none" />
                      </div>
                      <div className="flex-1 max-h-[160px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {filteredEmpresas.map(emp => (
                          <div 
                            key={emp.id} 
                            onClick={() => handleEmpresaToggle(emp.id)} 
                            className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                              formData.empresa_ids.includes(emp.id) ? 'bg-white border-indigo-500 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/60 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Building2 size={14} className={formData.empresa_ids.includes(emp.id) ? 'text-indigo-600' : 'text-slate-400'} />
                              <span className="text-[11px] font-medium text-slate-700">{emp.razon_social}</span>
                            </div>
                            {formData.empresa_ids.includes(emp.id) && <CheckCircle2 size={14} className="text-indigo-600" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end items-center gap-3">
                    <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Cancelar</button>
                    <button type="submit" disabled={isLoading} className="flex items-center px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-all disabled:opacity-50">
                      {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                      Actualizar Nivel
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