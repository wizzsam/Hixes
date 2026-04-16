import { axiosAuth } from '../../../../api/axiosInstance';
import type { ServicioHixes, ServicioFormInput } from '../schemas/servicio.interface';

export const actualizarServicio = async (id: number, data: ServicioFormInput): Promise<ServicioHixes | null> => {
    const response = await axiosAuth.put<{success: boolean, data: ServicioHixes}>(`servicios/${id}`, data);
    return response.data.success ? response.data.data : null;
};