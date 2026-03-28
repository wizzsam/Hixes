import { axiosInstance } from '../../../../api/axiosInstance';

export interface Rol {
    id: number;
    nombre_rol: string;
    descripcion?: string;
}

export const obtenerRoles = async (): Promise<Rol[]> => {
    try {
        const response = await axiosInstance.get<{success: boolean, data: Rol[]}>('roles');
        return response.data.data || [];
    } catch (error) {
        console.error('Error al listar roles:', error);
        return [];
    }
};
