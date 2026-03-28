export interface LoginPayload {
    correo: string;
    password: string;
}

export interface UsuarioInfo {
    id_usuario: number;
    nombre_completo: string;
    correo: string;
    rol_id: number;
    nombre_rol: string;
    empresa_id: number | null;
    nombre_empresa: string | null;
    sede_id: number | null;
    nombre_sede: string | null;
}

export interface LoginResponse {
    success: boolean;
    user?: UsuarioInfo;
    token?: string;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface Sistema {
    sede_id: number;
    nombre_sede: string;
    direccion_sede: string | null;
    empresa_id: number;
    nombre_empresa: string | null;
    logo_empresa: string | null;
}

export interface MisSistemasResponse {
    success: boolean;
    sistemas: Sistema[];
    usuario?: {
        nombre_completo: string;
        nombre_rol: string;
    };
    message?: string;
}
