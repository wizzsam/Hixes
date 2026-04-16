export interface SedeSimpleI {
    id: number;
    nombre_sede: string;
}

export interface RolSimpleI {
    id: number;
    nombre_rol: string;
}

export interface Usuario {
    id_usuario: number;
    rol_id: number;
    nombre_rol: string;
    roles: RolSimpleI[];
    nombre_completo: string;
    correo: string;
    empresa_id: number | null;
    sede_id: number | null;
    nombre_empresa: string;
    estado: boolean | number;
    creado_el: string | null;
    sedes: SedeSimpleI[];
}
