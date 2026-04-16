import { useEffect, useRef, type CSSProperties } from 'react';
import { Check, Tag } from 'lucide-react';
import type { CrmEtiqueta, CrmConversacionEtiqueta } from '../services/labelService';
import { asignarEtiqueta, desasignarEtiqueta } from '../services/labelService';

interface AssignLabelMenuProps {
  phone: string;
  etiquetas: CrmEtiqueta[];
  asignaciones: CrmConversacionEtiqueta[];
  onUpdate: (asignaciones: CrmConversacionEtiqueta[]) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export const AssignLabelMenu = ({
  phone,
  etiquetas,
  asignaciones,
  onUpdate,
  onClose,
  anchorRef,
}: AssignLabelMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const phoneAsignaciones = asignaciones.filter((a) => a.phone === phone);
  const assignedIds = new Set(phoneAsignaciones.map((a) => a.etiqueta_id));

  /* Cerrar con click fuera */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorRef]);

  const toggle = async (et: CrmEtiqueta) => {
    const existing = phoneAsignaciones.find((a) => a.etiqueta_id === et.id);
    if (existing) {
      await desasignarEtiqueta(existing.id);
      onUpdate(asignaciones.filter((a) => a.id !== existing.id));
    } else {
      const nueva = await asignarEtiqueta(phone, et.id);
      onUpdate([...asignaciones, nueva]);
    }
  };

  const menuStyle: CSSProperties = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 6,
    background: '#202c33',
    borderRadius: 10,
    boxShadow: '0 4px 24px rgba(0,0,0,0.55)',
    border: '1px solid #2a3942',
    minWidth: 200,
    zIndex: 1000,
    overflow: 'hidden',
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <div style={menuStyle}>
        <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #2a3942' }}>
          <Tag size={13} color="#00A884" />
          <span style={{ color: '#8696A0', fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Asignar etiquetas
          </span>
        </div>

        {etiquetas.length === 0 ? (
          <p style={{ color: '#8696A0', fontSize: 12, padding: '12px 14px', margin: 0 }}>
            No tienes etiquetas. Créalas desde el panel.
          </p>
        ) : (
          <div style={{ padding: '4px 0' }}>
            {etiquetas.map((et) => (
              <button
                key={et.id}
                onClick={() => toggle(et)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2a3942'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
              >
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: et.color, flexShrink: 0 }} />
                <span style={{ flex: 1, color: '#e9edef', fontSize: 13 }}>{et.nombre}</span>
                {assignedIds.has(et.id) && <Check size={13} color="#00A884" strokeWidth={3} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
