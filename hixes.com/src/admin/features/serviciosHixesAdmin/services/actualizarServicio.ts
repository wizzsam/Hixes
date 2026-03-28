import { axiosWithoutMultipart } from '../../../../api/axiosInstance';
import type { ServicioHixes, ServicioFormInput } from '../schemas/servicio.interface';

export const actualizarServicio = async (id: number, data: Partial<ServicioFormInput>): Promise<ServicioHixes | null> => {
    const response = await axiosWithoutMultipart.put<{success: boolean, data: ServicioHixes}>(`servicios/${id}`, data);
    return response.data.success ? response.data.data : null;
};