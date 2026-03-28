export interface Empresa {
    id: number;
    ruc: string;
    razon_social: string;
    nombre_comercial?: string | null;
    direccion: string;
    telefono: string;
    estado: number;
    logo_path?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface EmpresaInput {
    ruc: string;
    razon_social: string;
    nombre_comercial?: string;
    direccion: string;
    telefono: string;
    estado: number;
    logo_path?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: any;
}
