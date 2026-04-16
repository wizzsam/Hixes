import { axiosAuth } from '../../../api/axiosInstance';
import type { Campana } from '../../admin/features/campanasAdmin/schemas/campana.interface';

const BASE = 'campanas';

export interface CampanaKanbanData {
  campana: Campana;
  clientes: Array<{
    pivot_id: number;
    etapa_id: number | null;
    cliente: {
      id: number;
      nombre_completo: string;
      dni: string;
      telefono: string;
      cashback: number;
      wallet: number;
    };
  }>;
}

export const campanaWorkerService = {
  obtenerActivas: async (): Promise<Campana[]> => {
    const res = await axiosAuth.get<Campana[]>(BASE, { params: { solo_activas: true } });
    return res.data;
  },

  obtenerKanban: async (campanaId: number): Promise<CampanaKanbanData> => {
    const res = await axiosAuth.get<CampanaKanbanData>(`${BASE}/${campanaId}/clientes`);
    return res.data;
  },

  moverCliente: async (campanaId: number, clienteId: number, etapaId: number): Promise<void> => {
    await axiosAuth.patch(`${BASE}/${campanaId}/clientes/${clienteId}/etapa`, { etapa_id: etapaId });
  },

  agregarCliente: async (campanaId: number, clienteId: number): Promise<void> => {
    await axiosAuth.post(`${BASE}/${campanaId}/clientes`, { cliente_id: clienteId });
  },

  removerCliente: async (campanaId: number, clienteId: number): Promise<void> => {
    await axiosAuth.delete(`${BASE}/${campanaId}/clientes/${clienteId}`);
  },
};
