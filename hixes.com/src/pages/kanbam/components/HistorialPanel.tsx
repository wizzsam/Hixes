import { useEffect, useState } from 'react';
import { X, ArrowRight, FileText, FileImage } from 'lucide-react';
import { fetchHistorial, type HistorialEntry } from '../services/oportunidadService';

const ACCION_LABEL: Record<HistorialEntry['accion'], string> = {
  creacion:      'Creación',
  cambio_etapa:  'Cambio de etapa',
  cambio_estado: 'Cierre',
};

const ACCION_COLOR: Record<HistorialEntry['accion'], string> = {
  creacion:      '#4fc3f7',
  cambio_etapa:  '#ffb74d',
  cambio_estado: '#81c784',
};

export default function HistorialPanel({
  oportunidadId,
  titulo,
  onClose,
}: {
  oportunidadId: number;
  titulo: string;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<HistorialEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistorial(oportunidadId)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [oportunidadId]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        display: 'flex', justifyContent: 'flex-end',
      }}
    >
      {/* backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      {/* panel */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          width: 360, height: '100%',
          background: '#1a2530',
          borderLeft: '1px solid #2a3942',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #2a3942',
        }}>
          <div>
            <p style={{ fontSize: 11, color: '#8696A0', margin: 0 }}>Trazabilidad</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#e9edef', margin: '2px 0 0' }}>
              {titulo}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696A0' }}>
            <X size={20} />
          </button>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {loading ? (
            <p style={{ color: '#8696A0', textAlign: 'center', marginTop: 40 }}>Cargando…</p>
          ) : entries.length === 0 ? (
            <p style={{ color: '#8696A0', textAlign: 'center', marginTop: 40 }}>Sin historial aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {entries.map(e => (
                <div key={e.id} style={{
                  background: '#202c33', borderRadius: 8,
                  padding: '12px 14px', borderLeft: `3px solid ${ACCION_COLOR[e.accion]}`,
                }}>
                  {/* acción + fecha */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: ACCION_COLOR[e.accion],
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {ACCION_LABEL[e.accion]}
                    </span>
                    <span style={{ fontSize: 11, color: '#556268' }}>
                      {new Date(e.created_at).toLocaleString('es-PE', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* etapa/estado anterior → nuevo */}
                  {(e.etapa_anterior || e.etapa_nueva) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#e9edef' }}>
                      <span style={{ color: '#8696A0' }}>{e.etapa_anterior ?? '—'}</span>
                      <ArrowRight size={13} color="#ffb74d" />
                      <span>{e.etapa_nueva ?? '—'}</span>
                    </div>
                  )}
                  {(e.estado_anterior || e.estado_nuevo) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#e9edef' }}>
                      <span style={{ color: '#8696A0' }}>{e.estado_anterior ?? '—'}</span>
                      <ArrowRight size={13} color="#81c784" />
                      <span>{e.estado_nuevo ?? '—'}</span>
                    </div>
                  )}

                  {/* usuario */}
                  {e.usuario && (
                    <p style={{ fontSize: 12, color: '#8696A0', margin: '6px 0 0' }}>
                      👤 {e.usuario.nombre_completo}
                    </p>
                  )}

                  {/* notas */}
                  {e.notas && (
                    <div style={{
                      marginTop: 8, fontSize: 12, color: '#cbd5e1',
                      background: '#1a2530', borderRadius: 6,
                      padding: '7px 10px', lineHeight: 1.55,
                    }}>
                      {e.notas.split('\n').map((line, i) =>
                        line.startsWith('http') ? (
                          <a key={i} href={line} target="_blank" rel="noopener noreferrer"
                            style={{ color: '#00A884', wordBreak: 'break-all', display: 'block' }}>
                            🔗 {line}
                          </a>
                        ) : (
                          <span key={i} style={{ display: 'block' }}>{line}</span>
                        )
                      )}
                    </div>
                  )}

                  {/* archivos adjuntos */}
                  {e.archivos && e.archivos.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {e.archivos.map((a, i) => {
                        const isPdf = a.nombre.toLowerCase().endsWith('.pdf');
                        return isPdf ? (
                          <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              background: '#1a2530', borderRadius: 6,
                              padding: '4px 8px', fontSize: 11,
                              color: '#f87171', textDecoration: 'none',
                              border: '1px solid #374752',
                            }}>
                            <FileText size={12} />
                            <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {a.nombre}
                            </span>
                          </a>
                        ) : (
                          <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                            style={{ border: '1px solid #374752', borderRadius: 6, overflow: 'hidden', display: 'block', position: 'relative' }}>
                            <img src={a.url} alt={a.nombre}
                              style={{ width: 80, height: 60, objectFit: 'cover', display: 'block' }} />
                            <div style={{
                              position: 'absolute', bottom: 0, left: 0, right: 0,
                              background: 'rgba(0,0,0,0.55)', display: 'flex',
                              alignItems: 'center', justifyContent: 'center', padding: 2,
                            }}>
                              <FileImage size={10} color="#e9edef" />
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
