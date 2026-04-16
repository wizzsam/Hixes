import { useState, type FormEvent, type CSSProperties } from 'react';
import { X, UserCheck } from 'lucide-react';

interface Props {
  clienteNombre: string;
  clienteActual: {
    nombre_completo?: string | null;
    dni?: string | null;
    correo?: string | null;
    telefono?: string | null;
    empresa?: string | null;
  };
  onConfirm: (data: {
    nombre_completo?: string;
    dni?: string;
    correo?: string;
    telefono?: string;
    empresa?: string;
  }) => void;
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
  fontFamily: 'inherit',
};

const lbl: CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: '#8696A0',
  marginBottom: 5,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

export default function ModalContactado({ clienteNombre, clienteActual, onConfirm, onCancel }: Props) {
  // "Prospecto" clients have a generated nombre_completo like "Prospecto 51901969217"
  const isProspecto = !clienteActual.nombre_completo || /^prospecto\s/i.test(clienteActual.nombre_completo);
  const missingNombre   = isProspecto;
  const missingDni      = !clienteActual.dni;
  const missingCorreo   = !clienteActual.correo;
  const missingTelefono = !clienteActual.telefono;

  const [nombre, setNombre]     = useState('');
  const [dni, setDni]           = useState('');
  const [correo, setCorreo]     = useState(clienteActual.correo ?? '');
  const [telefono, setTelefono] = useState(clienteActual.telefono ?? '');
  const [empresa, setEmpresa]   = useState(clienteActual.empresa ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data: Parameters<typeof onConfirm>[0] = {};
    if (missingNombre)   data.nombre_completo = nombre;
    if (missingDni && dni)    data.dni    = dni;
    if (missingCorreo && correo)   data.correo   = correo;
    if (missingTelefono && telefono) data.telefono = telefono;
    data.empresa = empresa || undefined;
    onConfirm(data);
  }

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={card} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#00A88420', borderRadius: 8, padding: 8, display: 'flex' }}>
              <UserCheck size={20} color="#00A884" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Completar datos de contacto</div>
              <div style={{ fontSize: 12, color: '#8696A0', marginTop: 2 }}>{clienteNombre}</div>
            </div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696A0', padding: 0 }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: 12, color: '#8696A0', marginBottom: 16 }}>
          Para pasar a "Contactado" completa los datos que faltan del cliente.
        </p>

        <form onSubmit={handleSubmit}>
          {missingNombre && (
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Nombres completos <span style={{ color: '#f87171' }}>*</span></label>
              <input
                type="text"
                autoFocus
                required
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Juan Pérez"
                style={inp}
              />
            </div>
          )}
          {missingDni && (
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>DNI <span style={{ color: '#8696A0', fontSize: 11, textTransform: 'none' }}>(8 dígitos)</span></label>
              <input
                type="text"
                autoFocus={!missingNombre}
                value={dni}
                onChange={e => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="12345678"
                maxLength={8}
                inputMode="numeric"
                style={inp}
              />
            </div>
          )}
          {missingCorreo && (
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Correo electrónico <span style={{ color: '#8696A0', fontSize: 11 }}>(opcional)</span></label>
              <input
                type="email"
                autoFocus={!missingNombre && !missingDni}
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                placeholder="cliente@ejemplo.com"
                style={inp}
              />
            </div>
          )}
          {missingTelefono && (
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Número de teléfono</label>
              <input
                type="tel"
                autoFocus={!missingNombre && !missingDni && !missingCorreo}
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="+51 999 999 999"
                style={inp}
              />
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Empresa <span style={{ color: '#8696A0', fontSize: 11, textTransform: 'none' }}>(opcional)</span></label>
            <input
              type="text"
              value={empresa}
              onChange={e => setEmpresa(e.target.value)}
              placeholder="Empresa donde trabaja"
              style={inp}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} style={{
              background: '#2a3942', border: 'none', borderRadius: 8,
              color: '#8696A0', padding: '8px 20px', fontSize: 14, cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button type="submit" style={{
              background: '#00A884', border: 'none', borderRadius: 8,
              color: '#fff', padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              Guardar y mover
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
