import type { CSSProperties } from 'react';
import type { Contact } from '../hooks/useCrm';
import type { CrmConversacionEtiqueta } from '../services/labelService';
import { MessageCircle } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
  asignadas?: CrmConversacionEtiqueta[];
}

function formatTime(date?: Date): string {
  if (!date) return '';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `${minutes} min`;
  if (hours < 24) return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'ayer';
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
}

const LABEL_COLORS: Record<string, { bg: string; color: string }> = {
  nuevo:    { bg: '#00A884', color: '#fff' },
  vip:      { bg: '#FFD700', color: '#111' },
  pendiente:{ bg: '#FF9800', color: '#fff' },
  cerrado:  { bg: '#8696A0', color: '#fff' },
};

const WspIcon = () => (
  <MessageCircle size={12} color="#25D366" strokeWidth={2} style={{ flexShrink: 0 }} />
);

export const ContactCard = ({ contact, isSelected, onClick, asignadas = [] }: ContactCardProps) => {
  const cardStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    cursor: 'pointer',
    background: isSelected ? '#2a3942' : 'transparent',
    borderBottom: '1px solid #1f2c34',
    transition: 'background 0.15s',
    userSelect: 'none',
    minWidth: 0,
  };

  const avatarWrapStyle: CSSProperties = {
    position: 'relative',
    flexShrink: 0,
  };

  const avatarStyle: CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${contact.color}BB, ${contact.color})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: 0.5,
  };

  const onlineDotStyle: CSSProperties = {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '#25D366',
    border: '2px solid #111b21',
  };

  const infoStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  };

  const row1Style: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  };

  const nameStyle: CSSProperties = {
    fontSize: 15,
    fontWeight: 500,
    color: '#e9edef',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const timeStyle: CSSProperties = {
    fontSize: 11,
    color: contact.unreadCount > 0 ? '#00A884' : '#8696A0',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  };

  const row2Style: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  };

  const lastMsgStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12.5,
    color: '#8696A0',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    flex: 1,
    minWidth: 0,
  };

  const badgesStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  };

  const unreadStyle: CSSProperties = {
    minWidth: 18,
    height: 18,
    padding: '0 5px',
    borderRadius: 9,
    background: '#00A884',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = '#1f2c34';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      {/* Avatar */}
      <div style={avatarWrapStyle}>
        <div style={avatarStyle}>{contact.initials}</div>
        {contact.isOnline && <span style={onlineDotStyle} />}
      </div>

      {/* Info */}
      <div style={infoStyle}>
        <div style={row1Style}>
          <span style={nameStyle}>{contact.name}</span>
          <span style={timeStyle}>{formatTime(contact.lastMessageTime)}</span>
        </div>
        <div style={row2Style}>
          <span style={lastMsgStyle}>
            {contact.source === 'whatsapp' && <WspIcon />}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {contact.lastMessage || 'Sin mensajes'}
            </span>
          </span>
          <div style={badgesStyle}>
            {asignadas.map(a => (
              <span
                key={a.id}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 8,
                  background: a.etiqueta?.color ?? '#8696A0',
                  color: '#fff',
                  letterSpacing: 0.3,
                  maxWidth: 60,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={a.etiqueta?.nombre}
              >
                {a.etiqueta?.nombre}
              </span>
            ))}
            {contact.unreadCount > 0 && (
              <span style={unreadStyle}>
                {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
