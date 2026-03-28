import { axiosInstance } from '../../../../api/axiosInstance';
import type { ApiResponse } from '../schemas/empresa.interface';

export const cambiarEstadoEmpresa = async (id: number): Promise<boolean> => {
    try {
        await axiosInstance.put<ApiResponse<any>>(`empresas/${id}/estado`);
        return true;
    } catch (error) {
        console.error('Error al cambiar estado de empresa:', error);
        return false;
    }
};
