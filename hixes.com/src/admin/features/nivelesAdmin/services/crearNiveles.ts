import { axiosInstance } from '../../../../api/axiosInstance';
import type { NivelFormValues } from '../schemas/schemaNiveles';
import type { Nivel } from '../schemas/niveles.interface';

export const crearNivel = async (data: NivelFormValues): Promise<Nivel | null> => {
    try {
        const response = await axiosInstance.post<{success: boolean, data: Nivel}>('niveles', data);
        return response.data.success ? response.data.data : null;
    } catch (error: any) {
        if (error.response?.status === 422 && error.response?.data?.errors) {
            const errors = error.response.data.errors as Record<string, string[]>;
            throw new Error(Object.values(errors).flat()[0]);
        }
        throw new Error(error.response?.data?.message || 'Error al crear el nivel.');
    }
};