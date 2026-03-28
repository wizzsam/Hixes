import { axiosInstance } from '../../../../api/axiosInstance';

export const eliminarSede = async (id: number): Promise<boolean> => {
    try {
        const response = await axiosInstance.delete<{success: boolean}>(`sedes/${id}`);
        return response.data.success;
    } catch (error) {
        console.error('Error al eliminar sede:', error);
        return false;
    }
};
