import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Calendar, Users, ChevronRight, Loader2, Inbox } from 'lucide-react';
import { campanaWorkerService } from '../services/campanaWorkerService';
import type { Campana } from '../../admin/features/campanasAdmin/schemas/campana.interface';

const FRECUENCIA_LABEL: Record<string, string> = {
  una_vez:   'Una sola vez',
  semanal:   'Semanal',
  quincenal: 'Quincenal',
};

export default function CampanasListPage() {
  const navigate = useNavigate();
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campanaWorkerService.obtenerActivas()
      .then(setCampanas)
      .catch(() => setCampanas([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', background: '#111b21' }}>
        <Loader2 style={{ width: 36, height: 36, color: '#00A884', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', background: '#111b21', color: '#e9edef', fontFamily: 'inherit', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ background: '#2a3942', borderRadius: 10, padding: 10 }}>
          <Megaphone style={{ width: 22, height: 22, color: '#00A884' }} />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#e9edef' }}>Campañas Activas</h1>
          <p style={{ fontSize: 13, color: '#8696a0', margin: 0 }}>Selecciona una campaña para ver su kanban</p>
        </div>
      </div>

      {campanas.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 80, color: '#8696a0' }}>
          <Inbox style={{ width: 48, height: 48 }} />
          <p style={{ fontSize: 14 }}>No hay campañas activas en este momento</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {campanas.map(c => (
            <button
              key={c.id}
              onClick={() => navigate(`/trabajador/campanas/${c.id}`)}
              style={{
                background: '#202c33',
                border: '1px solid #2a3942',
                borderRadius: 12,
                padding: '18px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s, border-color 0.15s',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = '#263640';
                (e.currentTarget as HTMLElement).style.borderColor = '#00A884';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = '#202c33';
                (e.currentTarget as HTMLElement).style.borderColor = '#2a3942';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#e9edef', margin: 0 }}>{c.nombre}</p>
                  {c.descripcion && (
                    <p style={{ fontSize: 12, color: '#8696a0', margin: '4px 0 0', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {c.descripcion}
                    </p>
                  )}
                </div>
                <ChevronRight style={{ width: 18, height: 18, color: '#8696a0', flexShrink: 0, marginTop: 2 }} />
              </div>

              {/* Etapas */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {c.etapas.map(e => (
                  <span key={e.id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: '#2a3942', borderRadius: 99, padding: '2px 8px', fontSize: 11, color: '#aebac1',
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
                    {e.nombre}
                    <span style={{ color: '#8696a0' }}>({e.total})</span>
                  </span>
                ))}
              </div>

              {/* Metadata */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#8696a0' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar style={{ width: 13, height: 13 }} />
                  {c.fecha_inicio} → {c.fecha_fin}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users style={{ width: 13, height: 13 }} />
                  {c.total_clientes} cliente{c.total_clientes !== 1 ? 's' : ''}
                </span>
              </div>

              {c.frecuencia_recordatorio && (
                <span style={{
                  alignSelf: 'flex-start', background: '#1f3229', color: '#00A884',
                  borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600,
                }}>
                  🔔 {FRECUENCIA_LABEL[c.frecuencia_recordatorio]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
