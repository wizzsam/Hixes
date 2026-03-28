import { axiosInstance } from '../../../../api/axiosInstance';
import type { Usuario } from '../schemas/usuario.interface';

export const obtenerUsuarios = async (): Promise<Usuario[]> => {
    try {
        const response = await axiosInstance.get<{success: boolean, data: Usuario[]}>('usuarios');
        return response.data.data || [];
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        return [];
    }
};
