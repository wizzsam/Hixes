import { useState, useEffect, useCallback, useMemo, useRef, type CSSProperties } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Plus, Trophy, XCircle, DollarSign, ClipboardList, History, Calendar, Search, CheckCircle } from 'lucide-react';
import {
  fetchOportunidades, fetchPipelineEtapas, updateEtapa, updateEtapaConArchivos,
  actualizarClienteContacto, updateEstado,
  type Oportunidad, type FiltroFecha, type PipelineEtapaDTO,
} from '../services/oportunidadService';
import ModalCrearOportunidad from './ModalCrearOportunidad';
import CrearTareaModal from './CrearTareaModal';
import HistorialPanel from './HistorialPanel';
import ModalMotivoPerdida from './ModalMotivoPerdida';
import ModalContactado from './ModalContactado';
import ModalCotizacion from './ModalCotizacion';
import ModalComprobante from './ModalComprobante';
import ModalNegociacion from './ModalNegociacion';

const PERDIDA_COL = '__perdida__';

// ── Toast helper ─────────────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function show(text: string) {
    if (timer.current) clearTimeout(timer.current);
    setMsg(text);
    timer.current = setTimeout(() => setMsg(null), 3500);
  }
  return { toastMsg: msg, showToast: show };
}

function formatSoles(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
  }).format(value);
}



const root: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  background: '#111b21',
  color: '#e9edef',
  fontFamily: 'inherit',
};

const topBar: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 24px',
  borderBottom: '1px solid #2a3942',
  flexShrink: 0,
};

const addBtn: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  background: '#00A884',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '8px 16px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

const boardArea: CSSProperties = {
  display: 'flex',
  gap: 16,
  padding: '20px 24px',
  overflowX: 'auto',
  flex: 1,
  alignItems: 'flex-start',
};

function columnStyle(isDraggingOver: boolean, isPerdida = false): CSSProperties {
  return {
    background: isDraggingOver
      ? (isPerdida ? '#2d1a1a' : '#1f2d34')
      : (isPerdida ? '#1e1414' : '#202c33'),
    borderRadius: 12,
    padding: '12px',
    minWidth: 240,
    width: 260,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    transition: 'background 0.15s',
    border: isPerdida ? '1px dashed #f8717150' : 'none',
  };
}

const colHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
};

function cardStyle(isDragging: boolean, isPerdida = false): CSSProperties {
  return {
    background: isDragging ? '#374752' : (isPerdida ? '#2a1f1f' : '#2a3942'),
    borderRadius: 8,
    padding: '12px 14px',
    boxShadow: isDragging ? '0 6px 20px rgba(0,0,0,0.5)' : '0 2px 6px rgba(0,0,0,0.2)',
    cursor: isPerdida ? 'default' : 'grab',
    transition: 'box-shadow 0.15s',
    userSelect: 'none',
  };
}

const cardTitle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#e9edef',
  marginBottom: 6,
  lineHeight: 1.3,
};

const cardMeta: CSSProperties = {
  fontSize: 12,
  color: '#8696A0',
};

const iconBtn: CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 2,
  borderRadius: 4,
  display: 'flex',
  alignItems: 'center',
};

// ─── Tarjeta de oportunidad abierta ──────────────────────────────────────────

