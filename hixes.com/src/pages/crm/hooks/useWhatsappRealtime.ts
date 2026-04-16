/**
 * useWhatsappRealtime.ts
 *
 * Hook de conexión en tiempo real para el CRM de WhatsApp.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  MODO ACTUAL: Polling cada 3 s (desarrollo, sin infraestructura extra)  │
 * │                                                                         │
 * │  TODO[WS-PROD] Para migrar a WebSocket real con Laravel Reverb:         │
 * │    1. npm install laravel-echo pusher-js                                │
 * │    2. Cambia REALTIME_MODE a 'websocket'                                │
 * │    3. Implementa connectWebSocket() usando window.Echo                  │
 * │       (ver sección marcada con TODO[WS-PROD] abajo)                     │
 * │    4. En el .env del frontend añade:                                    │
 * │         VITE_REVERB_APP_KEY=...                                         │
 * │         VITE_REVERB_HOST=tu-servidor.com                                │
 * │         VITE_REVERB_PORT=8080                                           │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import { useEffect, useRef, useCallback } from 'react';
import { getConversations, getMessagesByPhone } from '../services/whatsappService';
import type { Conversacion, MensajeWA } from '../services/whatsappService';

// ─── Configuración ────────────────────────────────────────────────────────────
/**
 * TODO[WS-PROD] Cambia a 'websocket' cuando tengas Reverb configurado.
 * El hook maneja ambos modos con la misma interfaz externa.
 */
// TODO[WS-PROD] Cambia a 'websocket' cuando tengas Reverb configurado.
const REALTIME_MODE = 'polling' as 'polling' | 'websocket';

/** Intervalo de polling en ms. Solo aplica si REALTIME_MODE === 'polling'. */
const POLLING_INTERVAL_MS = 3000;

// ─── Interfaz del hook ────────────────────────────────────────────────────────
interface UseWhatsappRealtimeOptions {
  /** Se dispara cuando llega una conversación actualizada / nueva. */
  onConversationsUpdate: (conversations: Conversacion[]) => void;
  /** Se dispara cuando llegan mensajes nuevos para el teléfono activo. */
  onMessagesUpdate: (phone: string, messages: MensajeWA[]) => void;
  /** Teléfono de la conversación actualmente abierta (puede ser null). */
  activePhone: string | null;
}

export const useWhatsappRealtime = ({
  onConversationsUpdate,
  onMessagesUpdate,
  activePhone,
}: UseWhatsappRealtimeOptions) => {
  const activePhoneRef = useRef(activePhone);
  const onConversationsRef = useRef(onConversationsUpdate);
  const onMessagesRef = useRef(onMessagesUpdate);

  // Mantenemos las refs actualizadas sin recrear efectos
  useEffect(() => { activePhoneRef.current = activePhone; }, [activePhone]);
  useEffect(() => { onConversationsRef.current = onConversationsUpdate; }, [onConversationsUpdate]);
  useEffect(() => { onMessagesRef.current = onMessagesUpdate; }, [onMessagesUpdate]);

  // ── Fetch manual (reutilizado por polling y por la carga inicial) ──────────
  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      onConversationsRef.current(data);
    } catch {
      // Silenciamos errores de red para no romper la UI
    }
  }, []);

  const fetchMessages = useCallback(async (phone: string) => {
    try {
      const data = await getMessagesByPhone(phone);
      onMessagesRef.current(phone, data);
    } catch {
      // Silenciamos errores de red
    }
  }, []);

  // ── Modo polling ─────────────────────────────────────────────────────────────
  const connectPolling = useCallback(() => {
    // Carga inicial inmediata
    fetchConversations();

    const intervalId = setInterval(() => {
      fetchConversations();
      if (activePhoneRef.current) {
        fetchMessages(activePhoneRef.current);
      }
    }, POLLING_INTERVAL_MS);

    // Retorna cleanup
    return () => clearInterval(intervalId);
  }, [fetchConversations, fetchMessages]);

  // ── Modo WebSocket (TODO[WS-PROD]) ────────────────────────────────────────
  const connectWebSocket = useCallback(() => {
    /*
     * TODO[WS-PROD] Implementación con Laravel Echo + Reverb:
     *
     * import Echo from 'laravel-echo';
     * import Pusher from 'pusher-js';
     *
     * window.Pusher = Pusher;
     * const echo = new Echo({
     *   broadcaster: 'reverb',
     *   key: import.meta.env.VITE_REVERB_APP_KEY,
     *   wsHost: import.meta.env.VITE_REVERB_HOST,
     *   wsPort: import.meta.env.VITE_REVERB_PORT,
     *   forceTLS: true,
     *   enabledTransports: ['ws', 'wss'],
     * });
     *
     * // Escuchar canal de conversaciones
     * echo.channel('whatsapp')
     *   .listen('.NuevoMensajeWhatsapp', (e: { mensaje: MensajeWA }) => {
     *     // Actualizar conversaciones completas
     *     fetchConversations();
     *     // Si el mensaje es de la conversación activa, actualizar mensajes
     *     const phone = e.mensaje.direction === 'inbound'
     *       ? e.mensaje.from_phone
     *       : e.mensaje.to_phone;
     *     if (phone && phone === activePhoneRef.current) {
     *       fetchMessages(phone);
     *     }
     *   });
     *
     * return () => echo.disconnect();
     */

    // Fallback a polling si WebSocket no está implementado aún
    console.warn('[useWhatsappRealtime] WebSocket no implementado, usando polling.');
    return connectPolling();
  }, [connectPolling, fetchConversations, fetchMessages]);

  // ── Punto de entrada — selecciona modo ────────────────────────────────────
  useEffect(() => {
    const cleanup = REALTIME_MODE === 'websocket'
      ? connectWebSocket()
      : connectPolling();

    return cleanup;
  }, [connectPolling, connectWebSocket]);

  // ── Re-fetch de mensajes cuando cambia la conversación activa ─────────────
  useEffect(() => {
    if (activePhone) {
      fetchMessages(activePhone);
    }
  }, [activePhone, fetchMessages]);

  return { refetchConversations: fetchConversations };
};
