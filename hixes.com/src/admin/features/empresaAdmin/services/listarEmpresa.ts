import { axiosInstance } from '../../../../api/axiosInstance';
import type { Empresa } from '../schemas/empresa.interface';

export const listarEmpresas = async (): Promise<Empresa[]> => {
    try {
        const response = await axiosInstance.get<{success: boolean, data: Empresa[]}>('empresas');
        return response.data.data || [];
    } catch (error) {
        console.error('Error al listar empresas:', error);
        return [];
    }
};
