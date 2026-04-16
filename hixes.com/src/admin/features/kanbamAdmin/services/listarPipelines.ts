import { axiosInstance } from '../../../../api/axiosInstance';
import type { PipelineEtapa } from '../schemas/pipeline.interface';

export const listarPipelineEtapas = async (): Promise<PipelineEtapa[]> => {
    try {
        const response = await axiosInstance.get<{ success: boolean; data: PipelineEtapa[] }>('pipeline-etapas');
        return response.data.data || [];
    } catch (error) {
        console.error('Error al listar pipeline etapas:', error);
        return [];
    }
};
