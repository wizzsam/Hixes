import { useState, type CSSProperties } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';

interface RegisterContactModalProps {
  phone: string;
  onConfirm: (nombreCompleto: string, dni: string) => Promise<void>;
  onClose: () => void;
}

export const RegisterContactModal = ({
  phone,
  onConfirm,
  onClose,
}: RegisterContactModalProps) => {
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !dni.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await onConfirm(nombre.trim(), dni.trim());
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.errors?.dni?.[0] ??
        'Error al registrar el cliente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Estilos ──────────────────────────────────────────────────────────────────
  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(2px)',
  };

  const cardStyle: CSSProperties = {
    background: '#202c33',
    borderRadius: 14,
    padding: '28px 28px 24px',
    width: '100%',
    maxWidth: 420,
    margin: '0 16px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    position: 'relative',
  };

  const closeBtnStyle: CSSProperties = {
    position: 'absolute',
    top: 14,
    right: 14,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#8696A0',
    padding: 6,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const titleStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: '#e9edef',
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 6,
  };

  const subtitleStyle: CSSProperties = {
    color: '#8696A0',
    fontSize: 12.5,
    marginBottom: 22,
  };

  const phonePillStyle: CSSProperties = {
    display: 'inline-block',
    background: 'rgba(37,211,102,0.12)',
    color: '#25D366',
    borderRadius: 6,
    padding: '2px 8px',
    fontFamily: 'monospace',
    fontSize: 13,
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    color: '#8696A0',
    fontSize: 12,
    marginBottom: 5,
    fontWeight: 500,
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    background: '#2a3942',
    border: '1px solid #374752',
    borderRadius: 8,
    color: '#e9edef',
    fontSize: 14,
    padding: '9px 12px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: 14,
  };

  const errorStyle: CSSProperties = {
    background: 'rgba(255,59,48,0.12)',
    color: '#ff6b6b',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 12.5,
    marginBottom: 16,
  };

  const btnRowStyle: CSSProperties = {
    display: 'flex',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 4,
  };

  const cancelBtnStyle: CSSProperties = {
    background: 'none',
    border: '1px solid #374752',
    borderRadius: 8,
    color: '#8696A0',
    padding: '8px 18px',
    cursor: 'pointer',
    fontSize: 13.5,
    fontWeight: 500,
  };

  const confirmBtnStyle: CSSProperties = {
    background: loading ? '#1a7a4a' : '#00A884',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    padding: '8px 18px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: 13.5,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    opacity: loading ? 0.8 : 1,
  };

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={cardStyle}>
        <button
          style={closeBtnStyle}
          onClick={onClose}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#374752'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
        >
          <X size={18} />
        </button>

        <div style={titleStyle}>
          <UserPlus size={20} color="#00A884" />
          Agendar como cliente
        </div>
        <p style={subtitleStyle}>
          Número:{' '}
          <span style={phonePillStyle}>{phone}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Nombre completo *</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="Ej: María García Quispe"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoFocus
            required
          />

          <label style={labelStyle}>DNI *</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="8 dígitos"
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
            inputMode="numeric"
            maxLength={8}
            required
          />

          {error && <div style={errorStyle}>{error}</div>}

          <div style={btnRowStyle}>
            <button type="button" style={cancelBtnStyle} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" style={confirmBtnStyle} disabled={loading}>
              {loading && <Loader2 size={14} className="spin" />}
              Registrar cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
