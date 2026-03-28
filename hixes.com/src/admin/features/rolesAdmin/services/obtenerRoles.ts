import { axiosInstance } from '../../../../api/axiosInstance';
import type { Rol } from '../schemas/rol.interface';

export const obtenerRoles = async (): Promise<Rol[]> => {
    try {
        const response = await axiosInstance.get<{success: boolean, data: Rol[]}>('roles');
        return response.data.data || [];
    } catch (error) {
        console.error('Error al listar roles:', error);
        return [];
    }
};
