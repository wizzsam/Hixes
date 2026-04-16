import { axiosInstance } from '../../../../api/axiosInstance';
import type { PipelineEtapa } from '../schemas/pipeline.interface';

export const reordenarPipelineEtapas = async (orden: number[]): Promise<PipelineEtapa[]> => {
    try {
        const response = await axiosInstance.post<{ success: boolean; data: PipelineEtapa[] }>('pipeline-etapas/reordenar', { orden });
        return response.data.data || [];
    } catch {
        return [];
    }
};
