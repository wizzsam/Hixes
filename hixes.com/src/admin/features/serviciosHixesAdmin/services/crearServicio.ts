import { axiosAuth } from '../../../../api/axiosInstance';
import type { ServicioHixes, ServicioFormInput } from '../schemas/servicio.interface';

export const crearServicio = async (data: ServicioFormInput): Promise<ServicioHixes | null> => {
    const response = await axiosAuth.post<{success: boolean, data: ServicioHixes}>('servicios', data);
    return response.data.success ? response.data.data : null;
};