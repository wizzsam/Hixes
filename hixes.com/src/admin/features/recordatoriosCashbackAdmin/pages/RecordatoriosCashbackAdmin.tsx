import { useEffect, useState } from 'react';
import { Bell, Edit, Plus, Trash2, Loader2, MessageSquare, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRecordatorios } from '../hooks/useRecordatorios';
import { recordatoriosService } from '../services/recordatoriosService';
import ModalCrearRecordatorio from '../components/ModalCrearRecordatorio';
import ModalEditarRecordatorio from '../components/ModalEditarRecordatorio';
import type { RecordatorioCashback } from '../schemas/recordatorio.interface';

const CANAL_BADGE: Record<string, string> = {
  whatsapp: 'bg-green-100 text-green-700',
};

const TIPO_SALDO_BADGE: Record<string, { label: string; cls: string }> = {
  cashback: { label: 'Cashback',          cls: 'bg-amber-100 text-amber-700' },
  wallet:   { label: 'Wallet',            cls: 'bg-blue-100 text-blue-700'  },
  ambos:    { label: 'Cashback + Wallet', cls: 'bg-purple-100 text-purple-700' },
};

export default function RecordatoriosCashbackAdmin() {
  const { recordatorios, loading, refetch } = useRecordatorios();
  const [isCrearOpen, setIsCrearOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [selected, setSelected] = useState<RecordatorioCashback | null>(null);

  useEffect(() => { refetch(); }, [refetch]);

  const handleToggle = async (id: number) => {
    try {
      await recordatoriosService.toggleActivo(id);
      refetch();
    } catch {
      toast.error('Error al cambiar el estado');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este recordatorio? Los clientes ya no recibirán este aviso.')) return;
    try {
      await recordatoriosService.eliminar(id);
      toast.success('Recordatorio eliminado');
      refetch();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleEdit = (rec: RecordatorioCashback) => {
    setSelected(rec);
    setIsEditarOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border shadow-sm rounded-xl border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <Bell className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recordatorios de Cashback</h1>
                <p className="mt-1 text-slate-600">El sistema enviará automáticamente el aviso al cliente cuando su cashback o wallet esté por vencer</p>
              </div>
            </div>
            <button
              onClick={() => setIsCrearOpen(true)}
              className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-[#132436] rounded-lg shadow-sm hover:bg-[#224666]"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Recordatorio</span>
            </button>
          </div>
        </div>

        {/* Info box */}
        <div className="px-6 py-4 bg-amber-50/60 border-b border-amber-100">
          <div className="flex gap-2 text-sm text-amber-800">
            <Bell className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <strong>¿Cómo funciona?</strong> Cada día a las 9:00 AM el sistema revisa qué clientes tienen cashback o wallet por vencer
              en el número de días configurado y les envía el mensaje automáticamente por WhatsApp.
              Puedes usar las variables <code className="font-mono bg-amber-100 px-1 rounded">{'{nombre}'}</code>,{' '}
              <code className="font-mono bg-amber-100 px-1 rounded">{'{monto}'}</code>,{' '}
              <code className="font-mono bg-amber-100 px-1 rounded">{'{vence}'}</code> y{' '}
              <code className="font-mono bg-amber-100 px-1 rounded">{'{dias}'}</code> en el mensaje.
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : recordatorios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
            <Bell className="w-10 h-10" />
            <p className="text-sm">No hay recordatorios configurados aún</p>
            <button
              onClick={() => setIsCrearOpen(true)}
              className="mt-2 text-sm text-amber-600 hover:underline"
            >
              Crear el primero
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-slate-50 border-slate-200 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left">Empresa</th>
                  <th className="px-6 py-4 text-left">Tipo</th>
                  <th className="px-6 py-4 text-left">Canal</th>
                  <th className="px-6 py-4 text-left">Anticipación</th>
                  <th className="px-6 py-4 text-left">Mensaje</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recordatorios.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-800">
                        {rec.empresa?.razon_social ?? `Empresa #${rec.empresa_id}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(() => { const t = TIPO_SALDO_BADGE[rec.tipo_saldo] ?? { label: rec.tipo_saldo, cls: 'bg-slate-100 text-slate-700' }; return <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${t.cls}`}>{t.label}</span>; })()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full capitalize ${CANAL_BADGE[rec.canal] ?? 'bg-slate-100 text-slate-700'}`}>
                        <MessageSquare className="w-3 h-3" />
                        {rec.canal}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {rec.dias_antes} día{rec.dias_antes !== 1 ? 's' : ''} antes
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-slate-600 truncate" title={rec.mensaje_plantilla}>
                        {rec.mensaje_plantilla}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggle(rec.id)}
                        title={rec.activo ? 'Desactivar' : 'Activar'}
                        className="inline-flex items-center gap-1.5 text-sm"
                      >
                        {rec.activo
                          ? <><ToggleRight className="w-6 h-6 text-amber-500" /><span className="text-amber-600 font-medium">Activo</span></>
                          : <><ToggleLeft className="w-6 h-6 text-slate-400" /><span className="text-slate-500">Inactivo</span></>
                        }
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(rec)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rec.id)}
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

      <ModalCrearRecordatorio
        isOpen={isCrearOpen}
        onClose={() => setIsCrearOpen(false)}
        onCreado={refetch}
      />

      <ModalEditarRecordatorio
        isOpen={isEditarOpen}
        recordatorio={selected}
        onClose={() => setIsEditarOpen(false)}
        onActualizado={refetch}
      />
    </div>
  );
}
