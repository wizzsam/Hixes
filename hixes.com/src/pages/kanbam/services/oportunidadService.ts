import { axiosInstance, axiosWithoutMultipart } from '../../../api/axiosInstance';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type FiltroFecha = 'semana' | 'mes' | 'todo';

export interface HistorialEntry {
  id: number;
  accion: 'creacion' | 'cambio_etapa' | 'cambio_estado';
  etapa_anterior: string | null;
  etapa_nueva: string | null;
  estado_anterior: string | null;
  estado_nuevo: string | null;
  notas: string | null;
  archivos: Array<{ nombre: string; url: string }> | null;
  usuario: { nombre_completo: string } | null;
  created_at: string;
}

export const ETAPAS = [
  'Nuevo lead',
  'Contactado',
  'Cotización enviada',
  'Negociación',
  'Venta cerrada',
  'Oportunidad perdida',
];

export type Etapa = string;

export interface PipelineEtapaDTO {
  id: number;
  nombre: string;
  color: string;
  orden: number;
  activo: boolean;
}

export async function fetchPipelineEtapas(): Promise<PipelineEtapaDTO[]> {
  try {
    const { data } = await axiosWithoutMultipart.get<{ success: boolean; data: PipelineEtapaDTO[] }>('/pipeline-etapas');
    return (data.data ?? []).filter(e => e.activo).sort((a, b) => a.orden - b.orden);
  } catch {
    return ETAPAS.map((nombre, i) => ({ id: i + 1, nombre, color: '#64748b', orden: i + 1, activo: true }));
  }
}

export interface OportunidadCliente {
  id: number;
  nombre_completo: string;
  dni?: string | null;
  correo?: string | null;
  telefono?: string | null;
  empresa?: string | null;
}

export interface OportunidadVendedor {
  id: number;
  nombre_completo: string;
}

export interface ServicioItem {
  id: number;
  tratamiento: string;
  precio_base: number;
  cantidad?: number;
}

export interface Oportunidad {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha_proxima: string | null;
  valor_estimado: number;
  etapa: Etapa;
  estado: 'abierta' | 'ganada' | 'perdida';
  cliente: OportunidadCliente | null;
  vendedor: OportunidadVendedor | null;
  servicios: ServicioItem[];
  created_at: string;
}

export interface NuevaOportunidad {
  cliente_id: number;
  vendedor_id?: number | null;
  titulo: string;
  descripcion?: string;
  fecha_proxima?: string;
  valor_estimado?: number;
  etapa?: Etapa;
  servicios_ids?: number[];
  servicios?: { id: number; cantidad: number }[];
}

// ─── Llamadas a la API ────────────────────────────────────────────────────────

export async function fetchOportunidades(filtro: FiltroFecha = 'semana'): Promise<Oportunidad[]> {
  const params: Record<string, string> = {};
  if (filtro === 'mes') {
    const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    params.desde = d.toISOString().split('T')[0];
  } else if (filtro === 'todo') {
    params.desde = 'all';
  }
  // 'semana' → no params, el backend filtra últimos 7 días por defecto
  const { data } = await axiosWithoutMultipart.get<Oportunidad[]>('/oportunidades', { params });
  return data;
}

export async function createOportunidad(payload: NuevaOportunidad): Promise<Oportunidad> {
  const { data } = await axiosWithoutMultipart.post<Oportunidad>('/oportunidades', payload);
  return data;
}

export async function updateEtapa(id: number, etapa: Etapa, nota?: string): Promise<void> {
  await axiosWithoutMultipart.patch(`/oportunidades/${id}/etapa`, { etapa, nota });
}

export async function updateEtapaConArchivos(
  id: number,
  etapa: Etapa,
  files: File[],
  nota?: string,
): Promise<void> {
  const form = new FormData();
  form.append('etapa', etapa);
  if (nota) form.append('nota', nota);
  files.forEach(f => form.append('archivos[]', f));
  // Using axiosInstance (multipart) via the POST endpoint
  await axiosInstance.post(`/oportunidades/${id}/etapa-archivos`, form);
}

export async function actualizarClienteContacto(
  clienteId: number,
  data: { nombre_completo?: string; dni?: string; correo?: string; telefono?: string; empresa?: string },
): Promise<void> {
  await axiosWithoutMultipart.patch(`/clientes/${clienteId}/contacto`, data);
}

export async function updateEstado(
  id: number,
  estado: 'ganada' | 'perdida',
  motivo?: string,
): Promise<void> {
  await axiosWithoutMultipart.patch(`/oportunidades/${id}/estado`, { estado, motivo });
}

export async function fetchHistorial(id: number): Promise<HistorialEntry[]> {
  const { data } = await axiosWithoutMultipart.get<{ data: HistorialEntry[] } | HistorialEntry[]>(
    `/oportunidades/${id}/historial`,
  );
  return Array.isArray(data) ? data : (data as { data: HistorialEntry[] }).data ?? [];
}
