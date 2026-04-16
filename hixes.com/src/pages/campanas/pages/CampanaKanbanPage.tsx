import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { ArrowLeft, Loader2, Users } from 'lucide-react';
import { campanaWorkerService, type CampanaKanbanData } from '../services/campanaWorkerService';
import type { CampanaEtapa } from '../../admin/features/campanasAdmin/schemas/campana.interface';

// ─── Styles ───────────────────────────────────────────────────────────────────

const rootStyle: CSSProperties = {
  display: 'flex', flexDirection: 'column', height: '100%',
  background: '#111b21', color: '#e9edef', fontFamily: 'inherit',
};

const topBarStyle: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '16px 24px', borderBottom: '1px solid #2a3942', flexShrink: 0, gap: 12,
};

const boardAreaStyle: CSSProperties = {
  display: 'flex', gap: 16, padding: '20px 24px',
  overflowX: 'auto', flex: 1, alignItems: 'flex-start',
};

function colStyle(isDraggingOver: boolean): CSSProperties {
  return {
    background: isDraggingOver ? '#1f2d34' : '#202c33',
    borderRadius: 12, padding: 12, minWidth: 240, width: 260,
    flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10,
    transition: 'background 0.15s',
  };
}

function cardStyle(isDragging: boolean): CSSProperties {
  return {
    background: isDragging ? '#374752' : '#2a3942',
    borderRadius: 8, padding: '12px 14px',
    boxShadow: isDragging ? '0 6px 20px rgba(0,0,0,0.5)' : '0 2px 6px rgba(0,0,0,0.2)',
    cursor: 'grab', transition: 'box-shadow 0.15s', userSelect: 'none',
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type KanbanCliente = CampanaKanbanData['clientes'][number];

type Board = Record<string, KanbanCliente[]>;

function buildBoard(etapas: CampanaEtapa[], clientes: KanbanCliente[]): Board {
  const board: Board = {};
  etapas.forEach(e => { board[String(e.id)] = []; });
  board['__sin_etapa__'] = [];
  clientes.forEach(c => {
    const key = c.etapa_id ? String(c.etapa_id) : '__sin_etapa__';
    (board[key] ??= []).push(c);
  });
  return board;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CampanaKanbanPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const campanaId = Number(id);

  const [data, setData] = useState<CampanaKanbanData | null>(null);
  const [board, setBoard] = useState<Board>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await campanaWorkerService.obtenerKanban(campanaId);
      setData(d);
      setBoard(buildBoard(d.campana.etapas, d.clientes));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [campanaId]);

  useEffect(() => { load(); }, [load]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;
    if (destination.droppableId === '__sin_etapa__') return; // No permitir mover a sin etapa

    const srcKey = source.droppableId;
    const dstKey = destination.droppableId;

    // Mover en el board localmente primero (optimistic)
    const srcItems = [...(board[srcKey] ?? [])];
    const dstItems = srcKey === dstKey ? srcItems : [...(board[dstKey] ?? [])];
    const [moved] = srcItems.splice(source.index, 1);
    dstItems.splice(destination.index, 0, moved);

    setBoard(prev => ({
      ...prev,
      [srcKey]: srcItems,
      [dstKey]: dstItems,
    }));

    // Persistir en la API
    try {
      const newEtapaId = Number(dstKey);
      await campanaWorkerService.moverCliente(campanaId, moved.cliente.id, newEtapaId);
    } catch {
      // Revertir en caso de error
      load();
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', background: '#111b21' }}>
        <Loader2 style={{ width: 36, height: 36, color: '#00A884' }} className="animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { campana } = data;
  const etapas = campana.etapas;
  const sinEtapa = board['__sin_etapa__'] ?? [];

  return (
    <div style={rootStyle}>
      {/* Top bar */}
      <div style={topBarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/trabajador/campanas')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696a0', padding: 6, borderRadius: 8, display: 'flex' }}
          >
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#e9edef' }}>{campana.nombre}</h1>
            <p style={{ fontSize: 12, color: '#8696a0', margin: 0 }}>
              {campana.fecha_inicio} → {campana.fecha_fin} · {campana.total_clientes} cliente{campana.total_clientes !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8696a0' }}>
          <Users style={{ width: 16, height: 16 }} />
          <span>{data.clientes.length}</span>
        </div>
      </div>

      {/* Kanban board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={boardAreaStyle}>
          {etapas.map(etapa => {
            const key = String(etapa.id);
            const items = board[key] ?? [];
            return (
              <Droppable key={key} droppableId={key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={colStyle(snapshot.isDraggingOver)}
                  >
                    {/* Column header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: etapa.color, flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#e9edef' }}>{etapa.nombre}</span>
                      </div>
                      <span style={{ background: '#2a3942', color: '#8696a0', borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '1px 8px' }}>
                        {items.length}
                      </span>
                    </div>

                    {/* Cards */}
                    {items.map((item, index) => (
                      <Draggable key={String(item.pivot_id)} draggableId={String(item.pivot_id)} index={index}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            style={{ ...cardStyle(snap.isDragging), ...prov.draggableProps.style }}
                          >
                            <p style={{ fontWeight: 600, fontSize: 13, color: '#e9edef', margin: '0 0 4px' }}>
                              {item.cliente.nombre_completo}
                            </p>
                            <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#8696a0' }}>
                              <span>DNI: {item.cliente.dni}</span>
                              <span>·</span>
                              <span>{item.cliente.telefono}</span>
                            </div>
                            {(item.cliente.cashback > 0 || item.cliente.wallet > 0) && (
                              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {item.cliente.cashback > 0 && (
                                  <span style={{ background: '#1f3229', color: '#00A884', borderRadius: 5, fontSize: 10, fontWeight: 700, padding: '2px 6px' }}>
                                    CB S/ {Number(item.cliente.cashback).toFixed(2)}
                                  </span>
                                )}
                                {item.cliente.wallet > 0 && (
                                  <span style={{ background: '#1a2c3d', color: '#53bdeb', borderRadius: 5, fontSize: 10, fontWeight: 700, padding: '2px 6px' }}>
                                    Wallet S/ {Number(item.cliente.wallet).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}

          {/* Sin etapa column (read-only) */}
          {sinEtapa.length > 0 && (
            <div style={{ ...colStyle(false), border: '1px dashed #374752', opacity: 0.8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#8696a0' }}>Sin etapa</span>
                <span style={{ background: '#2a3942', color: '#8696a0', borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '1px 8px' }}>
                  {sinEtapa.length}
                </span>
              </div>
              {sinEtapa.map(item => (
                <div key={item.pivot_id} style={{ ...cardStyle(false), cursor: 'default', opacity: 0.7 }}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#e9edef', margin: 0 }}>{item.cliente.nombre_completo}</p>
                  <p style={{ fontSize: 11, color: '#8696a0', margin: '4px 0 0' }}>DNI: {item.cliente.dni}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DragDropContext>
    </div>
  );
}
