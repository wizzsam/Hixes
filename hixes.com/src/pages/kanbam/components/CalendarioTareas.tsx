import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput, EventClickArg } from '@fullcalendar/core';
import { fetchTodasLasTareas, completarTarea, type Tarea } from '../services/tareaService';
import CrearTareaModal from './CrearTareaModal';

// ─── Colores por estado ────────────────────────────────────────────────────────

function colorTarea(t: Tarea): string {
  if (t.estado === 'completada') return '#374752';
  const vence = new Date(t.fecha_vencimiento);
  if (vence < new Date()) return '#ef4444'; // vencida
  return '#00A884'; // pendiente normal
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CalendarioTareas() {
  const [tareas, setTareas]                   = useState<Tarea[]>([]);
  const [selected, setSelected]               = useState<Tarea | null>(null);
  const [modalOpoId, setModalOpoId]           = useState<number | null>(null);
  const [loading, setLoading]                 = useState(true);
  const calendarRef                           = useRef<FullCalendar>(null);

  async function cargar() {
    setLoading(true);
    try {
      const data = await fetchTodasLasTareas();
      setTareas(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  const events: EventInput[] = tareas.map(t => ({
    id:              String(t.id),
    title:           t.titulo,
    start:           t.fecha_vencimiento,
    backgroundColor: colorTarea(t),
    borderColor:     colorTarea(t),
    extendedProps:   t,
  }));

  function handleEventClick(info: EventClickArg) {
    setSelected(info.event.extendedProps as Tarea);
  }

  async function handleCompletar(id: number) {
    await completarTarea(id);
    setSelected(null);
    cargar();
  }

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-[#e9edef] p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold m-0">Calendario de actividades</h2>
          <p className="text-sm text-[#8696A0] mt-1">
            {tareas.filter(t => t.estado === 'pendiente').length} tareas pendientes
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#8696A0]">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-[#00A884]" /> Pendiente
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-[#ef4444]" /> Vencida
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-[#374752]" /> Completada
          </span>
        </div>
      </div>

      {/* Calendario */}
      <div className="flex-1 min-h-0 rounded-xl overflow-hidden calendar-dark">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[#8696A0]">Cargando…</div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="es"
            headerToolbar={{
              left:   'prev,next today',
              center: 'title',
              right:  'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            buttonText={{
              today: 'Hoy',
              month: 'Mes',
              week:  'Semana',
              day:   'Día',
            }}
            events={events}
            eventClick={handleEventClick}
            height="100%"
            eventDisplay="block"
            dayMaxEvents={3}
          />
        )}
      </div>

      {/* Panel de detalle de tarea */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div className="bg-[#202c33] rounded-xl p-7 w-full max-w-sm shadow-2xl text-[#e9edef]">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-base leading-tight pr-4">{selected.titulo}</h3>
              <button
                className="text-[#8696A0] hover:text-white transition-colors"
                onClick={() => setSelected(null)}
              >✕</button>
            </div>

            {selected.descripcion && (
              <p className="text-sm text-[#8696A0] mb-4">{selected.descripcion}</p>
            )}

            <div className="flex flex-col gap-2 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-[#8696A0]">Estado</span>
                <span className={selected.estado === 'completada' ? 'text-[#8696A0]' : 'text-[#00A884] font-semibold'}>
                  {selected.estado === 'completada' ? 'Completada' : 'Pendiente'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8696A0]">Vence</span>
                <span>{new Date(selected.fecha_vencimiento).toLocaleString('es-PE')}</span>
              </div>
              {selected.asignado && (
                <div className="flex justify-between">
                  <span className="text-[#8696A0]">Asignado a</span>
                  <span>{selected.asignado.nombre_completo}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {selected.estado === 'pendiente' && (
                <button
                  className="flex-1 bg-[#00A884] hover:bg-[#02c89d] text-white rounded-lg py-2 text-sm font-semibold transition-colors"
                  onClick={() => handleCompletar(selected.id)}
                >
                  Marcar completada
                </button>
              )}
              {selected.oportunidad_id && (
                <button
                  className="flex-1 bg-[#2a3942] hover:bg-[#374752] text-[#e9edef] rounded-lg py-2 text-sm transition-colors"
                  onClick={() => {
                    setSelected(null);
                    setModalOpoId(selected.oportunidad_id);
                  }}
                >
                  + Otra tarea
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva tarea desde calendario */}
      {modalOpoId !== null && (
        <CrearTareaModal
          oportunidadId={modalOpoId}
          onClose={() => setModalOpoId(null)}
          onCreated={() => { setModalOpoId(null); cargar(); }}
        />
      )}
    </div>
  );
}
