import { axiosAuth } from '../../../../api/axiosInstance';
import type { RecordatorioCashback, RecordatorioCashbackForm } from '../schemas/recordatorio.interface';

const BASE = 'recordatorios-cashback';

export const recordatoriosService = {
  obtenerTodos: async (): Promise<RecordatorioCashback[]> => {
    const res = await axiosAuth.get<{ success: boolean; data: RecordatorioCashback[] }>(BASE);
    return res.data.data;
  },

  crear: async (data: RecordatorioCashbackForm): Promise<RecordatorioCashback> => {
    const res = await axiosAuth.post<{ success: boolean; data: RecordatorioCashback }>(BASE, data);
    return res.data.data;
  },

  actualizar: async (id: number, data: Partial<RecordatorioCashbackForm>): Promise<RecordatorioCashback> => {
    const res = await axiosAuth.put<{ success: boolean; data: RecordatorioCashback }>(`${BASE}/${id}`, data);
    return res.data.data;
  },

  toggleActivo: async (id: number): Promise<RecordatorioCashback> => {
    const res = await axiosAuth.patch<{ success: boolean; data: RecordatorioCashback }>(`${BASE}/${id}/activo`);
    return res.data.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await axiosAuth.delete(`${BASE}/${id}`);
  },
};
