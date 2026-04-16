import { axiosInstance } from '../../../../api/axiosInstance';
import type { ApiResponse, PipelineEtapa } from '../schemas/pipeline.interface';

export const crearPipelineEtapa = async (data: { nombre: string; color: string }): Promise<ApiResponse<PipelineEtapa>> => {
    try {
        const response = await axiosInstance.post<ApiResponse<PipelineEtapa>>('pipeline-etapas', data);
        return response.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        return { success: false, message: 'Error de conexión' };
    }
};
