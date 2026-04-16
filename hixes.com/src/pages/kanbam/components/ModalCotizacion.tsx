import { useState, useRef, type FormEvent, type CSSProperties } from 'react';
import { X, FileText, Link, Upload, FileImage, Trash2 } from 'lucide-react';

interface Props {
  titulo: string;
  onConfirm: (nota: string, files: File[]) => void;
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
  maxWidth: 480,
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

export default function ModalCotizacion({ titulo, onConfirm, onCancel }: Props) {
  const [nota, setNota] = useState('');
  const [link, setLink] = useState('');
  const [files, setFiles] = useState<File[]>([]);
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
    const combined = [nota.trim(), link.trim()].filter(Boolean).join('\n');
    onConfirm(combined, files);
  }

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={card} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#f59e0b20', borderRadius: 8, padding: 8, display: 'flex' }}>
              <FileText size={20} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Adjuntar cotización</div>
              <div style={{ fontSize: 12, color: '#8696A0', marginTop: 2 }}>{titulo}</div>
            </div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696A0', padding: 0 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Nota o descripción de la cotización</label>
            <textarea
              autoFocus
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="Descripción del servicio cotizado, condiciones, precio, etc."
              style={{ ...inp, resize: 'vertical', minHeight: 80 }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: 5 } as CSSProperties}>
              <Link size={11} color="#8696A0" />
              Link de la cotización (captura, Drive, PDF…)
            </label>
            <input
              type="text"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://drive.google.com/…"
              style={inp}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Archivos adjuntos (opcional)</label>
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              style={{
                border: `2px dashed ${dragging ? '#f59e0b' : '#374752'}`,
                borderRadius: 8,
                padding: '14px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? '#2a2010' : '#1a2530',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <Upload size={18} color="#8696A0" style={{ margin: '0 auto 6px', display: 'block' }} />
              <p style={{ fontSize: 12, color: '#8696A0', margin: 0 }}>
                Arrastra archivos o <span style={{ color: '#f59e0b' }}>haz clic para seleccionar</span>
              </p>
              <p style={{ fontSize: 11, color: '#556268', margin: '3px 0 0' }}>JPG, PNG, PDF — máx 10 MB c/u</p>
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
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {files.map((file, i) => {
                  const isPdf = file.type === 'application/pdf';
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: '#2a3942', borderRadius: 6, padding: '6px 10px',
                    }}>
                      {isPdf
                        ? <FileText size={13} color="#f87171" />
                        : <FileImage size={13} color="#f59e0b" />
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

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} style={{
              background: '#2a3942', border: 'none', borderRadius: 8,
              color: '#8696A0', padding: '8px 20px', fontSize: 14, cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button type="submit" style={{
              background: '#f59e0b', border: 'none', borderRadius: 8,
              color: '#111', padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              {files.length > 0
                ? `Adjuntar ${files.length} archivo${files.length > 1 ? 's' : ''} y mover`
                : 'Mover a Cotización enviada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
