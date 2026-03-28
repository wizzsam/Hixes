import { axiosInstance } from '../../../../api/axiosInstance';
import type { SedeFormValues } from '../schemas/sedesSchemas';
import type { Sede } from '../schemas/sedes.interface';

export const crearSede = async (data: SedeFormValues): Promise<Sede | null> => {
    try {
        const response = await axiosInstance.post<{success: boolean, data: Sede}>('sedes', data);
        if (response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error: any) {
        // Extraer el primer mensaje de validación del backend (error 422)
        if (error.response?.status === 422 && error.response?.data?.errors) {
            const errors = error.response.data.errors as Record<string, string[]>;
            const primerError = Object.values(errors).flat()[0];
            throw new Error(primerError);
        }
        // Mensaje genérico de backend o red
        const mensaje = error.response?.data?.message || 'Error al crear la sede.';
        throw new Error(mensaje);
    }
};
