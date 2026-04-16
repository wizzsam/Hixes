import type { CSSProperties } from 'react';
import { MessageSquare, Lock } from 'lucide-react';

export const EmptyState = () => {
  const containerStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0b141a',
    gap: 0,
  };

  const iconWrapStyle: CSSProperties = {
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: 'rgba(0,168,132,0.12)',
    border: '2px solid rgba(0,168,132,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  };

  const titleStyle: CSSProperties = {
    fontSize: 22,
    fontWeight: 300,
    color: '#aebac1',
    margin: '0 0 10px',
    letterSpacing: 0.5,
  };

  const subtitleStyle: CSSProperties = {
    fontSize: 13.5,
    color: '#8696A0',
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 1.6,
    margin: '0 0 32px',
  };

  const featuresStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    alignItems: 'flex-start',
  };

  const featureStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 13,
    color: '#8696A0',
  };

  const dotStyle = (color: string): CSSProperties => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  });

  const lockLineStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 40,
    fontSize: 12,
    color: '#8696A0',
  };

  return (
    <div style={containerStyle}>
      <div style={iconWrapStyle}>
        <MessageSquare size={48} color="#00A884" strokeWidth={1.3} />
      </div>

      <h2 style={titleStyle}>Hixes CRM</h2>
      <p style={subtitleStyle}>
        Selecciona una conversación para comenzar a chatear con tus clientes desde un solo lugar.
      </p>

      <div style={featuresStyle}>
        <div style={featureStyle}>
          <span style={dotStyle('#25D366')} />
          <span>Mensajes conectados via WhatsApp</span>
        </div>
        <div style={featureStyle}>
          <span style={dotStyle('#53BDEB')} />
          <span>Seguimiento de clientes en tiempo real</span>
        </div>
        <div style={featureStyle}>
          <span style={dotStyle('#FFD700')} />
          <span>Etiquetas, prioridades y estados</span>
        </div>
        <div style={featureStyle}>
          <span style={dotStyle('#E91E63')} />
          <span>Historial completo de conversaciones</span>
        </div>
      </div>

      <div style={lockLineStyle}>
        <Lock size={13} color="#8696A0" strokeWidth={2} />
        Tus mensajes están cifrados
      </div>
    </div>
  );
};