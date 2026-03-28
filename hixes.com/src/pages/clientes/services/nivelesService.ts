import { axiosWithoutMultipart } from '../../../api/axiosInstance';
import type { Nivel } from '../schemas/cliente.interface';

export const nivelesService = {
  obtenerNiveles: async (): Promise<Nivel[]> => {
    const res = await axiosWithoutMultipart.get<{success: boolean, data: Nivel[]}>('niveles');
    return res.data.success ? res.data.data : [];
  }
};
