export interface Sede {
    id: number;
    empresa_id: number;
    nombre_sede: string;
    direccion_sede: string;
    estado: number;
    created_at?: string;
    updated_at?: string;
    empresa?: {
        id: number;
        razon_social: string; // Assuming based on empresaAdmin
    };
}
