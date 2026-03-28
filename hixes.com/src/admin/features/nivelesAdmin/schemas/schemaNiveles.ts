export interface NivelFormValues {
    nombre: string;
    cashback_porcentaje: number;
    vigencia_dias: number;
    consumo_minimo: number;
    color?: string;
    icono?: string;
    empresa_ids: number[]; // Array para la tabla intermedia
}