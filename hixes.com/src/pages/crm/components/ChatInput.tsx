import { useRef, useState, useEffect, type CSSProperties, type KeyboardEvent } from 'react';
import { Smile, Paperclip, Send, X, FileText } from 'lucide-react';

interface PendingMedia {
  file: File;
  localUrl: string;
  kind: 'image' | 'video' | 'document';
}

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: (msg: string) => void;
  onSendMedia?: (file: File) => void;
}

export const ChatInput = ({ value, onChange, onSend, onSendMedia }: ChatInputProps) => {
  const textareaRef   = useRef<HTMLTextAreaElement>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia | null>(null);

  useEffect(() => {
    return () => { if (pendingMedia) URL.revokeObjectURL(pendingMedia.localUrl); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMedia]);

  const hasText    = value.trim().length > 0;
  const hasPending = pendingMedia !== null;
  const canSend    = hasPending || hasText;

  const fileKind = (file: File): PendingMedia['kind'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  // ─── Enviar ─────────────────────────────────────────────────────────────
  const handleSend = () => {
    if (hasPending) {
      onSendMedia?.(pendingMedia!.file);
      if (value.trim()) onSend(value.trim());
      setPendingMedia(null);
      onChange('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      return;
    }
    if (!value.trim()) return;
    onSend(value.trim());
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (pendingMedia) URL.revokeObjectURL(pendingMedia.localUrl);
      setPendingMedia({ file, localUrl: URL.createObjectURL(file), kind: fileKind(file) });
    }
    e.target.value = '';
  };

  const cancelPending = () => {
    if (pendingMedia) URL.revokeObjectURL(pendingMedia.localUrl);
    setPendingMedia(null);
  };

  // ─── Estilos ────────────────────────────────────────────────────────────
  const iconBtnStyle: CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', padding: 8,
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0,
  };

  const previewBarStyle: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 14px', background: '#1d2b34', borderTop: '1px solid #1f2c34',
  };

  const barStyle: CSSProperties = {
    display: 'flex', alignItems: 'flex-end', gap: 6,
    padding: '8px 12px', background: '#202c33',
    borderTop: hasPending ? 'none' : '1px solid #1f2c34', flexShrink: 0,
  };

  const inputWrapStyle: CSSProperties = {
    flex: 1, background: '#2a3942', borderRadius: 10,
    padding: '8px 14px', display: 'flex', alignItems: 'center',
  };

  const textareaStyle: CSSProperties = {
    width: '100%', background: 'none', border: 'none', outline: 'none',
    resize: 'none', fontSize: 14.5, color: '#d1d7db', lineHeight: 1.5,
    fontFamily: 'inherit', caretColor: '#00A884', maxHeight: 120, overflowY: 'auto',
  };

  const sendBtnStyle: CSSProperties = {
    width: 42, height: 42, borderRadius: '50%',
    background: '#00A884',
    border: 'none', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    transition: 'background 0.15s',
    boxShadow: '0 2px 6px rgba(0,168,132,0.35)',
  };

  const placeholder = hasPending ? 'Agrega un pie de foto (opcional)' : 'Escribe un mensaje';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

      {/* ── Barra de previsualización ── */}
      {hasPending && (
        <div style={previewBarStyle}>
          <button style={{ ...iconBtnStyle, padding: 4 }} onClick={cancelPending} title="Cancelar">
            <X size={18} color="#8696A0" strokeWidth={2.5} />
          </button>
          {pendingMedia!.kind === 'image' && (
            <img src={pendingMedia!.localUrl} alt="preview"
              style={{ height: 60, maxWidth: 90, borderRadius: 6, objectFit: 'cover' }} />
          )}
          {pendingMedia!.kind === 'video' && (
            <video src={pendingMedia!.localUrl}
              style={{ height: 60, maxWidth: 100, borderRadius: 6 }} />
          )}
          {pendingMedia!.kind === 'document' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
              <FileText size={22} color="#00A884" strokeWidth={1.8} style={{ flexShrink: 0 }} />
              <span style={{
                color: '#e9edef', fontSize: 13,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {pendingMedia!.file.name}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Barra principal ── */}
      <div style={barStyle}>
        {/* Emoji (decorativo) */}
        <button style={iconBtnStyle} title="Emoji"
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#374752'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}>
          <Smile size={22} color="#8696A0" strokeWidth={1.8} />
        </button>

        {/* Adjuntar archivo */}
        <input ref={fileInputRef} type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
          style={{ display: 'none' }} onChange={handleFileChange} />
        <button style={iconBtnStyle} title="Adjuntar archivo"
          onClick={() => fileInputRef.current?.click()}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#374752'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}>
          <Paperclip size={20} color="#8696A0" strokeWidth={1.8} />
        </button>

        <div style={inputWrapStyle}>
          <textarea ref={textareaRef} rows={1} style={textareaStyle}
            placeholder={placeholder} value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown} onInput={handleInput} />
        </div>

        <button
          style={sendBtnStyle}
          onClick={handleSend}
          title="Enviar"
          disabled={!canSend}
        >
          <Send size={20} color="#fff" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};
