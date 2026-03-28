import { axiosInstance } from '../../../../api/axiosInstance';
import type { Nivel } from '../schemas/niveles.interface';

export const listarNiveles = async (): Promise<Nivel[]> => {
    try {
        // Hacemos el GET al endpoint 'niveles' que definimos en api.php
        const response = await axiosInstance.get<{ success: boolean, data: Nivel[] }>('niveles');
        
        if (response.data.success) {
            return response.data.data;
        }
        
        return [];
    } catch (error: any) {
        const mensaje = error.response?.data?.message || 'Error al cargar el catálogo de niveles.';
        throw new Error(mensaje);
    }
};