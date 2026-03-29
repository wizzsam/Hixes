import { axiosInstance } from '../../../../api/axiosInstance';
import type { BonoWallet } from '../schemas/bono.interface';

export const obtenerBonos = async (): Promise<BonoWallet[]> => {
    try {
        const response = await axiosInstance.get<{ success: boolean, data: BonoWallet[] }>('bonos');
        return response.data.data || [];
    } catch (error) {
        console.error('Error al listar bonos:', error);
        return [];
    }
};