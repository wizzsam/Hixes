import { axiosInstance } from '../../../../api/axiosInstance';
import type { Sede } from '../schemas/sedes.interface';

export const obtenerSedes = async (): Promise<Sede[]> => {
    try {
        const response = await axiosInstance.get<{success: boolean, data: Sede[]}>('sedes');
        return response.data.data || [];
    } catch (error) {
        console.error('Error al listar sedes:', error);
        return [];
    }
};
