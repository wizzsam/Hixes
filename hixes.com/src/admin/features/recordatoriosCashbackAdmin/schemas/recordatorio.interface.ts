export interface RecordatorioCashback {
  id: number;
  empresa_id: number;
  empresa?: { id: number; razon_social: string };
  tipo_saldo: 'cashback' | 'wallet' | 'ambos';
  canal: string;
  mensaje_plantilla: string;
  dias_antes: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecordatorioCashbackForm {
  empresa_id: number | '';
  tipo_saldo: 'cashback' | 'wallet' | 'ambos';
  canal: string;
  mensaje_plantilla: string;
  dias_antes: number;
  activo: boolean;
}
