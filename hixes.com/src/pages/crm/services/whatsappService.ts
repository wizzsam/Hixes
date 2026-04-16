/**
 * whatsappService.ts
 * Capa de acceso a la API de WhatsApp CRM.
 *
 * TODO[WS-PROD] Cuando migres a Laravel Reverb + Laravel Echo:
 *   - Elimina getConversations() y getMessagesByPhone() — el frontend recibirá
 *     los datos en tiempo real por WebSocket.
 *   - Conserva replyToPhone() y markConversationRead() tal cual.
 *   - Ejemplo de escucha con Echo:
 *       window.Echo.channel('whatsapp').listen('.NuevoMensaje', handler)
 */

import { axiosInstance, axiosWithoutMultipart } from '../../../api/axiosInstance';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ClienteResumen {
  id: number;
  nombre: string;
  dni: string;
}

export interface VendedorAsignado {
  id: number;
  nombre_completo: string;
}

/** Conversación agrupada devuelta por el backend */
export interface Conversacion {
  phone: string;
  lastMessage: string | null;
  lastTime: string | null;
  unreadCount: number;
  /** null si el número no está registrado como cliente */
  cliente: ClienteResumen | null;
  /** null si aún no hay vendedor asignado */
  vendedor_asignado: VendedorAsignado | null;
}

/** Mensaje individual de la BD */
export interface MensajeWA {
  id: number;
  from_phone: string;
  to_phone: string | null;
  message_body: string;
  message_sid: string;
  direction: 'inbound' | 'outbound';
  is_read: boolean;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/**
 * Lista de conversaciones agrupadas por contacto.
 * TODO[WS-PROD] Eliminar cuando uses Reverb (llegan por canal en tiempo real).
 */
export const getConversations = async (): Promise<Conversacion[]> => {
  const { data } = await axiosWithoutMultipart.get<Conversacion[]>(
    '/whatsapp/conversations'
  );
  return data;
};

/**
 * Historial de mensajes de una conversación.
 * TODO[WS-PROD] Solo se llama 1 vez al abrir la conversación;
 * los mensajes nuevos llegan directamente por WebSocket.
 */
export const getMessagesByPhone = async (phone: string): Promise<MensajeWA[]> => {
  const { data } = await axiosWithoutMultipart.get<MensajeWA[]>(
    '/whatsapp/messages',
    { params: { phone } }
  );
  return data;
};

/** Envía un mensaje de WhatsApp al número indicado. */
export const replyToPhone = async (
  to: string,
  message: string
): Promise<void> => {
  await axiosWithoutMultipart.post('/whatsapp/reply', { to, message });
};

/** Marca todos los mensajes de esa conversación como leídos. */
export const markConversationRead = async (phone: string): Promise<void> => {
  const encoded = encodeURIComponent(phone);
  await axiosWithoutMultipart.post(`/whatsapp/mark-read/${encoded}`);
};

/** Envía un archivo o nota de voz al número indicado. */
export const replyMediaToPhone = async (to: string, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('to', to);
  formData.append('media', file);
  const res = await axiosInstance.post('/whatsapp/reply-media', formData);
  if (res.data?.twilio_error) {
    console.warn('[Twilio] No se pudo entregar a WhatsApp:', res.data.twilio_error);
  }
};

/** Libera manualmente la asignación de un chat. */
export const liberarChat = async (phone: string): Promise<void> => {
  const encoded = encodeURIComponent(phone);
  await axiosWithoutMultipart.delete(`/crm/asignaciones/${encoded}`);
};

/** Transfiere la asignación de un chat a otro vendedor. */
export const transferirChat = async (phone: string, vendedorId: number): Promise<{ id: number; nombre_completo: string }> => {
  const { data } = await axiosWithoutMultipart.post<{ success: boolean; vendedor: { id: number; nombre_completo: string } }>(
    '/crm/asignaciones/transferir',
    { phone, vendedor_id: vendedorId }
  );
  return data.vendedor;
};

/** Lista vendedores disponibles con su estado y carga actual. */
export interface VendedorDisponible {
  id: number;
  nombre_completo: string;
  sesion_activa: boolean;
  chats_activos: number;
}
export const getVendedoresDisponibles = async (): Promise<VendedorDisponible[]> => {
  const { data } = await axiosWithoutMultipart.get<{ data: VendedorDisponible[] }>('/vendedores/disponibles');
  return data.data ?? [];
};

/** Devuelve los teléfonos asignados al usuario autenticado. */
export const getMiAsignacion = async (): Promise<string[]> => {
  const { data } = await axiosWithoutMultipart.get<{ phones: string[] }>('/crm/mi-asignacion');
  return data.phones ?? [];
};
