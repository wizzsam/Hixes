import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Search, MoreVertical, ChevronLeft, Tag, UserPlus, AlertTriangle, Kanban, Lock, UserX, ArrowLeftRight } from 'lucide-react';
import type { Contact, Message } from '../hooks/useCrm';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import { AssignLabelMenu } from './AssignLabelMenu';
import type { CrmEtiqueta, CrmConversacionEtiqueta } from '../services/labelService';
import { getVendedoresDisponibles } from '../services/whatsappService';
import type { VendedorDisponible } from '../services/whatsappService';

interface ChatWindowProps {
  contact: Contact | null;
  messages: Message[];
  inputValue: string;
  onInputChange: (v: string) => void;
  onSend: (msg: string) => void;
  onSendMedia?: (file: File) => void;
  onBack?: () => void;
  onScheduleContact?: () => void;
  onCrearOportunidad?: () => void;
  onTransferirChat?: (vendedorId: number) => void;
  etiquetas: CrmEtiqueta[];
  asignaciones: CrmConversacionEtiqueta[];
  onAsignacionesChange: (a: CrmConversacionEtiqueta[]) => void;
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { label: string; messages: Message[] }[] = [];
  let currentLabel = '';

  messages.forEach((msg) => {
    const date = new Date(msg.timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let label: string;
    if (date.toDateString() === today.toDateString()) {
      label = 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = 'Ayer';
    } else {
      label = date.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    if (label !== currentLabel) {
      groups.push({ label, messages: [] });
      currentLabel = label;
    }
    groups[groups.length - 1].messages.push(msg);
  });

  return groups;
}

const LABEL_COLORS: Record<string, string> = {
  nuevo: '#00A884',
  vip: '#FFD700',
  pendiente: '#FF9800',
  cerrado: '#8696A0',
};

const BG_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cg fill='none' stroke='%23ffffff08' stroke-width='1'%3E%3Cpath d='M40 10 C30 10 22 18 22 28 C22 34 25 40 30 44 L28 54 L38 50 C38.7 50.1 39.3 50.2 40 50.2 C50 50.2 58 42.2 58 32.2 C58 22.2 50 10 40 10Z'/%3E%3C/g%3E%3C/svg%3E")`;

export const ChatWindow = ({
  contact,
  messages,
  inputValue,
  onInputChange,
  onSend,
  onSendMedia,
  onBack,
  onScheduleContact,
  onCrearOportunidad,
  onTransferirChat,
  etiquetas,
  asignaciones,
  onAsignacionesChange,
}: ChatWindowProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const tagBtnRef = useRef<HTMLButtonElement>(null);
  const transferBtnRef = useRef<HTMLButtonElement>(null);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [showTransferMenu, setShowTransferMenu] = useState(false);
  const [vendedores, setVendedores] = useState<VendedorDisponible[]>([]);
  const [loadingVendedores, setLoadingVendedores] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!contact) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0b141a' }}>
        <EmptyState />
      </div>
    );
  }

  const groups = groupMessagesByDate(messages);

  const areaStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: '#0b141a',
    minWidth: 0,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 16px',
    background: '#202c33',
    borderBottom: '1px solid #1f2c34',
    flexShrink: 0,
    minHeight: 60,
  };

  const backBtnStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
    borderRadius: '50%',
    color: '#aebac1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
  };

  const avatarStyle: CSSProperties = {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${contact.color}BB, ${contact.color})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
    cursor: 'pointer',
  };

  const onlineDotStyle: CSSProperties = {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: '50%',
    background: '#25D366',
    border: '2px solid #202c33',
  };

  const headerInfoStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  };

  const headerNameStyle: CSSProperties = {
    fontSize: 15.5,
    fontWeight: 600,
    color: '#e9edef',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const headerSubStyle: CSSProperties = {
    fontSize: 12,
    color: contact.isOnline ? '#25D366' : '#8696A0',
  };

  const labelChipStyle: CSSProperties = {
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 10.5,
    fontWeight: 600,
    background: LABEL_COLORS[contact.label ?? ''] ?? '#8696A0',
    color: contact.label === 'vip' ? '#111' : '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    textTransform: 'capitalize',
    letterSpacing: 0.3,
    flexShrink: 0,
  };

  const headerActionsStyle: CSSProperties = {
    display: 'flex',
    gap: 2,
    flexShrink: 0,
  };

  const iconBtnStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
    borderRadius: '50%',
    color: '#aebac1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s, color 0.15s',
  };

  const messagesAreaStyle: CSSProperties = {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  };

  const bgStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: `${BG_PATTERN}, #0b141a`,
    backgroundSize: '80px 80px',
    opacity: 1,
  };

  const messagesScrollStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '12px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    scrollbarWidth: 'thin',
    scrollbarColor: '#374752 transparent',
  };

  const dateDividerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 0',
  };

  const datePillStyle: CSSProperties = {
    background: '#182229',
    color: '#8696A0',
    fontSize: 11.5,
    fontWeight: 500,
    padding: '4px 12px',
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  };

  const emptyConvStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    padding: 20,
  };

  const emptyPillStyle: CSSProperties = {
    background: 'rgba(0,168,132,0.15)',
    color: '#00A884',
    fontSize: 12,
    padding: '6px 14px',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  };

  return (
    <div style={areaStyle}>
      {/* Header */}
      <div style={headerStyle}>
        {onBack && (
          <button
            style={backBtnStyle}
            onClick={onBack}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#374752'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
        )}

        <div style={avatarStyle}>
          {contact.initials}
          {contact.isOnline && <span style={onlineDotStyle} />}
        </div>

        <div style={headerInfoStyle}>
          <span style={headerNameStyle}>{contact.name}</span>
          <span style={headerSubStyle}>
            {contact.isOnline ? 'en línea' : contact.phone}
          </span>
        </div>

        {/* Etiquetas asignadas a esta conversación */}
        {!contact.isUnknown && asignaciones
          .filter((a) => a.phone === contact.phone)
          .map((a) => (
            <span key={a.id} style={{ ...labelChipStyle, background: a.etiqueta.color, color: '#fff' }}>
              <Tag size={10} strokeWidth={2.5} />
              {a.etiqueta.nombre}
            </span>
          ))}

        {/* Botón Crear oportunidad — solo para clientes registrados */}
        {!contact.isUnknown && onCrearOportunidad && (
          <button
            style={{
              background: 'rgba(0,168,132,0.15)',
              border: '1px solid rgba(0,168,132,0.4)',
              borderRadius: 8,
              color: '#00A884',
              fontSize: 12,
              fontWeight: 600,
              padding: '5px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              flexShrink: 0,
            }}
            onClick={onCrearOportunidad}
            title="Crear oportunidad en el Kanban"
          >
            <Kanban size={13} strokeWidth={2.5} />
            Oportunidad
          </button>
        )}

        {/* Botón Agendar — solo para contactos desconocidos */}
        {contact.isUnknown && onScheduleContact && (
          <button
            style={{
              background: '#00A884',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              padding: '5px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              flexShrink: 0,
            }}
            onClick={onScheduleContact}
            title="Registrar como cliente"
          >
            <UserPlus size={13} strokeWidth={2.5} />
            Agendar
          </button>
        )}

        <div style={headerActionsStyle}>
          {/* Botón etiquetas */}
          {!contact.isUnknown && (
            <div style={{ position: 'relative' }}>
              <button
                ref={tagBtnRef}
                style={{
                  ...iconBtnStyle,
                  ...(showLabelMenu ? { background: '#374752', color: '#00A884' } : {}),
                }}
                title="Asignar etiquetas"
                onClick={() => setShowLabelMenu((v) => !v)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#374752'; }}
                onMouseLeave={(e) => { if (!showLabelMenu) (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
              >
                <Tag size={17} strokeWidth={2} />
              </button>
              {showLabelMenu && (
                <AssignLabelMenu
                  phone={contact.phone}
                  etiquetas={etiquetas}
                  asignaciones={asignaciones}
                  onUpdate={onAsignacionesChange}
                  onClose={() => setShowLabelMenu(false)}
                  anchorRef={tagBtnRef}
                />
              )}
            </div>
          )}
          {[
            { icon: <Search size={18} strokeWidth={2} />, title: 'Buscar en chat' },
            { icon: <MoreVertical size={18} strokeWidth={2} />, title: 'Más opciones' },
          ].map(({ icon, title }) => (
            <button
              key={title}
              style={iconBtnStyle}
              title={title}
              onMouseEnter={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.background = '#374752';
                btn.style.color = '#e9edef';
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.background = 'none';
                btn.style.color = '#aebac1';
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Banner: asignado a otro vendedor */}
      {contact.vendedorAsignado && !contact.isAssignedToMe && (
        <div
          style={{
            background: 'rgba(130,80,200,0.13)',
            borderBottom: '1px solid rgba(130,80,200,0.3)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <Lock size={13} color="#a570f5" strokeWidth={2.5} style={{ flexShrink: 0 }} />
          <span style={{ color: '#c9a0ff', fontSize: 12.5, flex: 1 }}>
            Chat asignado a <strong>{contact.vendedorAsignado.nombre_completo}</strong>. Solo puedes leer.
          </span>
        </div>
      )}

      {/* Banner: sin asignar */}
      {!contact.vendedorAsignado && (
        <div
          style={{
            background: 'rgba(255,193,7,0.08)',
            borderBottom: '1px solid rgba(255,193,7,0.2)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <UserX size={13} color="#FFC107" strokeWidth={2.5} style={{ flexShrink: 0 }} />
          <span style={{ color: '#FFC107', fontSize: 12.5 }}>Sin vendedor asignado (ningún vendedor disponible).</span>
        </div>
      )}

      {/* Banner: contacto desconocido */}
      {contact.isUnknown && (
        <div
          style={{
            background: 'rgba(255,193,7,0.12)',
            borderBottom: '1px solid rgba(255,193,7,0.25)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={14} color="#FFC107" strokeWidth={2.5} style={{ flexShrink: 0 }} />
          <span style={{ color: '#FFC107', fontSize: 12.5 }}>
            Número no registrado como cliente.
            {onScheduleContact && (
              <>
                {' '}
                <button
                  onClick={onScheduleContact}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FFC107',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 12.5,
                    fontWeight: 600,
                    textDecoration: 'underline',
                  }}
                >
                  Agendarlo aquí
                </button>
              </>
            )}
          </span>
        </div>
      )}

      {/* Messages area */}
      <div style={messagesAreaStyle}>
        <div style={bgStyle} aria-hidden="true" />
        <div style={messagesScrollStyle}>
          {messages.length === 0 ? (
            <div style={emptyConvStyle}>
              <span style={emptyPillStyle}>
                <Tag size={12} strokeWidth={2} />
                Inicio de conversación con {contact.name}
              </span>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <div style={dateDividerStyle}>
                  <span style={datePillStyle}>{group.label}</span>
                </div>
                {group.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input — bloqueado si el chat no está asignado al usuario actual */}
      {contact.isAssignedToMe ? (
        <>
          {/* Barra de acciones: transferir */}
          {onTransferirChat && (
            <div style={{ background: '#202c33', borderTop: '1px solid #1f2c34', padding: '6px 16px 2px', display: 'flex', justifyContent: 'flex-end', gap: 8, position: 'relative' }}>
              {/* Botón transferir */}
              <div style={{ position: 'relative' }}>
                  <button
                    ref={transferBtnRef}
                    onClick={async () => {
                      if (!showTransferMenu) {
                        setLoadingVendedores(true);
                        setShowTransferMenu(true);
                        try {
                          const data = await getVendedoresDisponibles();
                          setVendedores(data);
                        } finally {
                          setLoadingVendedores(false);
                        }
                      } else {
                        setShowTransferMenu(false);
                      }
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(52,183,241,0.4)',
                      borderRadius: 6,
                      color: '#34B7F1',
                      fontSize: 11.5,
                      fontWeight: 600,
                      padding: '3px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <ArrowLeftRight size={12} strokeWidth={2.5} />
                    Transferir
                  </button>
                  {/* Dropdown de vendedores */}
                  {showTransferMenu && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 6px)',
                        right: 0,
                        background: '#202c33',
                        border: '1px solid #374752',
                        borderRadius: 8,
                        minWidth: 220,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        zIndex: 50,
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ padding: '8px 12px 4px', fontSize: 10, color: '#8696A0', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #2a3942' }}>
                        Transferir a vendedor
                      </div>
                      {loadingVendedores ? (
                        <div style={{ padding: '12px', color: '#8696A0', fontSize: 12, textAlign: 'center' }}>Cargando...</div>
                      ) : vendedores.length === 0 ? (
                        <div style={{ padding: '12px', color: '#8696A0', fontSize: 12, textAlign: 'center' }}>Sin vendedores disponibles</div>
                      ) : (
                        vendedores.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => {
                              if (!v.sesion_activa) return;
                              onTransferirChat(v.id);
                              setShowTransferMenu(false);
                            }}
                            disabled={!v.sesion_activa}
                            style={{
                              width: '100%',
                              background: 'none',
                              border: 'none',
                              cursor: v.sesion_activa ? 'pointer' : 'not-allowed',
                              padding: '9px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              textAlign: 'left',
                              opacity: v.sesion_activa ? 1 : 0.45,
                            }}
                            onMouseEnter={(e) => { if (v.sesion_activa) (e.currentTarget as HTMLButtonElement).style.background = '#2a3942'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                flexShrink: 0,
                                background: v.sesion_activa ? '#25D366' : '#8696A0',
                              }}
                            />
                            <span style={{ flex: 1, color: v.sesion_activa ? '#e9edef' : '#8696A0', fontSize: 13 }}>{v.nombre_completo}</span>
                            {v.sesion_activa
                              ? <span style={{ fontSize: 10, color: '#8696A0' }}>{v.chats_activos} chat{v.chats_activos !== 1 ? 's' : ''}</span>
                              : <span style={{ fontSize: 10, color: '#8696A0', fontStyle: 'italic' }}>No disponible</span>
                            }
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
            </div>
          )}
          <ChatInput value={inputValue} onChange={onInputChange} onSend={onSend} onSendMedia={onSendMedia} />
        </>
      ) : (
        <div
          style={{
            background: '#202c33',
            borderTop: '1px solid #1f2c34',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: '#8696A0',
            fontSize: 13,
          }}
        >
          <Lock size={14} strokeWidth={2} />
          Solo puedes leer este chat
        </div>
      )}
    </div>
  );
};