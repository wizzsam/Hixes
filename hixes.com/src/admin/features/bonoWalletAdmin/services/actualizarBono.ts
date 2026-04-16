import { axiosAuth } from '../../../../api/axiosInstance';
import type { BonoWallet, BonoWalletFormInput } from '../schemas/bono.interface';

export const actualizarBono = async (id: number, data: BonoWalletFormInput): Promise<BonoWallet | null> => {
    const response = await axiosAuth.put<{success: boolean, data: BonoWallet}>(`bonos/${id}`, data);
    return response.data.success ? response.data.data : null;
};