export interface ServicioHixes {
    id: number;
    tratamiento: string;
    descripcion: string | null;
    precio_base: number;
    estado: boolean;
    creado_el?: string;
}

export interface ServicioFormInput {
    tratamiento: string;
    descripcion?: string;
    precio_base: number;
    estado?: boolean;
}