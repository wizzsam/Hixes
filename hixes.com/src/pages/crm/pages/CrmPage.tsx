import { useState, type CSSProperties } from 'react';
import { useCrm } from '../hooks/useCrm';
import { ContactList } from '../components/ContactList';
import { ChatWindow } from '../components/ChatWindow';
import { RegisterContactModal } from '../components/RegisterContactModal';
import { LabelManagerModal } from '../components/LabelManagerModal';
import ModalCrearOportunidad from '../../kanbam/components/ModalCrearOportunidad';

/* ─── Keyframe injection (una sola vez, sin archivo CSS externo) ─────────── */
const STYLE_ID = 'crm-keyframes';
if (!document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes bubbleIn {
      from { opacity: 0; transform: translateY(6px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)  scale(1);    }
    }
    @keyframes crmSpin {
      to { transform: rotate(360deg); }
    }
    .crm-scroll::-webkit-scrollbar { width: 5px; }
    .crm-scroll::-webkit-scrollbar-track { background: transparent; }
    .crm-scroll::-webkit-scrollbar-thumb { background: #374752; border-radius: 4px; }
  `;
  document.head.appendChild(s);
}

export default function CrmPage() {
  /* El TrabajadorLayout ya tiene header/sidebar propios, así que el CRM
     ocupa todo el contenido disponible sin re-añadir esos elementos. */

  const {
    filteredContacts,
    selectedContact,
    selectedContactId,
    setSelectedContactId,
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
    etiquetas,
    setEtiquetas,
    asignaciones,
    setAsignaciones,
    clearSelectedContact,
    isLoading,
  } = useCrm();

  /* En mobile: mostrar lista o chat alternativamente */
  const [mobilePanelView, setMobilePanelView] = useState<'list' | 'chat'>('list');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showOportunidadModal, setShowOportunidadModal] = useState(false);
  const [showLabelManager, setShowLabelManager] = useState(false);

  const handleSelectContact = (id: string) => {
    setSelectedContactId(id);
    setMobilePanelView('chat');
  };

  const handleBack = () => {
    setMobilePanelView('list');
    clearSelectedContact();
  };

  /* ── Layout root: ocupa el espacio restante del TrabajadorLayout ──────── */
  const rootStyle: CSSProperties = {
    display: 'flex',
    overflow: 'hidden',
    borderRadius: 12,
    boxShadow: '0 4px 32px rgba(0,0,0,0.45)',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    background: '#111b21',
    margin: '-24px -32px',
    width: 'calc(100% + 64px)',
    height: 'calc(100% + 48px)',
  };

  return (
    <div style={rootStyle}>
      {/* ── Modal: registrar contacto desconocido ── */}
      {showRegisterModal && selectedContact?.isUnknown && (
        <RegisterContactModal
          phone={selectedContact.phone}
          onConfirm={(nombre, dni) =>
            registerContact(selectedContact.phone, nombre, dni)
          }
          onClose={() => setShowRegisterModal(false)}
        />
      )}

      {/* ── Modal: crear oportunidad ── */}
      {showOportunidadModal && selectedContact && !selectedContact.isUnknown && (
        <ModalCrearOportunidad
          clienteIdInicial={selectedContact.clienteId}
          clienteNombreInicial={selectedContact.name}
          onClose={() => setShowOportunidadModal(false)}
          onCreated={() => setShowOportunidadModal(false)}
        />
      )}

      {showLabelManager && (
        <LabelManagerModal
          etiquetas={etiquetas}
          onClose={() => setShowLabelManager(false)}
          onUpdate={setEtiquetas}
        />
      )}

      {/* ── Panel izquierdo: lista de contactos ── */}
      <div
        style={{
          display: 'flex',
          /* En mobile solo se muestra si estamos viendo la lista */
          ...(window.innerWidth < 768 && mobilePanelView !== 'list'
            ? { display: 'none' }
            : {}),
        }}
      >
        <ContactList
          contacts={filteredContacts}
          selectedContactId={selectedContactId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          filterTabs={filterTabs}
          onSelectContact={handleSelectContact}
          onOpenLabelManager={() => setShowLabelManager(true)}
          etiquetas={etiquetas}
          asignaciones={asignaciones}
          isLoading={isLoading}
        />
      </div>

      {/* ── Separador vertical decorativo ── */}
      <div
        style={{
          width: 1,
          background: '#1f2c34',
          flexShrink: 0,
        }}
      />

      {/* ── Panel derecho: ventana de chat ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
          /* En mobile solo se muestra si estamos viendo el chat */
          ...(window.innerWidth < 768 && mobilePanelView !== 'chat'
            ? { display: 'none' }
            : {}),
        }}
      >
        <ChatWindow
          contact={selectedContact}
          messages={currentMessages}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={sendMessage}
          onSendMedia={sendMedia}
          onBack={selectedContact ? handleBack : undefined}
          onScheduleContact={
            selectedContact?.isUnknown &&
            (selectedContact.isAssignedToMe || !selectedContact.vendedorAsignado)
              ? () => setShowRegisterModal(true)
              : undefined
          }
          onCrearOportunidad={
            selectedContact && !selectedContact.isUnknown
              ? () => setShowOportunidadModal(true)
              : undefined
          }
          onTransferirChat={selectedContact?.isAssignedToMe ? transferirChatActivo : undefined}
          etiquetas={etiquetas}
          asignaciones={asignaciones}
          onAsignacionesChange={setAsignaciones}
        />
      </div>
    </div>
  );
}