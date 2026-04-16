import { axiosWithoutMultipart } from '../../../api/axiosInstance';

export interface CrmEtiqueta {
  id: number;
  usuario_id: number;
  nombre: string;
  color: string;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmConversacionEtiqueta {
  id: number;
  phone: string;
  etiqueta_id: number;
  usuario_id: number;
  etiqueta: CrmEtiqueta;
}

// ─── Etiquetas del usuario ────────────────────────────────────────────────────

export const getEtiquetas = async (): Promise<CrmEtiqueta[]> => {
  const { data } = await axiosWithoutMultipart.get<CrmEtiqueta[]>('/crm/etiquetas');
  return data;
};

export const createEtiqueta = async (payload: {
  nombre: string;
  color: string;
  descripcion?: string;
}): Promise<CrmEtiqueta> => {
  const { data } = await axiosWithoutMultipart.post<CrmEtiqueta>('/crm/etiquetas', payload);
  return data;
};

export const updateEtiqueta = async (
  id: number,
  payload: { nombre?: string; color?: string; descripcion?: string }
): Promise<CrmEtiqueta> => {
  const { data } = await axiosWithoutMultipart.put<CrmEtiqueta>(`/crm/etiquetas/${id}`, payload);
  return data;
};

export const deleteEtiqueta = async (id: number): Promise<void> => {
  await axiosWithoutMultipart.delete(`/crm/etiquetas/${id}`);
};

// ─── Asignaciones a conversaciones ───────────────────────────────────────────

export const getAsignaciones = async (): Promise<CrmConversacionEtiqueta[]> => {
  const { data } = await axiosWithoutMultipart.get<CrmConversacionEtiqueta[]>(
    '/crm/conversacion-etiquetas'
  );
  return data;
};

export const asignarEtiqueta = async (
  phone: string,
  etiqueta_id: number
): Promise<CrmConversacionEtiqueta> => {
  const { data } = await axiosWithoutMultipart.post<CrmConversacionEtiqueta>(
    '/crm/conversacion-etiquetas',
    { phone, etiqueta_id }
  );
  return data;
};

export const desasignarEtiqueta = async (asignacionId: number): Promise<void> => {
  await axiosWithoutMultipart.delete(`/crm/conversacion-etiquetas/${asignacionId}`);
};
