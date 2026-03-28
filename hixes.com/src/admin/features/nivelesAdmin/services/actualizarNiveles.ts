import { axiosWithoutMultipart } from '../../../../api/axiosInstance';
import type { NivelFormValues } from '../schemas/schemaNiveles';
import type { Nivel } from '../schemas/niveles.interface';

export const actualizarNivel = async (id: number, data: Partial<NivelFormValues>): Promise<Nivel | null> => {
    try {
        const response = await axiosWithoutMultipart.put<{success: boolean, data: Nivel}>(`niveles/${id}`, data);
        return response.data.success ? response.data.data : null;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Error al actualizar el nivel.');
    }
};