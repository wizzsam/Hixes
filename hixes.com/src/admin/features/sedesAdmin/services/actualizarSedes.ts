import { axiosInstance } from '../../../../api/axiosInstance';
import type { SedeFormValues } from '../schemas/sedesSchemas';
import type { Sede } from '../schemas/sedes.interface';

export const actualizarSede = async (id: number, data: SedeFormValues): Promise<Sede | null> => {
    try {
        const response = await axiosInstance.patch<{success: boolean, data: Sede}>(`sedes/${id}`, data);
        if (response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('Error al actualizar sede:', error);
        return null;
    }
};
