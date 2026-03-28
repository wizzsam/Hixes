import { axiosWithoutMultipart } from '../../../../api/axiosInstance';
import type { ServicioHixes } from '../schemas/servicio.interface';

export const obtenerServicios = async (): Promise<ServicioHixes[]> => {
    const response = await axiosWithoutMultipart.get<{success: boolean, data: ServicioHixes[]}>('servicios');
    return response.data.data;
};