import { axiosAuth } from '../../../../api/axiosInstance';

export const cambiarEstadoServicio = async (id: number): Promise<boolean> => {
    const response = await axiosAuth.patch<{success: boolean}>(`servicios/${id}/estado`);
    return response.data.success;
};