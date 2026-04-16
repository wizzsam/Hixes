import { useState, useCallback, useRef, useEffect } from 'react';
import { useWhatsappRealtime } from './useWhatsappRealtime';
import {
  replyToPhone,
  replyMediaToPhone,
  markConversationRead,
  getConversations,
  transferirChat,
} from '../services/whatsappService';
import type { Conversacion, MensajeWA } from '../services/whatsappService';
import { axiosWithoutMultipart } from '../../../api/axiosInstance';
import {
  getEtiquetas,
  getAsignaciones,
} from '../services/labelService';
import type { CrmEtiqueta, CrmConversacionEtiqueta } from '../services/labelService';

export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'note' | 'system' | 'image' | 'audio' | 'video' | 'document' | 'location';

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  status: MessageStatus;
  type: MessageType;
  sender?: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  initials: string;
  color: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isOnline: boolean;
  tags: string[];
  label?: 'nuevo' | 'vip' | 'pendiente' | 'cerrado';
  source?: 'whatsapp' | 'manual' | 'web';
  /** true si el n�mero no est� registrado como cliente */
  isUnknown: boolean;
  /** ID del cliente en BD (null si desconocido) */
  clienteId?: number;
  /** Vendedor asignado a esta conversaci�n */
  vendedorAsignado?: { id: number; nombre_completo: string } | null;
  /** true si este chat est� asignado al usuario autenticado */
  isAssignedToMe: boolean;
}

export interface FilterTab {
  key: string;
  label: string;
  count?: number;
  color?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const COLORS = [
  '#25D366', '#128C7E', '#075E54', '#34B7F1', '#00BCD4',
  '#9C27B0', '#FF5722', '#FF9800', '#2196F3', '#E91E63',
];

const colorForPhone = (phone: string): string => {
  let hash = 0;
  for (let i = 0; i < phone.length; i++) hash = phone.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
};

const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/** Convierte una Conversacion de la API al tipo Contact que usa la UI */
const conversacionToContact = (conv: Conversacion, currentUserId?: number): Contact => {
  const nombre = conv.cliente?.nombre ?? conv.phone;
  const vendedorId = conv.vendedor_asignado?.id;
  return {
    id: conv.phone,
    name: nombre,
    phone: conv.phone,
    initials: getInitials(nombre),
    color: colorForPhone(conv.phone),
    lastMessage: conv.lastMessage ?? '',
    lastMessageTime: conv.lastTime ? new Date(conv.lastTime) : undefined,
    unreadCount: conv.unreadCount,
    isOnline: false,
    tags: [],
    label: conv.unreadCount > 0 ? 'nuevo' : undefined,
    source: 'whatsapp',
    isUnknown: conv.cliente === null,
    clienteId: conv.cliente?.id,
    vendedorAsignado: conv.vendedor_asignado ?? null,
    isAssignedToMe: currentUserId !== undefined && vendedorId === currentUserId,
  };
};

/** Infiere el MessageType a partir del MIME type o tipo especial */
const messageTypeFromMime = (mime: string | null): MessageType => {
  if (!mime) return 'text';
  if (mime === 'location') return 'location';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  return 'document';
};

/** Convierte un MensajeWA de la API al tipo Message que usa la UI */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mensajeToMessage = (msg: MensajeWA, _nuestroPhone: string): Message => ({
  id: String(msg.id),
  conversationId: msg.direction === 'inbound' ? msg.from_phone : (msg.to_phone ?? ''),
  content: msg.message_body,
  timestamp: new Date(msg.created_at),
  isOwn: msg.direction === 'outbound',
  status: msg.is_read ? 'read' : 'sent',
  type: msg.media_url ? messageTypeFromMime(msg.media_type) : 'text',
  sender: msg.direction === 'inbound' ? msg.from_phone : undefined,
  mediaUrl: msg.media_url ?? undefined,
  mediaType: msg.media_type ?? undefined,
});

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useCrm = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [etiquetas, setEtiquetas] = useState<CrmEtiqueta[]>([]);
  const [asignaciones, setAsignaciones] = useState<CrmConversacionEtiqueta[]>([]);

  // ID del usuario autenticado para comparar asignaciones
  const currentUserId: number | undefined = (() => {
    try {
      const raw = localStorage.getItem('userData');
      return raw ? JSON.parse(raw)?.id_usuario : undefined;
    } catch { return undefined; }
  })();

  const nuestroPhoneRef = useRef<string>('');

  // -- Cargar etiquetas y asignaciones al montar ------------------------------
  useEffect(() => {
    Promise.all([getEtiquetas(), getAsignaciones()])
      .then(([ets, asigs]) => {
        setEtiquetas(ets);
        setAsignaciones(asigs);
      })
      .catch(() => { /* no cr�tico */ });
  }, []);

  // ── Callbacks para el hook de realtime ──────────────────────────────────────
  const handleConversationsUpdate = useCallback((convs: Conversacion[]) => {
    setContacts(convs.map((c) => conversacionToContact(c, currentUserId)));
    setIsLoading(false);
    setError(null);
  }, [currentUserId]);

  const handleMessagesUpdate = useCallback((phone: string, msgs: MensajeWA[]) => {
    setMessages((prev) => ({
      ...prev,
      [phone]: msgs.map((m) => mensajeToMessage(m, nuestroPhoneRef.current)),
    }));
  }, []);

  // ── Hook de realtime (polling / WebSocket) ───────────────────────────────────
  useWhatsappRealtime({
    onConversationsUpdate: handleConversationsUpdate,
    onMessagesUpdate: handleMessagesUpdate,
    activePhone: selectedContactId,
  });

