import { axiosInstance } from '../../../../api/axiosInstance';

export const cambiarEstadoNivel = async (id: number): Promise<boolean> => {
    try {
        const response = await axiosInstance.patch<{success: boolean}>(`niveles/${id}/estado`);
        return response.data.success;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Error al cambiar estado.');
    }
};