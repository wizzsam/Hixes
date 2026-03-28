import { axiosInstance } from '../../../../api/axiosInstance';
import type { RolFormValues } from '../schemas/rolSchemas';
import type { Rol } from '../schemas/rol.interface';

export const actualizarRol = async (id: number, data: Partial<RolFormValues>): Promise<Rol | null> => {
    try {
        const response = await axiosInstance.patch<{success: boolean, data: Rol}>(`roles/${id}`, data);
        if (response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        return null;
    }
};
