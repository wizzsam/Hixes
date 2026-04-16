import { useState, type CSSProperties, type FormEvent } from 'react';
import { X, CalendarClock } from 'lucide-react';
import { createTarea, type NuevaTarea, type Tarea } from '../services/tareaService';

interface Props {
  oportunidadId: number;
  onClose: () => void;
  onCreated: (t: Tarea) => void;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const overlay: CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.65)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1100,
};

const card: CSSProperties = {
  background: '#202c33',
  borderRadius: 12,
  padding: '28px 32px',
  width: '100%',
  maxWidth: 460,
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  color: '#e9edef',
};

const header: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginBottom: 24,
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: '#8696A0',
  marginBottom: 4,
};

function inputStyle(disabled = false): CSSProperties {
  return {
    background: disabled ? '#1a2229' : '#2a3942',
    border: '1px solid #3a4f5a',
    borderRadius: 8,
    color: '#e9edef',
    fontSize: 14,
    padding: '8px 12px',
    width: '100%',
    boxSizing: 'border-box',
    opacity: disabled ? 0.6 : 1,
  };
}

const submitBtn: CSSProperties = {
  background: '#00A884',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 0',
  width: '100%',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  marginTop: 8,
};

// ─── Opciones de aviso ────────────────────────────────────────────────────────

const OPCIONES_AVISO = [
  { label: '15 minutos antes', value: 15 },
  { label: '30 minutos antes', value: 30 },
  { label: '1 hora antes',     value: 60 },
  { label: '2 horas antes',    value: 120 },
  { label: '1 día antes',      value: 1440 },
] as const;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CrearTareaModal({ oportunidadId, onClose, onCreated }: Props) {
  const [titulo, setTitulo]               = useState('');
  const [descripcion, setDescripcion]     = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [minutosAviso, setMinutosAviso]   = useState<number>(60);
  // Asignar automáticamente al usuario autenticado
  const currentUserId: number | null = (() => {
    try { return JSON.parse(localStorage.getItem('userData') ?? '{}')?.id_usuario ?? null; }
    catch { return null; }
  })();
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!titulo.trim()) { setError('El título es requerido.'); return; }
    if (!fechaVencimiento) { setError('La fecha de vencimiento es requerida.'); return; }

    const payload: NuevaTarea = {
      titulo:             titulo.trim(),
      descripcion:        descripcion.trim() || undefined,
      fecha_vencimiento:  fechaVencimiento,
      minutos_aviso:      minutosAviso,
      oportunidad_id:     oportunidadId,
      asignado_a:         currentUserId,
    };

    setLoading(true);
    try {
      const tarea = await createTarea(payload);
      onCreated(tarea);
      onClose();
    } catch {
      setError('Error al crear la tarea. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={card}>
        {/* Header */}
        <div style={header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CalendarClock size={20} color="#00A884" />
            <span style={{ fontSize: 17, fontWeight: 700 }}>Nueva tarea</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696A0' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Título */}
          <div>
            <label style={labelStyle}>Título *</label>
            <input
              style={inputStyle()}
              placeholder="Ej: Llamada de seguimiento"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              maxLength={255}
            />
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea
              style={{ ...inputStyle(), resize: 'vertical', minHeight: 70 }}
              placeholder="Detalles opcionales de la tarea..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
            />
          </div>

          {/* Fecha de vencimiento */}
          <div>
            <label style={labelStyle}>Fecha y hora de vencimiento *</label>
            <input
              type="datetime-local"
              style={inputStyle()}
              value={fechaVencimiento}
              onChange={e => setFechaVencimiento(e.target.value)}
            />
          </div>

          {/* Aviso */}
          <div>
            <label style={labelStyle}>Recordarme</label>
            <select
              style={inputStyle()}
              value={minutosAviso}
              onChange={e => setMinutosAviso(Number(e.target.value))}
            >
              {OPCIONES_AVISO.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>
          )}

          <button type="submit" style={submitBtn} disabled={loading}>
            {loading ? 'Guardando…' : 'Crear tarea'}
          </button>
        </form>
      </div>
    </div>
  );
}
