export interface PipelineEtapa {
    id: number;
    nombre: string;
    orden: number;
    color: string;
    activo: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface PipelineEtapaInput {
    nombre: string;
    color?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: any;
}
