import { axiosInstance } from '../../../../api/axiosInstance';
import type { RolFormValues } from '../schemas/rolSchemas';
import type { Rol } from '../schemas/rol.interface';

export const crearRol = async (data: RolFormValues): Promise<Rol | null> => {
    try {
        const response = await axiosInstance.post<{success: boolean, data: Rol}>('roles', data);
        if (response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('Error al crear rol:', error);
        return null;
    }
};
