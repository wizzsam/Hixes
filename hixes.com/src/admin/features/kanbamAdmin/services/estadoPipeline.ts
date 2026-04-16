import { axiosInstance } from '../../../../api/axiosInstance';

export const toggleActivoPipelineEtapa = async (id: number): Promise<boolean> => {
    try {
        await axiosInstance.patch(`pipeline-etapas/${id}/activo`);
        return true;
    } catch {
        return false;
    }
};

export const eliminarPipelineEtapa = async (id: number): Promise<boolean> => {
    try {
        await axiosInstance.delete(`pipeline-etapas/${id}`);
        return true;
    } catch {
        return false;
    }
};
