import { axiosInstance } from '../../../../api/axiosInstance';

export const cambiarEstadoSede = async (id: number): Promise<boolean> => {
    try {
        const response = await axiosInstance.put<{success: boolean}>(`sedes/${id}/estado`);
        return response.data.success;
    } catch (error) {
        console.error('Error al cambiar estado de la sede:', error);
        return false;
    }
};
