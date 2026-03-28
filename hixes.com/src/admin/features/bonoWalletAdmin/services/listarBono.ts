import { axiosWithoutMultipart } from '../../../../api/axiosInstance';
import type { BonoWallet } from '../schemas/bono.interface';

export const obtenerBonos = async (): Promise<BonoWallet[]> => {
    const response = await axiosWithoutMultipart.get<{success: boolean, data: BonoWallet[]}>('bonos');
    return response.data.data;
};