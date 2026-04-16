export type FrecuenciaRecordatorio = 'una_vez' | 'semanal' | 'quincenal';

export interface CampanaEtapa {
  id: number;
  nombre: string;
  orden: number;
  color: string;
  total: number;
}

export interface Campana {
  id: number;
  empresa_id: number;
  empresa_nombre: string | null;
  nombre: string;
  descripcion: string | null;
  fecha_inicio: string;     // YYYY-MM-DD
  fecha_fin: string;        // YYYY-MM-DD
  mensaje_recordatorio: string | null;
  frecuencia_recordatorio: FrecuenciaRecordatorio | null;
  activo: boolean;
  vigente: boolean;
  total_clientes: number;
  etapas: CampanaEtapa[];
}

export interface CampanaForm {
  empresa_id: number | '';
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  mensaje_recordatorio: string;
  frecuencia_recordatorio: FrecuenciaRecordatorio | '';
  activo: boolean;
}

export interface EtapaForm {
  nombre: string;
  color: string;
  orden?: number;
}