  // ── Seleccionar conversación y marcar como leída ─────────────────────────────
  const handleSelectContact = useCallback((id: string) => {
    setSelectedContactId(id);
    // Marcamos como leída en el backend
    markConversationRead(id).then(() => {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unreadCount: 0, label: undefined as any } : c))
      );
    }).catch(() => { /* no crítico */ });
  }, []);

  // ── Enviar mensaje ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string) => {
      if (!selectedContactId || !content.trim()) return;

      // Optimistic update: mostramos el mensaje de inmediato en la UI
      const optimisticMsg: Message = {
        id: `optimistic_${Date.now()}`,
        conversationId: selectedContactId,
        content: content.trim(),
        timestamp: new Date(),
        isOwn: true,
        status: 'sent',
        type: 'text',
      };
      setMessages((prev) => ({
        ...prev,
        [selectedContactId]: [...(prev[selectedContactId] ?? []), optimisticMsg],
      }));
      setInputValue('');

      try {
        await replyToPhone(selectedContactId, content.trim());
        // Luego el polling actualizará con el mensaje real de la BD
      } catch (e: any) {
        // Si falla, quitamos el mensaje optimista y mostramos error
        setMessages((prev) => ({
          ...prev,
          [selectedContactId]: (prev[selectedContactId] ?? []).filter(
            (m) => m.id !== optimisticMsg.id
          ),
        }));
        setError('No se pudo enviar el mensaje. Intenta de nuevo.');
      }
    },
    [selectedContactId]
  );
  // -- Enviar archivo o nota de voz ------------------------------------------
  const sendMedia = useCallback(
    async (file: File) => {
      if (!selectedContactId) return;

      const mime = file.type;
      const type: MessageType = mime.startsWith('image/') ? 'image'
        : mime.startsWith('audio/') ? 'audio'
        : mime.startsWith('video/') ? 'video'
        : 'document';

      const objectUrl = URL.createObjectURL(file);
      const optimisticMsg: Message = {
        id: `optimistic_${Date.now()}`,
        conversationId: selectedContactId,
        content: '',
        timestamp: new Date(),
        isOwn: true,
        status: 'sent',
        type,
        mediaUrl: objectUrl,
        mediaType: mime,
      };
      setMessages((prev) => ({
        ...prev,
        [selectedContactId]: [...(prev[selectedContactId] ?? []), optimisticMsg],
      }));

      try {
        await replyMediaToPhone(selectedContactId, file);
      } catch {
        setMessages((prev) => ({
          ...prev,
          [selectedContactId]: (prev[selectedContactId] ?? []).filter(
            (m) => m.id !== optimisticMsg.id
          ),
        }));
        setError('No se pudo enviar el archivo. Intenta de nuevo.');
      }
    },
    [selectedContactId]
  );
  // ── Registrar contacto desconocido como cliente ────────────────────────────
  const registerContact = useCallback(
    async (phone: string, nombreCompleto: string, dni: string) => {
      // Extrae solo dígitos del teléfono (el backend espera 9 dígitos sin +51)
      const telefonoDigits = phone.replace(/\D/g, '').slice(-9);

      await axiosWithoutMultipart.post('/clientes', {
        nombre_completo: nombreCompleto,
        dni,
        telefono: telefonoDigits,
      });

      // Refrescamos la lista de conversaciones para que el contacto aparezca registrado
      const updated = await getConversations();
      setContacts(updated.map((c) => conversacionToContact(c, currentUserId)));
    },
    [currentUserId]
  );

  // -- Transferir chat a otro vendedor ---------------------------------------
  const transferirChatActivo = useCallback(async (vendedorId: number) => {
    if (!selectedContactId) return;
    try {
      const vendedor = await transferirChat(selectedContactId, vendedorId);
      setContacts((prev) =>
        prev.map((c) =>
          c.id === selectedContactId
            ? { ...c, vendedorAsignado: vendedor, isAssignedToMe: vendedor.id === currentUserId }
            : c
        )
      );
    } catch {
      setError('No se pudo transferir el chat.');
    }
  }, [selectedContactId, currentUserId]);

  // ── Datos derivados ────────────────────────────────────────────────────────
  const selectedContact = contacts.find((c) => c.id === selectedContactId) ?? null;
  const currentMessages = selectedContactId ? (messages[selectedContactId] ?? []) : [];
  const totalUnread = contacts.reduce((sum, c) => sum + c.unreadCount, 0);

  const filterTabs: FilterTab[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'no_leidos', label: 'No le�dos', count: totalUnread || undefined },
    ...etiquetas.map(e => ({ key: String(e.id), label: e.nombre, color: e.color })),
  ];

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    if (!matchesSearch) return false;
    if (activeFilter === 'todos') return true;
    if (activeFilter === 'no_leidos') return c.unreadCount > 0;
    return asignaciones.some(a => a.phone === c.id && String(a.etiqueta_id) === activeFilter);
  });

  return {
    contacts,
    filteredContacts,
    selectedContact,
    selectedContactId,
    setSelectedContactId: handleSelectContact,
    clearSelectedContact: () => setSelectedContactId(null),
    currentMessages,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filterTabs,
    inputValue,
    setInputValue,
    sendMessage,
    sendMedia,
    registerContact,
    transferirChatActivo,
    isLoading,
    error,
    etiquetas,
    setEtiquetas,
    asignaciones,
    setAsignaciones,
  };
};

