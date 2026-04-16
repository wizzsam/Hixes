import { axiosAuth } from '../../../../api/axiosInstance';
import type { Campana, CampanaForm, CampanaEtapa, EtapaForm } from '../schemas/campana.interface';

const BASE = 'campanas';

export const campanaService = {
  // ─── CRUD Campañas ─────────────────────────────────────────────────────────
  obtenerTodas: async (params?: { empresa_id?: number }): Promise<Campana[]> => {
    const res = await axiosAuth.get<Campana[]>(BASE, { params });
    return res.data;
  },

  crear: async (data: CampanaForm): Promise<Campana> => {
    const res = await axiosAuth.post<Campana>(BASE, data);
    return res.data;
  },

  actualizar: async (id: number, data: Partial<CampanaForm>): Promise<Campana> => {
    const res = await axiosAuth.put<Campana>(`${BASE}/${id}`, data);
    return res.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await axiosAuth.delete(`${BASE}/${id}`);
  },

  // ─── Etapas ────────────────────────────────────────────────────────────────
  obtenerEtapas: async (campanaId: number): Promise<CampanaEtapa[]> => {
    const res = await axiosAuth.get<CampanaEtapa[]>(`${BASE}/${campanaId}/etapas`);
    return res.data;
  },

  crearEtapa: async (campanaId: number, data: EtapaForm): Promise<CampanaEtapa> => {
    const res = await axiosAuth.post<CampanaEtapa>(`${BASE}/${campanaId}/etapas`, data);
    return res.data;
  },

  actualizarEtapa: async (campanaId: number, etapaId: number, data: Partial<EtapaForm>): Promise<CampanaEtapa> => {
    const res = await axiosAuth.put<CampanaEtapa>(`${BASE}/${campanaId}/etapas/${etapaId}`, data);
    return res.data;
  },

  eliminarEtapa: async (campanaId: number, etapaId: number): Promise<void> => {
    await axiosAuth.delete(`${BASE}/${campanaId}/etapas/${etapaId}`);
  },

  // ─── Clientes ─────────────────────────────────────────────────────────────
  obtenerActivas: async (): Promise<Campana[]> => {
    const res = await axiosAuth.get<Campana[]>(BASE, { params: { solo_activas: true } });
    return res.data;
  },

  agregarCliente: async (campanaId: number, clienteId: number, etapaId?: number): Promise<void> => {
    await axiosAuth.post(`${BASE}/${campanaId}/clientes`, { cliente_id: clienteId, etapa_id: etapaId });
  },

  removerCliente: async (campanaId: number, clienteId: number): Promise<void> => {
    await axiosAuth.delete(`${BASE}/${campanaId}/clientes/${clienteId}`);
  },

  moverEtapa: async (campanaId: number, clienteId: number, etapaId: number): Promise<void> => {
    await axiosAuth.patch(`${BASE}/${campanaId}/clientes/${clienteId}/etapa`, { etapa_id: etapaId });
  },
};
