import { useState, useEffect, useMemo, type CSSProperties, type FormEvent } from 'react';
import { X, Search } from 'lucide-react';
import { axiosWithoutMultipart } from '../../../api/axiosInstance';
import {
  createOportunidad,
  ETAPAS,
  type Etapa,
  type NuevaOportunidad,
  type Oportunidad,
  type ServicioItem,
} from '../services/oportunidadService';

interface ClienteItem {
  id: number;
  nombre_completo: string;
}

interface UserData {
  id_usuario: number;
  nombre_completo: string;
}

interface Props {
  onClose: () => void;
  onCreated: (o: Oportunidad) => void;
  clienteIdInicial?: number;
  clienteNombreInicial?: string;
  etapasNombres?: string[];
}

const overlay: CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.65)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};

const card: CSSProperties = {
  background: '#202c33',
  borderRadius: 12,
  padding: '28px 32px',
  width: '100%',
  maxWidth: 520,
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  color: '#e9edef',
};

const hdr: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginBottom: 24,
};

const lbl: CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: '#8696A0',
  marginBottom: 4,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const inp: CSSProperties = {
  width: '100%',
  background: '#2a3942',
  border: '1px solid #374752',
  borderRadius: 8,
  padding: '9px 12px',
  color: '#e9edef',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

const fg: CSSProperties = { marginBottom: 16 };

const sbtn: CSSProperties = {
  width: '100%',
  padding: '10px 0',
  background: '#00A884',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 8,
};

export default function ModalCrearOportunidad({
  onClose,
  onCreated,
  clienteIdInicial,
  clienteNombreInicial,
  etapasNombres,
}: Props) {
  const [clientes, setClientes] = useState<ClienteItem[]>([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState<ServicioItem[]>([]);
  const [busquedaServicio, setBusquedaServicio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [vendedor] = useState<UserData | null>(() => {
    try {
      const raw = localStorage.getItem('userData');
      return raw ? (JSON.parse(raw) as UserData) : null;
    } catch {
      return null;
    }
  });

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaProxima, setFechaProxima] = useState('');
  const [clienteId, setClienteId] = useState<number | ''>(clienteIdInicial ?? '');

  const [etapa, setEtapa] = useState<Etapa>('Nuevo lead');
  const [serviciosCantidades, setServiciosCantidades] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    const promises: Promise<void>[] = [
      axiosWithoutMultipart.get('/servicios').then(r => {
        const raw = r.data;
        const list: ServicioItem[] = Array.isArray(raw)
          ? raw
          : ((raw as { data?: ServicioItem[] })?.data ?? []);
        setServiciosDisponibles(
          list.filter(s => (s as ServicioItem & { estado?: boolean }).estado !== false)
        );
      }),
    ];
    if (!clienteIdInicial) {
      promises.push(
        axiosWithoutMultipart.get('/clientes').then(r => {
          const data = Array.isArray(r.data)
            ? r.data
            : ((r.data as { data?: ClienteItem[] })?.data ?? []);
          setClientes(data);
        })
      );
    }
    Promise.all(promises);
  }, [clienteIdInicial]);

  const serviciosFiltrados = useMemo(
    () => serviciosDisponibles.filter(s =>
      s.tratamiento.toLowerCase().includes(busquedaServicio.toLowerCase())
    ),
    [serviciosDisponibles, busquedaServicio]
  );

  const montoTotal = useMemo(
    () => serviciosDisponibles
      .filter(s => serviciosCantidades.has(s.id))
      .reduce((sum, s) => sum + Number(s.precio_base) * (serviciosCantidades.get(s.id) ?? 1), 0),
    [serviciosDisponibles, serviciosCantidades]
  );

  function toggleServicio(id: number) {
    setServiciosCantidades(prev => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, 1);
      return next;
    });
  }

  function setCantidad(id: number, delta: number) {
    setServiciosCantidades(prev => {
      const next = new Map(prev);
      const current = next.get(id) ?? 1;
      const nueva = current + delta;
      if (nueva <= 0) next.delete(id);
      else next.set(id, nueva);
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || clienteId === '') {
      setError('El título y el cliente son obligatorios.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: NuevaOportunidad = {
        cliente_id: clienteId as number,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        fecha_proxima: fechaProxima || undefined,
        etapa,
        valor_estimado: montoTotal,
        vendedor_id: vendedor?.id_usuario ?? null,
        servicios: serviciosCantidades.size > 0
          ? Array.from(serviciosCantidades.entries()).map(([id, cantidad]) => ({ id, cantidad }))
          : undefined,
      };
      const nueva = await createOportunidad(payload);
      onCreated(nueva);
      onClose();
    } catch {
      setError('Error al crear la oportunidad. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={e => e.stopPropagation()}>
        <div style={hdr}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>Nueva oportunidad</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696A0' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={fg}>
            <label style={lbl}>Título *</label>
            <input style={inp} value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej. Membresía anual Gold" required />
          </div>

          <div style={fg}>
            <label style={lbl}>Cliente *</label>
            {clienteIdInicial && clienteNombreInicial ? (
              <div style={{ ...inp, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#00A884' }}>✓</span>
                {clienteNombreInicial}
              </div>
            ) : (
              <select style={inp} value={clienteId} onChange={e => setClienteId(e.target.value !== '' ? Number(e.target.value) : '')} required>
                <option value="">Seleccionar cliente…</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre_completo}</option>)}
              </select>
            )}
          </div>

          {vendedor && (
            <div style={fg}>
              <label style={lbl}>Asignado a</label>
              <div style={{ ...inp, color: '#8696A0' }}>👤 {vendedor.nombre_completo}</div>
            </div>
          )}

          <div style={fg}>
            <label style={lbl}>Descripción</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 72 }} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Detalles adicionales sobre la oportunidad…" />
          </div>

          <div style={fg}>
            <label style={lbl}>Fecha próxima visita</label>
            <input type="datetime-local" style={{ ...inp, colorScheme: 'dark' }} value={fechaProxima} onChange={e => setFechaProxima(e.target.value)} />
          </div>

          <div style={{ ...fg, marginBottom: 16 }}>
            <label style={lbl}>Etapa inicial</label>
            <select style={inp} value={etapa} onChange={e => setEtapa(e.target.value as Etapa)}>
              {(etapasNombres && etapasNombres.length > 0 ? etapasNombres : [...ETAPAS]).map(et => <option key={et} value={et}>{et}</option>)}
            </select>
          </div>

          {serviciosDisponibles.length > 0 && (
            <div style={fg}>
              <label style={lbl}>Servicios</label>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2a3942', border: '1px solid #374752', borderBottom: '1px solid #2f3d46', borderRadius: '8px 8px 0 0', padding: '8px 12px' }}>
                <Search size={14} color="#8696A0" />
                <input type="text" placeholder="Buscar servicio..." value={busquedaServicio} onChange={e => setBusquedaServicio(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: '#e9edef', fontSize: 13, width: '100%' }} />
              </div>

              <div style={{ background: '#2a3942', border: '1px solid #374752', borderTop: 'none', borderBottom: 'none', maxHeight: 200, overflowY: 'auto' }}>
                {serviciosFiltrados.length === 0 ? (
                  <div style={{ padding: '12px 16px', fontSize: 13, color: '#8696A0', textAlign: 'center' }}>Sin resultados</div>
                ) : serviciosFiltrados.map((s, idx) => {
                  const cantidad = serviciosCantidades.get(s.id) ?? 0;
                  const sel = cantidad > 0;
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: sel ? '#00A88415' : idx % 2 === 0 ? 'transparent' : '#263238', borderBottom: idx < serviciosFiltrados.length - 1 ? '1px solid #374752' : 'none', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1 }} onClick={() => toggleServicio(s.id)}>
                        <div style={{ width: 16, height: 16, borderRadius: 3, border: `2px solid ${sel ? '#00A884' : '#8696A0'}`, background: sel ? '#00A884' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                          {sel && (
                            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                              <path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span style={{ fontSize: 13.5, color: sel ? '#e9edef' : '#aebac1' }}>{s.tratamiento}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {sel && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
                            <button type="button" onClick={() => setCantidad(s.id, -1)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #374752', background: '#1a2730', color: '#e9edef', cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                            <span style={{ minWidth: 18, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#00A884' }}>{cantidad}</span>
                            <button type="button" onClick={() => setCantidad(s.id, 1)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #374752', background: '#1a2730', color: '#e9edef', cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                          </div>
                        )}
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#00A884', minWidth: 60, textAlign: 'right' }}>S/{(Number(s.precio_base) * (sel ? cantidad : 1)).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: '#2a3942', border: '1px solid #374752', borderTop: '1px solid #374752', borderRadius: '0 0 8px 8px', padding: '10px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 11, color: '#8696A0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monto Total (S/)</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: montoTotal > 0 ? '#00A884' : '#8696A0' }}>{montoTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {error && <p style={{ color: '#f08080', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button type="submit" style={sbtn} disabled={loading}>
            {loading ? 'Creando…' : 'Crear oportunidad'}
          </button>
        </form>
      </div>
    </div>
  );
}