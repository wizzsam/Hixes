import { useRef, useEffect, type CSSProperties } from 'react';
import { FileText, MapPin, Download } from 'lucide-react';
import type { Message } from '../hooks/useCrm';

interface MessageBubbleProps {
  message: Message;
}

function formatMsgTime(date: Date): string {
  return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

const CheckIcon = ({ double, blue }: { double?: boolean; blue?: boolean }) => {
  const color = blue ? '#53BDEB' : 'rgba(255,255,255,0.6)';
  if (!double) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  return (
    <svg width="16" height="14" viewBox="0 0 28 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5 12 9 16 20 6" />
      <polyline points="11 12 15 16 26 6" />
    </svg>
  );
};

const StatusTick = ({ status }: { status: Message['status'] }) => {
  if (status === 'sent') return <CheckIcon />;
  if (status === 'delivered') return <CheckIcon double />;
  if (status === 'read') return <CheckIcon double blue />;
  return null;
};

/** Renderiza el contenido multimedia según el tipo */
/** Reproductor de audio con fix de duración para WebM grabado por Chrome */
const AudioMessage = ({ src }: { src: string }) => {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fixDuration = () => {
      if (el.duration === Infinity || isNaN(el.duration)) {
        el.currentTime = 1e101;
        el.addEventListener('seeked', () => { el.currentTime = 0; }, { once: true });
      }
    };

    el.addEventListener('loadedmetadata', fixDuration);
    // Por si ya estaba cargado cuando el componente monta
    if (el.readyState >= 1) fixDuration();

    return () => el.removeEventListener('loadedmetadata', fixDuration);
  }, [src]);

  return (
    <audio
      ref={ref}
      src={src}
      controls
      preload="metadata"
      style={{ width: '100%', minWidth: 220, marginBottom: 4, accentColor: '#00A884' }}
    />
  );
};

const MediaContent = ({ message }: { message: Message }) => {
  const { type, mediaUrl, mediaType, content } = message;

  if (type === 'image' && mediaUrl) {
    return (
      <img
        key={mediaUrl}
        src={mediaUrl}
        alt="Imagen"
        style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 8, display: 'block', marginBottom: 4, cursor: 'pointer' }}
        onClick={() => window.open(mediaUrl, '_blank')}
      />
    );
  }

  if (type === 'video' && mediaUrl) {
    return (
      <video
        key={mediaUrl}
        src={mediaUrl}
        controls
        style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 8, display: 'block', marginBottom: 4 }}
      />
    );
  }

  if (type === 'audio' && mediaUrl) {
    return <AudioMessage src={mediaUrl} />;
  }

  if (type === 'document' && mediaUrl) {
    const fileName = mediaUrl.split('/').pop() ?? 'documento';
    return (
      <a
        href={mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        download
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 8,
          padding: '8px 10px',
          marginBottom: 4,
          color: '#e9edef',
          textDecoration: 'none',
          fontSize: 13,
          wordBreak: 'break-all',
        }}
      >
        <FileText size={22} color="#00A884" strokeWidth={1.8} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 12.5 }}>{fileName}</span>
        <Download size={16} color="#8696A0" strokeWidth={2} style={{ flexShrink: 0 }} />
      </a>
    );
  }

  if (type === 'location' && mediaUrl) {
    // mediaUrl tiene formato "geo:lat,lon"
    const coords = mediaUrl.replace('geo:', '');
    const mapsUrl = `https://www.google.com/maps?q=${coords}`;
    const [lat, lon] = coords.split(',');
    const thumbUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coords}&zoom=15&size=280x140&markers=${coords}&key=`;
    return (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 4,
          textDecoration: 'none',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Mapa estático (requiere API key en producción; fallback al texto) */}
        {thumbUrl.endsWith('key=') ? (
          <div style={{
            background: '#1a2832',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <MapPin size={22} color="#00A884" strokeWidth={1.8} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ color: '#e9edef', fontSize: 13, fontWeight: 600 }}>Ubicación compartida</div>
              <div style={{ color: '#8696A0', fontSize: 11.5 }}>{lat}, {lon}</div>
            </div>
          </div>
        ) : (
          <img src={thumbUrl} alt="Ubicación" style={{ width: '100%', display: 'block' }} />
        )}
        <div style={{ padding: '5px 10px', background: '#1a2832', color: '#00A884', fontSize: 12, fontWeight: 600 }}>
          Ver en Google Maps →
        </div>
      </a>
    );
  }

  // Texto normal (también sirve de caption para medios con texto)
  if (content) {
    return null; // se renderiza abajo en el bubble
  }

  return null;
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isOwn = message.isOwn;
  const hasMedia = ['image', 'video', 'audio', 'document', 'location'].includes(message.type);

  const rowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: isOwn ? 'flex-end' : 'flex-start',
    padding: '2px 6%',
    animationName: 'bubbleIn',
    animationDuration: '0.18s',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
  };

  const bubbleStyle: CSSProperties = {
    position: 'relative',
    maxWidth: hasMedia ? '70%' : '65%',
    minWidth: 80,
    padding: hasMedia ? '6px 6px 6px' : '7px 10px 6px',
    borderRadius: isOwn ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
    background: isOwn ? '#005c4b' : '#202c33',
    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
    wordBreak: 'break-word',
  };

  const senderStyle: CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: '#00A884',
    marginBottom: 3,
    display: 'block',
    padding: hasMedia ? '0 4px' : undefined,
  };

  const textStyle: CSSProperties = {
    fontSize: 14.5,
    lineHeight: 1.45,
    color: '#e9edef',
    margin: 0,
    paddingRight: isOwn ? 42 : 30,
    padding: hasMedia ? '0 4px' : undefined,
  };

  const metaStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: -2,
    float: 'right',
    marginLeft: 8,
    marginBottom: -3,
    padding: hasMedia ? '0 4px' : undefined,
  };

  const timeStyle: CSSProperties = {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={rowStyle}>
      <div style={bubbleStyle}>
        {!isOwn && message.sender && (
          <span style={senderStyle}>{message.sender}</span>
        )}
        <MediaContent message={message} />
        {message.content && (
          <p style={textStyle}>{message.content}</p>
        )}
        <span style={metaStyle}>
          <span style={timeStyle}>{formatMsgTime(new Date(message.timestamp))}</span>
          {isOwn && <StatusTick status={message.status} />}
        </span>
      </div>
    </div>
  );
};
