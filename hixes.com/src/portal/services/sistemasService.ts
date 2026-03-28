import { axiosWithoutMultipart } from '../../api/axiosInstance';
import type { MisSistemasResponse } from '../../core/components/auth/schemas/login.interface';

export const getMisSistemas = async (): Promise<MisSistemasResponse> => {
    try {
        const response = await axiosWithoutMultipart.get<MisSistemasResponse>('auth/mis-sistemas');
        return response.data;
    } catch (error: any) {
        console.error('Error al obtener sistemas:', error);
        if (error.response && error.response.data) {
            return error.response.data as MisSistemasResponse;
        }
        return {
            success: false,
            sistemas: [],
            message: 'Error de red o servidor.',
        };
    }
};

