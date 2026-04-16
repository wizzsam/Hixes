import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CalendarClock, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { fetchTodasLasTareas, completarTarea, type Tarea } from '../../pages/kanbam/services/tareaService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function estaEnVentanaAviso(t: Tarea): boolean {
  if (t.estado !== 'pendiente') return false;
  const ahora     = Date.now();
  const vence     = new Date(t.fecha_vencimiento).getTime();
  const inicioAviso = vence - t.minutos_aviso * 60_000;
  // Muestra si ya pasó la hora de aviso (aunque ya esté vencida y no completada)
  return inicioAviso <= ahora;
}

function etiquetaAviso(t: Tarea): { texto: string; vencida: boolean } {
  const ahora = Date.now();
  const vence = new Date(t.fecha_vencimiento).getTime();
  const diff  = vence - ahora;

  if (diff < 0) {
    const min = Math.round(Math.abs(diff) / 60_000);
    return { texto: `Venció hace ${min < 60 ? `${min} min` : `${Math.round(min / 60)} h`}`, vencida: true };
  }
  const min = Math.round(diff / 60_000);
  if (min < 60)  return { texto: `Vence en ${min} min`, vencida: false };
  const h = Math.round(min / 60);
  return { texto: `Vence en ${h} h`, vencida: false };
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// ─── Componente ───────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 60_000; // re-chequea cada minuto

export default function NotificacionesCampana() {
  const [tareas, setTareas]         = useState<Tarea[]>([]);
  const [abierto, setAbierto]       = useState(false);
  const [completing, setCompleting] = useState<number | null>(null);
  const panelRef                    = useRef<HTMLDivElement>(null);

  const cargar = useCallback(async () => {
    try {
      const data    = await fetchTodasLasTareas();
      const alertas = data.filter(estaEnVentanaAviso);
      setTareas(alertas);
    } catch {
      // silencioso: no queremos crashear el header
    }
  }, []);

  // Primer cargado + polling
  useEffect(() => {
    cargar();
    const id = setInterval(cargar, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [cargar]);

  // Cierra al hacer click fuera
  useEffect(() => {
    if (!abierto) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [abierto]);

  async function handleCompletar(id: number) {
    setCompleting(id);
    try {
      await completarTarea(id);
      setTareas(prev => prev.filter(t => t.id !== id));
    } finally {
      setCompleting(null);
    }
  }

  const count = tareas.length;

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Botón campana ── */}
      <button
        onClick={() => setAbierto(v => !v)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 transition-colors"
        title="Notificaciones de tareas"
      >
        <Bell className={`w-5 h-5 ${count > 0 ? 'text-amber-500' : 'text-slate-500'}`} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 pointer-events-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* ── Panel desplegable ── */}
      {abierto && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {/* Header del panel */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-slate-800 text-sm">Tareas por vencer</span>
            </div>
            <button onClick={() => setAbierto(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {tareas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
                <p className="text-sm font-medium">Sin alertas pendientes</p>
              </div>
            ) : (
              tareas.map(t => {
                const { texto, vencida } = etiquetaAviso(t);
                return (
                  <div key={t.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{t.titulo}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{formatFecha(t.fecha_vencimiento)}</p>
                        <span className={`inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          vencida
                            ? 'bg-red-100 text-red-600'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          <AlertTriangle className="w-3 h-3" />
                          {texto}
                        </span>
                      </div>
                      <button
                        disabled={completing === t.id}
                        onClick={() => handleCompletar(t.id)}
                        className="shrink-0 text-xs bg-slate-800 hover:bg-green-600 text-white px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
                      >
                        {completing === t.id ? '…' : 'Completar'}
                      </button>
                    </div>
                    {t.asignado && (
                      <p className="text-xs text-slate-400 mt-1">👤 {t.asignado.nombre_completo}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {tareas.length > 0 && (
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                {tareas.length} tarea{tareas.length !== 1 ? 's' : ''} requiere{tareas.length === 1 ? '' : 'n'} atención
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
