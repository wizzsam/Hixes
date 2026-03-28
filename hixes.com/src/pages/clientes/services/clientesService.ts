import { axiosWithoutMultipart } from '../../../api/axiosInstance';
import type { Cliente, Transaccion } from '../schemas/cliente.interface';

export const clientesService = {
  obtenerClientes: async (): Promise<Cliente[]> => {
    const res = await axiosWithoutMultipart.get<Cliente[]>('clientes');
    return res.data;
  },

  crearCliente: async (data: { nombre_completo: string; dni: string; telefono: string; correo?: string }): Promise<Cliente> => {
    const res = await axiosWithoutMultipart.post<Cliente>('clientes', data);
    return res.data;
  },

  registroPublico: async (data: { nombre_completo: string; dni: string; telefono: string; correo?: string; sede_id: number }): Promise<Cliente> => {
    const res = await axiosWithoutMultipart.post<Cliente>('clientes/registro-publico', data);
    return res.data;
  },

  obtenerSedesPublicas: async (empresaId: number): Promise<{ id: number; nombre_sede: string }[]> => {
    const res = await axiosWithoutMultipart.get<{ success: boolean; data: { id: number; nombre_sede: string }[] }>(
      `sedes/publicas?empresa_id=${empresaId}`
    );
    return res.data.data;
  },

  actualizarCliente: async (id: number, data: { nombre_completo: string; dni: string; telefono: string; correo?: string }): Promise<Cliente> => {
    const res = await axiosWithoutMultipart.put<Cliente>(`clientes/${id}`, data);
    return res.data;
  },

  toggleEstado: async (id: number): Promise<Cliente> => {
    const res = await axiosWithoutMultipart.patch<Cliente>(`clientes/${id}/estado`);
    return res.data;
  },

  obtenerDetalle: async (id: number): Promise<{ cliente: Cliente; transacciones: Transaccion[] }> => {
    const res = await axiosWithoutMultipart.get<{ cliente: Cliente; transacciones: Transaccion[] }>(`clientes/${id}`);
    return res.data;
  },

  registrarConsumo: async (id: number, monto: number, servicio: string): Promise<Cliente> => {
    const res = await axiosWithoutMultipart.post<Cliente>(`clientes/${id}/consumo`, { monto, servicio });
    return res.data;
  },

  recargarWallet: async (id: number, monto: number): Promise<Cliente> => {
    const res = await axiosWithoutMultipart.post<Cliente>(`clientes/${id}/wallet`, { monto });
    return res.data;
  },

  pagarConSaldo: async (
    id: number,
    montoTotal: number,
    servicio: string,
    walletDeducido: number,
    cashbackDeducido: number
  ): Promise<Cliente> => {
    const res = await axiosWithoutMultipart.post<Cliente>(`clientes/${id}/pagar`, {
      monto_total: montoTotal,
      servicio,
      wallet_deducido: walletDeducido,
      cashback_deducido: cashbackDeducido,
    });
    return res.data;
  },
};
