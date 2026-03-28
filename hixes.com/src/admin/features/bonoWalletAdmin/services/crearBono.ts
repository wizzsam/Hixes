import { axiosWithoutMultipart } from '../../../../api/axiosInstance';
import type { BonoWallet, BonoWalletFormInput } from '../schemas/bono.interface';

export const crearBono = async (data: BonoWalletFormInput): Promise<BonoWallet | null> => {
    const response = await axiosWithoutMultipart.post<{success: boolean, data: BonoWallet}>('bonos', data);
    return response.data.success ? response.data.data : null;
};