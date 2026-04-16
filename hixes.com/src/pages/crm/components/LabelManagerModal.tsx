import { useState, type CSSProperties } from 'react';
import { X, Plus, Pencil, Trash2, Check, Tag } from 'lucide-react';
import type { CrmEtiqueta } from '../services/labelService';
import {
  createEtiqueta,
  updateEtiqueta,
  deleteEtiqueta,
} from '../services/labelService';

interface LabelManagerModalProps {
  etiquetas: CrmEtiqueta[];
  onClose: () => void;
  onUpdate: (etiquetas: CrmEtiqueta[]) => void;
}

const PRESET_COLORS = [
  '#25D366', '#128C7E', '#00A884', '#34B7F1', '#2196F3',
  '#9C27B0', '#E91E63', '#FF5722', '#FF9800', '#FFD700',
  '#F44336', '#8696A0',
];

const overlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const modal: CSSProperties = {
  background: '#202c33',
  borderRadius: 12,
  width: 480,
  maxWidth: '95vw',
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
  overflow: 'hidden',
};

interface FormState {
  nombre: string;
  color: string;
  descripcion: string;
}

const emptyForm = (): FormState => ({ nombre: '', color: '#25D366', descripcion: '' });

export const LabelManagerModal = ({ etiquetas, onClose, onUpdate }: LabelManagerModalProps) => {
  const [items, setItems] = useState<CrmEtiqueta[]>(etiquetas);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── crear ──────────────────────────────────────────────────────────────── */
  const handleCreate = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const nueva = await createEtiqueta({
        nombre: form.nombre.trim(),
        color: form.color,
        descripcion: form.descripcion.trim() || undefined,
      });
      const updated = [...items, nueva];
      setItems(updated);
      onUpdate(updated);
      setForm(emptyForm());
      setShowForm(false);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Error al crear etiqueta');
    } finally {
      setSaving(false);
    }
  };

  /* ── editar ─────────────────────────────────────────────────────────────── */
  const startEdit = (et: CrmEtiqueta) => {
    setEditingId(et.id);
    setForm({ nombre: et.nombre, color: et.color, descripcion: et.descripcion ?? '' });
    setShowForm(false);
    setError(null);
  };

  const handleUpdate = async () => {
    if (!editingId || !form.nombre.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateEtiqueta(editingId, {
        nombre: form.nombre.trim(),
        color: form.color,
        descripcion: form.descripcion.trim() || undefined,
      });
      const newItems = items.map((i) => (i.id === editingId ? updated : i));
      setItems(newItems);
      onUpdate(newItems);
      setEditingId(null);
      setForm(emptyForm());
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Error al actualizar etiqueta');
    } finally {
      setSaving(false);
    }
  };

  /* ── eliminar ───────────────────────────────────────────────────────────── */
  const handleDelete = async (id: number) => {
    setSaving(true);
    setError(null);
    try {
      await deleteEtiqueta(id);
      const newItems = items.filter((i) => i.id !== id);
      setItems(newItems);
      onUpdate(newItems);
      if (editingId === id) { setEditingId(null); setForm(emptyForm()); }
    } catch {
      setError('Error al eliminar etiqueta');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
  };

  const isFormActive = showForm || editingId !== null;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #1f2c34', gap: 10 }}>
          <Tag size={18} color="#00A884" />
          <span style={{ flex: 1, color: '#e9edef', fontWeight: 700, fontSize: 16 }}>Mis etiquetas</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696A0', padding: 4, borderRadius: '50%', display: 'flex' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.length === 0 && !isFormActive && (
            <p style={{ color: '#8696A0', fontSize: 13, textAlign: 'center', margin: '20px 0' }}>
              Aún no tienes etiquetas. Crea la primera.
            </p>
          )}

          {items.map((et) =>
            editingId === et.id ? (
              /* ── formulario de edición inline ── */
              <FormCard
                key={et.id}
                form={form}
                onChange={setForm}
                onSubmit={handleUpdate}
                onCancel={cancelEdit}
                saving={saving}
                mode="edit"
              />
            ) : (
              <div
                key={et.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#111b21',
                  borderRadius: 8,
                  padding: '10px 12px',
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: et.color,
                    flexShrink: 0,
                    border: '2px solid rgba(255,255,255,0.15)',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: '#e9edef', fontWeight: 600, fontSize: 13 }}>{et.nombre}</span>
                  {et.descripcion && (
                    <p style={{ color: '#8696A0', fontSize: 11.5, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {et.descripcion}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => startEdit(et)}
                  disabled={saving}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696A0', padding: 5, borderRadius: 6, display: 'flex' }}
                  title="Editar"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(et.id)}
                  disabled={saving}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CF6679', padding: 5, borderRadius: 6, display: 'flex' }}
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          )}

          {/* Formulario crear */}
          {showForm && (
            <FormCard
              form={form}
              onChange={setForm}
              onSubmit={handleCreate}
              onCancel={() => { setShowForm(false); setForm(emptyForm()); setError(null); }}
              saving={saving}
              mode="create"
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: '#CF6679', fontSize: 12, margin: '0 20px 8px', textAlign: 'center' }}>{error}</p>
        )}

        {/* Footer */}
        {!isFormActive && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #1f2c34' }}>
            <button
              onClick={() => { setShowForm(true); setError(null); }}
              style={{
                width: '100%',
                background: 'rgba(0,168,132,0.15)',
                border: '1px dashed rgba(0,168,132,0.5)',
                borderRadius: 8,
                color: '#00A884',
                fontSize: 13,
                fontWeight: 600,
                padding: '9px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Plus size={15} /> Nueva etiqueta
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Sub-componente formulario ───────────────────────────────────────────────── */
interface FormCardProps {
  form: FormState;
  onChange: (f: FormState) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
  mode: 'create' | 'edit';
}

const FormCard = ({ form, onChange, onSubmit, onCancel, saving, mode }: FormCardProps) => {
  const inputStyle: CSSProperties = {
    background: '#2a3942',
    border: '1px solid #374752',
    borderRadius: 6,
    color: '#e9edef',
    fontSize: 13,
    padding: '7px 10px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ background: '#1a2530', border: '1px solid #374752', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        placeholder="Nombre de la etiqueta *"
        value={form.nombre}
        maxLength={80}
        onChange={(e) => onChange({ ...form, nombre: e.target.value })}
        style={inputStyle}
        autoFocus
      />
      <input
        placeholder="Descripción (opcional)"
        value={form.descripcion}
        maxLength={255}
        onChange={(e) => onChange({ ...form, descripcion: e.target.value })}
        style={inputStyle}
      />

      {/* Selector de color */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onChange({ ...form, color: c })}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: c,
              border: form.color === c ? '2px solid #e9edef' : '2px solid transparent',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {form.color === c && <Check size={11} color="#fff" strokeWidth={3} />}
          </button>
        ))}
        {/* Color personalizado */}
        <input
          type="color"
          value={form.color}
          onChange={(e) => onChange({ ...form, color: e.target.value })}
          title="Color personalizado"
          style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer', background: 'none' }}
        />
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{ background: 'none', border: '1px solid #374752', borderRadius: 6, color: '#8696A0', fontSize: 12, padding: '6px 14px', cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          disabled={saving || !form.nombre.trim()}
          style={{
            background: '#00A884',
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            padding: '6px 16px',
            cursor: saving || !form.nombre.trim() ? 'not-allowed' : 'pointer',
            opacity: saving || !form.nombre.trim() ? 0.6 : 1,
          }}
        >
          {saving ? 'Guardando…' : mode === 'create' ? 'Crear' : 'Guardar'}
        </button>
      </div>
    </div>
  );
};
