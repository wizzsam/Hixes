import { axiosWithoutMultipart } from '../../../../api/axiosInstance';

export const cambiarEstadoUsuario = async (id: number): Promise<boolean> => {
    try {
        const response = await axiosWithoutMultipart.put<{success: boolean}>(`usuarios/${id}/estado`);
        return response.data.success;
    } catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        return false;
    }
};
