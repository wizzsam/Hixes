import { axiosInstance } from '../../../../api/axiosInstance';

export const eliminarRol = async (id: number): Promise<boolean> => {
    try {
        const response = await axiosInstance.delete<{success: boolean}>(`roles/${id}`);
        return response.data.success;
    } catch (error) {
        console.error('Error al eliminar rol:', error);
        return false;
    }
};
