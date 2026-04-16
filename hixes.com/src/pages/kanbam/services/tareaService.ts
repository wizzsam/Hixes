import { axiosWithoutMultipart } from '../../../api/axiosInstance';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface TareaAsignado {
  id: number;
  nombre_completo: string;
}

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string | null;
  estado: 'pendiente' | 'completada';
  fecha_vencimiento: string;
  minutos_aviso: number;
  notificado: boolean;
  oportunidad_id: number | null;
  cliente_id: number | null;
  asignado_a: number | null;
  asignado: TareaAsignado | null;
}

export interface NuevaTarea {
  titulo: string;
  descripcion?: string;
  fecha_vencimiento: string;
  minutos_aviso: number;
  oportunidad_id?: number | null;
  cliente_id?: number | null;
  asignado_a?: number | null;
}

// ─── Llamadas a la API ────────────────────────────────────────────────────────

export async function fetchTareas(params?: { oportunidad_id?: number; cliente_id?: number }): Promise<Tarea[]> {
  const { data } = await axiosWithoutMultipart.get<Tarea[]>('/tareas', { params });
  return data;
}

export async function fetchTodasLasTareas(): Promise<Tarea[]> {
  const { data } = await axiosWithoutMultipart.get<Tarea[]>('/tareas');
  return data;
}

export async function createTarea(payload: NuevaTarea): Promise<Tarea> {
  const { data } = await axiosWithoutMultipart.post<Tarea>('/tareas', payload);
  return data;
}

export async function completarTarea(id: number): Promise<Tarea> {
  const { data } = await axiosWithoutMultipart.patch<Tarea>(`/tareas/${id}/estado`, { estado: 'completada' });
  return data;
}

export async function deleteTarea(id: number): Promise<void> {
  await axiosWithoutMultipart.delete(`/tareas/${id}`);
}
