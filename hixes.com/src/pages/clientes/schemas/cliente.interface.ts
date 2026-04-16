// ─── Niveles del programa HEXIS ───────────────────────────────────────────────

export interface Nivel {
  id: number;
  nombre: string;
  cashback_porcentaje: number;
  vigencia_dias: number;
  consumo_minimo: number;
  color: string;
  icono: string;
}

// ─── Cliente ──────────────────────────────────────────────────────────────────

export interface Cliente {
  id: number;
  nombre_completo: string;
  dni: string;
  telefono: string;
  correo?: string;
  empresa?: string;
  sede_id?: number;
  sede?: { id: number; nombre_sede: string };
  estado: boolean;
  con_beneficios?: boolean;
  wallet: number;       // saldo recargable
  wallet_vence?: string;
  cashback: number;     // saldo cashback acumulado
  cashback_vence?: string;
  consumo_acumulado: number;
  created_at: string;    // ISO date string
}

export interface Transaccion {
  id:          number;
  cliente_id:  number;
  sede_id?:    number;
  sede?:       { id: number; nombre_sede: string };
  tipo:        'consumo' | 'recarga_wallet' | 'pago_saldo' | 'cashback' | 'cashback_expirado' | 'wallet_expirado';
  descripcion: string;
  monto:       number;
  fecha:       string;
  vence_at?:   string;
  expirado?:   boolean;
  consumido?:  boolean;
}
