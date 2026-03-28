import { useState, useCallback, useEffect } from 'react';
import { clientesService } from '../services/clientesService';
import type { Cliente, Transaccion } from '../schemas/cliente.interface';
import { toast } from 'sonner';

// Laravel retorna decimales como strings, esta función los normaliza a number
const normalizarCliente = (c: any): Cliente => ({
  ...c,
  wallet: parseFloat(c.wallet ?? 0),
  cashback: parseFloat(c.cashback ?? 0),
  consumo_acumulado: parseFloat(c.consumo_acumulado ?? 0),
  estado: c.estado === undefined ? true : Boolean(c.estado),
});

const normalizarTransaccion = (tx: any): Transaccion => ({
  ...tx,
  monto:    parseFloat(tx.monto ?? 0),
  fecha:    tx.fecha ?? tx.created_at ?? '',
  expirado: tx.expirado ?? false,
  consumido: tx.consumido ?? false,
});

export const useClientes = (clienteId?: number) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteDetalle, setClienteDetalle] = useState<Cliente | null>(null);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar lista de clientes
  const fetchClientes = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await clientesService.obtenerClientes();
      // Ordenar por fecha de creación ascendente (el más antiguo primero, el más nuevo al último)
      const normalizados = data.map(normalizarCliente).sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      setClientes(normalizados);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.error('Error al cargar la lista de clientes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar detalle de un cliente específico
  const fetchDetalle = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      const data = await clientesService.obtenerDetalle(id);
      setClienteDetalle(normalizarCliente(data.cliente));
      setTransacciones(data.transacciones.map(normalizarTransaccion));
    } catch (error) {
      console.error('Error al cargar detalle del cliente:', error);
      toast.error('Error al cargar el detalle del cliente');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inicialización automática si se provee clienteId, si no, se carga la lista completa
  useEffect(() => {
    if (clienteId) {
      fetchDetalle(clienteId);
    } else {
      fetchClientes();
    }
  }, [clienteId, fetchDetalle, fetchClientes]);

  const agregarCliente = async (cliente: Omit<Cliente, 'id' | 'wallet' | 'cashback' | 'consumo_acumulado' | 'created_at' | 'estado'>) => {
    try {
      const nuevo = await clientesService.crearCliente({
        nombre_completo: cliente.nombre_completo,
        dni: cliente.dni,
        telefono: cliente.telefono,
        correo: cliente.correo || undefined,
      });
      setClientes(prev => [...prev, normalizarCliente(nuevo)]);
      toast.success('Cliente registrado exitosamente');
      return nuevo;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear cliente');
      throw error;
    }
  };

  const actualizarCliente = async (id: number, data: { nombre_completo: string; dni: string; telefono: string; correo?: string }) => {
    try {
      const actualizado = await clientesService.actualizarCliente(id, data);
      const norm = normalizarCliente(actualizado);
      setClientes(prev => prev.map(c => c.id === id ? norm : c));
      if (clienteId === id) setClienteDetalle(norm);
      toast.success('Cliente actualizado');
      return norm;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar cliente');
      throw error;
    }
  };

  const registrarConsumo = async (id: number, monto: number, servicio: string) => {
    try {
      const actualizado = await clientesService.registrarConsumo(id, monto, servicio);
      if (clienteId === id) fetchDetalle(id); // Recargar si estamos en el detalle
      return actualizado;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar consumo');
      throw error;
    }
  };

  const recargarWallet = async (id: number, monto: number) => {
    try {
      const actualizado = await clientesService.recargarWallet(id, monto);
      if (clienteId === id) fetchDetalle(id);
      return actualizado;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al recargar wallet');
      throw error;
    }
  };

  const pagarConSaldo = async (id: number, montoTotal: number, servicio: string, walletDeducido: number, cashbackDeducido: number) => {
    try {
      await clientesService.pagarConSaldo(id, montoTotal, servicio, walletDeducido, cashbackDeducido);
      if (clienteId === id) fetchDetalle(id);
      
      const efectivoPagado = montoTotal - walletDeducido - cashbackDeducido;
      const montoParaCashback = montoTotal - cashbackDeducido;
      
      return { generoNuevoCashback: montoParaCashback > 0, efectivoPagado };
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al procesar el pago');
      throw error;
    }
  };

  const toggleEstado = async (id: number) => {
    try {
      const actualizado = await clientesService.toggleEstado(id);
      const norm = normalizarCliente(actualizado);
      setClientes(prev => prev.map(c => c.id === id ? norm : c));
      toast.success(norm.estado ? 'Cliente activado' : 'Cliente desactivado');
      return norm;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado');
      throw error;
    }
  };

  return {
    clientes,
    clienteDetalle,
    transacciones,
    isLoading,
    fetchClientes,
    fetchDetalle,
    agregarCliente,
    actualizarCliente,
    registrarConsumo,
    recargarWallet,
    pagarConSaldo,
    toggleEstado,
  };
};