function OportunidadCard({
  op, index, onRequestPerdida, onGanada,
}: {
  op: Oportunidad;
  index: number;
  onRequestPerdida: (op: Oportunidad) => void;
  onGanada: (id: number) => void;
}) {
  const [showTareaModal, setShowTareaModal] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);

  return (
    <>
      <Draggable draggableId={String(op.id)} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{ ...cardStyle(snapshot.isDragging), ...provided.draggableProps.style }}
          >
            <div style={cardTitle}>{op.titulo}</div>

            {op.cliente && <div style={cardMeta}>{op.cliente.nombre_completo}</div>}

            {op.valor_estimado > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <DollarSign size={12} color="#00A884" />
                <span style={{ fontSize: 13, color: '#00A884', fontWeight: 600 }}>
                  {formatSoles(op.valor_estimado)}
                </span>
              </div>
            )}

            {op.vendedor && (
              <div style={{ ...cardMeta, marginTop: 4 }}>👤 {op.vendedor.nombre_completo}</div>
            )}

            {op.fecha_proxima && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <Calendar size={11} color='#8696A0' />
                <span style={{ fontSize: 11.5, color: '#8696A0' }}>
                  {new Date(op.fecha_proxima).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}

            {op.servicios && op.servicios.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {op.servicios.map(s => (
                  <span key={s.id} style={{ fontSize: 10.5, padding: '2px 7px', borderRadius: 6, background: '#2a3942', color: '#00A884', border: '1px solid #374752', whiteSpace: 'nowrap' }}>
                    {s.tratamiento}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button title="Agregar tarea" style={{ ...iconBtn, color: '#8696A0', fontSize: 12, gap: 3 }} onClick={e => { e.stopPropagation(); setShowTareaModal(true); }}>
                  <ClipboardList size={13} />
                  <span style={{ fontSize: 11 }}>Tarea</span>
                </button>
                <button title="Ver historial" style={{ ...iconBtn, color: '#8696A0', fontSize: 12, gap: 3 }} onClick={e => { e.stopPropagation(); setShowHistorial(true); }}>
                  <History size={13} />
                  <span style={{ fontSize: 11 }}>Historial</span>
                </button>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button title="Marcar como ganada" style={{ ...iconBtn, color: '#00A884' }} onClick={() => onGanada(op.id)}>
                  <Trophy size={15} />
                </button>
                <button title="Marcar como perdida" style={{ ...iconBtn, color: '#f87171' }} onClick={e => { e.stopPropagation(); onRequestPerdida(op); }}>
                  <XCircle size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      {showTareaModal && <CrearTareaModal oportunidadId={op.id} onClose={() => setShowTareaModal(false)} onCreated={() => setShowTareaModal(false)} />}
      {showHistorial && <HistorialPanel oportunidadId={op.id} titulo={op.titulo} onClose={() => setShowHistorial(false)} />}
    </>
  );
}

// ─── Tarjeta de oportunidad perdida (solo lectura) ────────────────────────────

function PerdidaCard({ op, index }: { op: Oportunidad; index: number }) {
  const [showHistorial, setShowHistorial] = useState(false);

  return (
    <>
      <Draggable draggableId={String(op.id)} index={index} isDragDisabled>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={cardStyle(false, true)}>
            <div style={{ ...cardTitle, color: '#f87171' }}>{op.titulo}</div>
            {op.cliente && <div style={cardMeta}>{op.cliente.nombre_completo}</div>}
            {op.valor_estimado > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <DollarSign size={12} color="#f87171" />
                <span style={{ fontSize: 13, color: '#f87171', fontWeight: 600 }}>
                  {formatSoles(op.valor_estimado)}
                </span>
              </div>
            )}
            <div style={{ marginTop: 8 }}>
              <button title="Ver historial y motivo" style={{ ...iconBtn, color: '#8696A0', fontSize: 12, gap: 3 }} onClick={() => setShowHistorial(true)}>
                <History size={13} />
                <span style={{ fontSize: 11 }}>Ver motivo</span>
              </button>
            </div>
          </div>
        )}
      </Draggable>
      {showHistorial && <HistorialPanel oportunidadId={op.id} titulo={op.titulo} onClose={() => setShowHistorial(false)} />}
    </>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

type BoardState = Record<string, Oportunidad[]>;

export default function TableroKanban() {
  const [board, setBoard] = useState<BoardState>({ [PERDIDA_COL]: [] });
  const [etapas, setEtapas] = useState<PipelineEtapaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filtro, setFiltro] = useState<FiltroFecha>('semana');
  const [filtroEtapa, setFiltroEtapa] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [motivoPendiente, setMotivoPendiente] = useState<Oportunidad | null>(null);
  const { toastMsg, showToast } = useToast();

  const [accionPendiente, setAccionPendiente] = useState<{
    op: Oportunidad; srcCol: string; dstCol: string; srcIndex: number; dstIndex: number;
    tipo: 'contactado' | 'cotizacion' | 'comprobante' | 'negociacion';
  } | null>(null);

  const getColor = useCallback((nombre: string): string => {
    return etapas.find(e => e.nombre === nombre)?.color ?? '#64748b';
  }, [etapas]);

  const load = useCallback(async (f: FiltroFecha = filtro) => {
    setLoading(true);
    try {
      const [etapasData, ops] = await Promise.all([
        fetchPipelineEtapas(),
        fetchOportunidades(f),
      ]);
      setEtapas(etapasData);

      const grouped: BoardState = {
        ...Object.fromEntries(etapasData.map(e => [e.nombre, []])),
        [PERDIDA_COL]: [],
      };

      for (const op of ops) {
        if (op.estado === 'perdida') {
          grouped[PERDIDA_COL].push(op);
        } else if (grouped[op.etapa]) {
          grouped[op.etapa].push(op);
        } else {
          grouped[etapasData[0]?.nombre ?? '']?.push(op);
        }
      }
      setBoard(grouped);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(filtro); }, [filtro]); // eslint-disable-line react-hooks/exhaustive-deps

  function applyBoardMove(srcEtapa: string, dstEtapa: string, op: Oportunidad, dstIndex: number) {
    setBoard(prev => {
      const next = { ...prev };
      const srcList = [...(next[srcEtapa] ?? [])].filter(o => o.id !== op.id);
      const dstList = [...(next[dstEtapa] ?? [])];
      dstList.splice(dstIndex, 0, { ...op, etapa: dstEtapa });
      next[srcEtapa] = srcList;
      next[dstEtapa] = dstList;
      return next;
    });
  }

  function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcCol = source.droppableId;
    const dstCol = destination.droppableId;
    const id = Number(draggableId);

    // No mover desde perdida
    if (srcCol === PERDIDA_COL) return;

    // Si arrastra hacia la columna "perdida" → pedir motivo
    if (dstCol === PERDIDA_COL) {
      const op = board[srcCol]?.find(o => o.id === id);
      if (op) setMotivoPendiente(op);
      return;
    }

    const srcEtapa = srcCol;
    const dstEtapa = dstCol;

    // Reorden dentro de la misma columna (sin API)
    if (srcEtapa === dstEtapa) {
      setBoard(prev => {
        const next = { ...prev };
        const list = [...(next[srcEtapa] ?? [])];
        const [moved] = list.splice(source.index, 1);
        list.splice(destination.index, 0, moved);
        next[srcEtapa] = list;
        return next;
      });
      return;
    }

    const op = board[srcEtapa]?.find(o => o.id === id);
    if (!op) return;

    // Intercept: → Contactado (si faltan datos del cliente)
    if (dstEtapa === 'Contactado') {
      const necesitaDatos = !op.cliente?.correo || !op.cliente?.telefono;
      if (necesitaDatos) {
        setAccionPendiente({ op, srcCol: srcEtapa, dstCol: dstEtapa, srcIndex: source.index, dstIndex: destination.index, tipo: 'contactado' });
        return;
      }
    }

    // Intercept: → Negociación
    if (dstEtapa === 'Negociación') {
      setAccionPendiente({ op, srcCol: srcEtapa, dstCol: dstEtapa, srcIndex: source.index, dstIndex: destination.index, tipo: 'negociacion' });
      return;
    }

    // Intercept: → Cotización enviada
    if (dstEtapa === 'Cotización enviada') {
      setAccionPendiente({ op, srcCol: srcEtapa, dstCol: dstEtapa, srcIndex: source.index, dstIndex: destination.index, tipo: 'cotizacion' });
      return;
    }

    // Intercept: → Venta cerrada
    if (dstEtapa === 'Venta cerrada') {
      setAccionPendiente({ op, srcCol: srcEtapa, dstCol: dstEtapa, srcIndex: source.index, dstIndex: destination.index, tipo: 'comprobante' });
      return;
    }

    // Movimiento normal
    applyBoardMove(srcEtapa, dstEtapa, op, destination.index);
    updateEtapa(id, dstEtapa).catch(() => load());
  }

  // Llamado desde el botón X en la tarjeta
  function handleRequestPerdida(op: Oportunidad) {
    setMotivoPendiente(op);
  }

  // Confirmado el motivo → guardar
  async function handleConfirmPerdida(motivo: string) {
    if (!motivoPendiente) return;
    const op = motivoPendiente;
    setMotivoPendiente(null);

    await updateEstado(op.id, 'perdida', motivo || undefined);
    showToast('Oportunidad marcada como perdida');

    setBoard(prev => {
      const next = { ...prev };
      // quitar de su etapa actual
      for (const e of etapas) {
        if (next[e.nombre]) next[e.nombre] = next[e.nombre].filter(o => o.id !== op.id);
      }
      // agregar a perdidas
      next[PERDIDA_COL] = [{ ...op, estado: 'perdida' }, ...(next[PERDIDA_COL] ?? [])];
      return next;
    });
  }

  // Confirm: contactado
  async function handleConfirmContactado(data: {
    nombre_completo?: string;
    dni?: string;
    correo?: string;
    telefono?: string;
    empresa?: string;
  }) {
    if (!accionPendiente) return;
    const { op, srcCol, dstCol, dstIndex } = accionPendiente;
    setAccionPendiente(null);
    if (op.cliente?.id) {
      await actualizarClienteContacto(op.cliente.id, data).catch(() => {});
    }
    applyBoardMove(srcCol, dstCol, op, dstIndex);
    updateEtapa(op.id, dstCol)
      .then(() => showToast('Contacto guardado y etapa actualizada'))
      .catch(() => load());
  }

  // Confirm: negociación
  async function handleConfirmNegociacion(estado: string) {
    if (!accionPendiente) return;
    const { op, srcCol, dstCol, dstIndex } = accionPendiente;
    setAccionPendiente(null);
    applyBoardMove(srcCol, dstCol, op, dstIndex);
    updateEtapa(op.id, dstCol, estado || undefined)
      .then(() => showToast('Estado de negociación guardado'))
      .catch(() => load());
  }

  // Confirm: cotización enviada
  async function handleConfirmCotizacion(nota: string, files: File[]) {
    if (!accionPendiente) return;
    const { op, srcCol, dstCol, dstIndex } = accionPendiente;
    setAccionPendiente(null);
    applyBoardMove(srcCol, dstCol, op, dstIndex);
    if (files.length > 0) {
      updateEtapaConArchivos(op.id, dstCol, files, nota || undefined)
        .then(() => showToast(`Cotización guardada con ${files.length} archivo${files.length > 1 ? 's' : ''}`))
        .catch(() => load());
    } else {
      updateEtapa(op.id, dstCol, nota || undefined)
        .then(() => showToast('Cotización guardada correctamente'))
        .catch(() => load());
    }
  }

  // Confirm: venta cerrada con comprobantes
  async function handleConfirmComprobante(files: File[], nota?: string) {
    if (!accionPendiente) return;
    const { op, srcCol, dstCol, dstIndex } = accionPendiente;
    setAccionPendiente(null);
    applyBoardMove(srcCol, dstCol, op, dstIndex);
    updateEtapaConArchivos(op.id, dstCol, files, nota)
      .then(() => showToast(`Venta cerrada—${files.length} comprobante${files.length > 1 ? 's' : ''} guardado${files.length > 1 ? 's' : ''}`))
      .catch(() => load());
  }

  async function handleGanada(id: number) {
    await updateEstado(id, 'ganada');
    setBoard(prev => {
      const next = { ...prev };
      for (const e of etapas) {
        if (next[e.nombre]) next[e.nombre] = next[e.nombre].filter(o => o.id !== id);
      }
      return next;
    });
  }

  function handleCreated(op: Oportunidad) {
    setBoard(prev => {
      const etapa = op.etapa ?? (etapas[0]?.nombre ?? '');
      return { ...prev, [etapa]: [op, ...(prev[etapa] ?? [])] };
    });
  }

  const totalAbiertas = etapas.reduce((s, e) => s + (board[e.nombre]?.length ?? 0), 0);
  const totalValor = etapas.flatMap(e => board[e.nombre] ?? []).reduce((s, o) => s + o.valor_estimado, 0);

  // Filtrar por búsqueda (nombre cliente o título)
  const filtrarCards = useCallback((cards: Oportunidad[]) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(op =>
      op.titulo.toLowerCase().includes(q) ||
      (op.cliente?.nombre_completo ?? '').toLowerCase().includes(q)
    );
  }, [busqueda]);

  // Etapas a mostrar según filtro
  const etapasMostradas = useMemo(
    () => filtroEtapa === 'todas' ? etapas.map(e => e.nombre) : etapas.filter(e => e.nombre === filtroEtapa).map(e => e.nombre),
    [filtroEtapa, etapas]
  );

  return (
    <div style={root}>
      <div style={topBar}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Pipeline de oportunidades</h2>
          <p style={{ fontSize: 13, color: '#8696A0', margin: '4px 0 0' }}>
            {totalAbiertas} abiertas · {formatSoles(totalValor)} en juego
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {/* Buscador */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} color="#8696A0" style={{ position: 'absolute', left: 9, pointerEvents: 'none' }} />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar cliente o título..."
              style={{
                background: '#2a3942', border: '1px solid #374752', borderRadius: 8,
                color: '#e9edef', fontSize: 12, padding: '6px 10px 6px 28px',
                outline: 'none', width: 200,
              }}
            />
          </div>
          {/* Filtros de fecha */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['semana', 'mes', 'todo'] as FiltroFecha[]).map(f => (
              <button key={f} onClick={() => setFiltro(f)} style={{
                background: filtro === f ? '#2a3942' : 'none',
                border: `1px solid ${filtro === f ? '#00A884' : '#2a3942'}`,
                color: filtro === f ? '#e9edef' : '#8696A0',
                borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize',
              }}>
                {f === 'semana' ? 'Última Semana' : f === 'mes' ? 'Este Mes' : 'Todo'}
              </button>
            ))}
          </div>
          <button style={addBtn} onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Nueva oportunidad
          </button>
        </div>
      </div>

      {/* Filtros de etapa */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 24px', borderBottom: '1px solid #2a3942', flexShrink: 0, overflowX: 'auto' }}>
        {(['todas', ...etapas.map(e => e.nombre)]).map(e => {
          const activo = filtroEtapa === e;
          const color = e === 'todas' ? '#8696A0' : getColor(e);
          return (
            <button key={e} onClick={() => setFiltroEtapa(e)} style={{
              background: activo ? color + '22' : 'none',
              border: `1px solid ${activo ? color : '#2a3942'}`,
              color: activo ? color : '#8696A0',
              borderRadius: 20, padding: '4px 14px', fontSize: 11.5,
              fontWeight: activo ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {e !== 'todas' && (
                <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color }} />
              )}
              {e === 'todas' ? 'Todas las etapas' : e}
              {e !== 'todas' && <span style={{ fontSize: 10, opacity: 0.7 }}>({e === 'Oportunidad perdida' ? (board[PERDIDA_COL]?.length ?? 0) : (board[e]?.length ?? 0)})</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#8696A0' }}>Cargando…</div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={boardArea}>
            {/* Columnas normales */}
            {etapasMostradas.filter(e => e !== 'Oportunidad perdida').map(etapa => {
              const cards = filtrarCards(board[etapa] ?? []);
              const etapaTotal = cards.reduce((s, o) => s + o.valor_estimado, 0);
              return (
                <Droppable droppableId={etapa} key={etapa}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} style={columnStyle(snapshot.isDraggingOver)}>
                      <div style={colHeader}>
                        <div>
                          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: getColor(etapa), marginRight: 8 }} />
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{etapa}</span>
                        </div>
                        <span style={{ background: '#2a3942', borderRadius: 12, padding: '2px 8px', fontSize: 12, color: '#8696A0' }}>
                          {cards.length}
                        </span>
                      </div>
                      {etapaTotal > 0 && (
                        <div style={{ fontSize: 12, color: getColor(etapa), marginBottom: 4 }}>{formatSoles(etapaTotal)}</div>
                      )}
                      {cards.map((op, i) => (
                        <OportunidadCard
                          key={op.id}
                          op={op}
                          index={i}
                          onRequestPerdida={handleRequestPerdida}
                          onGanada={handleGanada}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}

            {/* Columna Oportunidad perdida — al mostrar todas o al filtrar por esa etapa */}
            {(filtroEtapa === 'todas' || filtroEtapa === 'Oportunidad perdida') && (
            <Droppable droppableId={PERDIDA_COL}>
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={columnStyle(snapshot.isDraggingOver, true)}>
                  <div style={colHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <XCircle size={14} color="#f87171" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>Oportunidad perdida</span>
                    </div>
                    <span style={{ background: '#2a1f1f', borderRadius: 12, padding: '2px 8px', fontSize: 12, color: '#f87171' }}>
                      {board[PERDIDA_COL].length}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#8696A050', textAlign: 'center', marginBottom: 4 }}>
                    Arrastra aquí o usa el botón ✕
                  </div>
                  {board[PERDIDA_COL].map((op, i) => (
                    <PerdidaCard key={op.id} op={op} index={i} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            )}
          </div>
        </DragDropContext>
      )}

      {showModal && (
        <ModalCrearOportunidad
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
          etapasNombres={etapas.map(e => e.nombre)}
        />
      )}

      {motivoPendiente && (
        <ModalMotivoPerdida
          titulo={motivoPendiente.titulo}
          onConfirm={handleConfirmPerdida}
          onCancel={() => setMotivoPendiente(null)}
        />
      )}

      {accionPendiente?.tipo === 'contactado' && (
        <ModalContactado
          clienteNombre={accionPendiente.op.cliente?.nombre_completo ?? accionPendiente.op.titulo}
          clienteActual={{
            nombre_completo: accionPendiente.op.cliente?.nombre_completo,
            dni: accionPendiente.op.cliente?.dni,
            correo: accionPendiente.op.cliente?.correo,
            telefono: accionPendiente.op.cliente?.telefono,
            empresa: accionPendiente.op.cliente?.empresa,
          }}
          onConfirm={handleConfirmContactado}
          onCancel={() => setAccionPendiente(null)}
        />
      )}

      {accionPendiente?.tipo === 'negociacion' && (
        <ModalNegociacion
          titulo={accionPendiente.op.titulo}
          onConfirm={handleConfirmNegociacion}
          onCancel={() => setAccionPendiente(null)}
        />
      )}

      {accionPendiente?.tipo === 'cotizacion' && (
        <ModalCotizacion
          titulo={accionPendiente.op.titulo}
          onConfirm={handleConfirmCotizacion}
          onCancel={() => setAccionPendiente(null)}
        />
      )}

      {accionPendiente?.tipo === 'comprobante' && (
        <ModalComprobante
          titulo={accionPendiente.op.titulo}
          onConfirm={handleConfirmComprobante}
          onCancel={() => setAccionPendiente(null)}
        />
      )}

      {/* ── Toast de éxito ───────────────────────────────────────────── */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
          background: '#1a3a2a', border: '1px solid #00A884',
          borderRadius: 10, padding: '12px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          animation: 'fadeInUp 0.25s ease',
          maxWidth: 340,
        } as CSSProperties}>
          <CheckCircle size={18} color="#00A884" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#e9edef', lineHeight: 1.4 }}>{toastMsg}</span>
        </div>
      )}
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}