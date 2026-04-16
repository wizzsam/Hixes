import { useState, useRef, type FormEvent, type CSSProperties } from 'react';
import { X, Receipt, Upload, FileImage, FileText, Trash2 } from 'lucide-react';

interface Props {
  titulo: string;
  onConfirm: (files: File[], nota?: string) => void;
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
  maxWidth: 520,
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

export default function ModalComprobante({ titulo, onConfirm, onCancel }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [nota, setNota] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    setFiles(prev => [...prev, ...Array.from(newFiles)]);
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onConfirm(files, nota.trim() || undefined);
  }

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={card} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#10b98120', borderRadius: 8, padding: 8, display: 'flex' }}>
              <Receipt size={20} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Adjuntar comprobante de pago</div>
              <div style={{ fontSize: 12, color: '#8696A0', marginTop: 2 }}>{titulo}</div>
            </div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696A0', padding: 0 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Comprobante(s) de pago</label>
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              style={{
                border: `2px dashed ${dragging ? '#00A884' : '#374752'}`,
                borderRadius: 8,
                padding: '20px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? '#1a2d2a' : '#1a2530',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <Upload size={22} color="#8696A0" style={{ margin: '0 auto 8px', display: 'block' }} />
              <p style={{ fontSize: 12, color: '#8696A0', margin: 0 }}>
                Arrastra archivos aquí o <span style={{ color: '#00A884' }}>haz clic para seleccionar</span>
              </p>
              <p style={{ fontSize: 11, color: '#556268', margin: '4px 0 0' }}>JPG, PNG, PDF — máx 10 MB c/u</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                style={{ display: 'none' }}
                onChange={e => addFiles(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {files.map((file, i) => {
                  const isPdf = file.type === 'application/pdf';
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: '#2a3942', borderRadius: 6, padding: '7px 10px',
                    }}>
                      {isPdf
                        ? <FileText size={14} color="#f87171" />
                        : <FileImage size={14} color="#00A884" />
                      }
                      <span style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </span>
                      <span style={{ fontSize: 11, color: '#8696A0', flexShrink: 0 }}>
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                      <button type="button" onClick={() => removeFile(i)} style={{
                        background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: 2,
                      }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Nota adicional (opcional)</label>
            <input
              type="text"
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="Ej. Pago con tarjeta + efectivo"
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
              background: '#10b981', border: 'none', borderRadius: 8,
              color: '#fff', padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              {files.length > 0
                ? `Adjuntar ${files.length} archivo${files.length > 1 ? 's' : ''} y cerrar venta`
                : 'Cerrar venta sin comprobante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
