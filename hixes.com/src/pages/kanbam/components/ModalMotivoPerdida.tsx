import { useState, type CSSProperties, type FormEvent } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface Props {
  titulo: string;
  onConfirm: (motivo: string) => void;
  onCancel: () => void;
}

const overlay: CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1100,
};

const card: CSSProperties = {
  background: '#202c33',
  borderRadius: 12,
  padding: '28px 32px',
  width: '100%',
  maxWidth: 440,
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  color: '#e9edef',
};

export default function ModalMotivoPerdida({ titulo, onConfirm, onCancel }: Props) {
  const [motivo, setMotivo] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onConfirm(motivo.trim());
  }

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={card} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#f8717120', borderRadius: 8, padding: 8, display: 'flex' }}>
              <AlertTriangle size={20} color="#f87171" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e9edef' }}>Oportunidad perdida</div>
              <div style={{ fontSize: 12, color: '#8696A0', marginTop: 2 }}>{titulo}</div>
            </div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696A0', padding: 0 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 12, color: '#8696A0', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ¿Por qué se perdió esta oportunidad?
          </label>
          <textarea
            autoFocus
            placeholder="Ej. El cliente eligió otra empresa, precio fuera de presupuesto…"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            style={{
              width: '100%',
              background: '#2a3942',
              border: '1px solid #374752',
              borderRadius: 8,
              padding: '10px 12px',
              color: '#e9edef',
              fontSize: 14,
              outline: 'none',
              resize: 'vertical',
              minHeight: 96,
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
          <p style={{ fontSize: 11, color: '#8696A0', margin: '6px 0 20px' }}>
            El motivo quedará registrado en el historial de la oportunidad.
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1, padding: '9px 0',
                background: 'none', border: '1px solid #374752',
                borderRadius: 8, color: '#8696A0',
                fontSize: 14, cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                flex: 1, padding: '9px 0',
                background: '#f87171', border: 'none',
                borderRadius: 8, color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Marcar como perdida
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}