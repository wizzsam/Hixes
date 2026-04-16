import { axiosInstance } from '../../../../api/axiosInstance';
import type { ApiResponse, PipelineEtapa } from '../schemas/pipeline.interface';

export const actualizarPipelineEtapa = async (id: number, data: { nombre: string; color: string }): Promise<ApiResponse<PipelineEtapa>> => {
    try {
        const response = await axiosInstance.patch<ApiResponse<PipelineEtapa>>(`pipeline-etapas/${id}`, data);
        return response.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        return { success: false, message: 'Error de conexión' };
    }
};
