import { axiosWithoutMultipart } from '../../../../api/axiosInstance';

export const cambiarEstadoServicio = async (id: number): Promise<boolean> => {
    const response = await axiosWithoutMultipart.patch<{success: boolean}>(`servicios/${id}/estado`);
    return response.data.success;
};