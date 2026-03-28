import { axiosInstance } from '../../../../api/axiosInstance';
import type { ApiResponse, Empresa } from '../schemas/empresa.interface';

export const actualizarEmpresa = async (id: number, data: FormData): Promise<ApiResponse<Empresa>> => {
    try {
        const response = await axiosInstance.post<ApiResponse<Empresa>>(`empresas/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error al actualizar empresa:', error);
        if (error.response && error.response.data) {
            return error.response.data;
        }
        return { success: false, message: 'Error de conexión' };
    }
};
