import { useEffect, useState } from 'react';
import { Megaphone, Plus, Edit, Trash2, Loader2, Layers, Calendar, Users, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCampanas } from '../hooks/useCampanas';
import { campanaService } from '../services/campanaService';
import ModalCrearCampana from '../components/ModalCrearCampana';
import ModalEditarCampana from '../components/ModalEditarCampana';
import ModalEtapasCampana from '../components/ModalEtapasCampana';
import type { Campana } from '../schemas/campana.interface';

const FRECUENCIA_LABEL: Record<string, string> = {
  una_vez:   'Una sola vez',
  semanal:   'Semanal',
  quincenal: 'Quincenal',
};

const FRECUENCIA_CLS: Record<string, string> = {
  una_vez:   'bg-blue-100 text-blue-700',
  semanal:   'bg-emerald-100 text-emerald-700',
  quincenal: 'bg-violet-100 text-violet-700',
};

export default function CampanasAdmin() {
  const { campanas, loading, refetch } = useCampanas();
  const [isCrearOpen, setIsCrearOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [isEtapasOpen, setIsEtapasOpen] = useState(false);
  const [selected, setSelected] = useState<Campana | null>(null);

  useEffect(() => { refetch(); }, [refetch]);

  const handleToggle = async (campana: Campana) => {
    try {
      await campanaService.actualizar(campana.id, { activo: !campana.activo });
      refetch();
    } catch {
      toast.error('Error al cambiar el estado');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta campaña? Se perderán todos los datos de clientes asociados.')) return;
    try {
      await campanaService.eliminar(id);
      toast.success('Campaña eliminada');
      refetch();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const openEditar = (c: Campana) => { setSelected(c); setIsEditarOpen(true); };
  const openEtapas = (c: Campana) => { setSelected(c); setIsEtapasOpen(true); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border shadow-sm rounded-xl border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <Megaphone className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campañas</h1>
                <p className="mt-1 text-slate-600">Gestiona campañas con su propio kanban y recordatorios automáticos</p>
              </div>
            </div>
            <button
              onClick={() => setIsCrearOpen(true)}
              className="flex items-center px-4 py-2 space-x-2 text-white bg-[#132436] rounded-lg shadow-sm hover:bg-[#224666] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Campaña</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-indigo-50/60 border-b border-indigo-100">
          <div className="flex gap-2 text-sm text-indigo-800">
            <Zap className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <strong>¿Cómo funciona?</strong> Cada campaña tiene su propio kanban con etapas personalizables. Los trabajadores
              pueden asociar clientes a una campaña y gestionarlos visualmente. El sistema envía recordatorios automáticos
              por WhatsApp según la frecuencia configurada mientras la campaña esté vigente.
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : campanas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
            <Megaphone className="w-10 h-10" />
            <p className="text-sm">No hay campañas creadas aún</p>
            <button onClick={() => setIsCrearOpen(true)} className="mt-2 text-sm text-indigo-600 hover:underline">
              Crear la primera
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-slate-50 border-slate-200 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left">Campaña</th>
                  <th className="px-6 py-4 text-left">Empresa</th>
                  <th className="px-6 py-4 text-left">Período</th>
                  <th className="px-6 py-4 text-left">Recordatorio</th>
                  <th className="px-6 py-4 text-center">Clientes</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campanas.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{c.nombre}</p>
                        {c.descripcion && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{c.descripcion}</p>}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {c.etapas.slice(0, 4).map(e => (
                            <span key={e.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                              {e.nombre}
                            </span>
                          ))}
                          {c.etapas.length > 4 && <span className="text-xs text-slate-400">+{c.etapas.length - 4}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {c.empresa_nombre ?? `#${c.empresa_id}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.fecha_inicio}</span>
                        <span className="text-slate-400">→</span>
                        <span>{c.fecha_fin}</span>
                      </div>
                      {c.vigente && (
                        <span className="mt-1 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                          Vigente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {c.frecuencia_recordatorio ? (
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${FRECUENCIA_CLS[c.frecuencia_recordatorio] ?? 'bg-slate-100 text-slate-600'}`}>
                          {FRECUENCIA_LABEL[c.frecuencia_recordatorio]}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Sin recordatorio</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
                        <Users className="w-4 h-4 text-slate-400" />
                        {c.total_clientes}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleToggle(c)} className="inline-flex items-center gap-1.5 text-sm">
                        {c.activo
                          ? <><ToggleRight className="w-6 h-6 text-indigo-500" /><span className="text-indigo-600 font-medium">Activa</span></>
                          : <><ToggleLeft className="w-6 h-6 text-slate-400" /><span className="text-slate-500">Inactiva</span></>
                        }
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEtapas(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          title="Gestionar etapas"
                        >
                          <Layers className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditar(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalCrearCampana isOpen={isCrearOpen} onClose={() => setIsCrearOpen(false)} onCreada={refetch} />
      <ModalEditarCampana isOpen={isEditarOpen} campana={selected} onClose={() => setIsEditarOpen(false)} onEditada={refetch} />
      <ModalEtapasCampana isOpen={isEtapasOpen} campana={selected} onClose={() => setIsEtapasOpen(false)} onCambiada={refetch} />
    </div>
  );
}
