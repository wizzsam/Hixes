import type { CSSProperties } from 'react';
import { Search, Plus, Filter, MessageSquare, Tag } from 'lucide-react';
import { ContactCard } from './ContactCard';
import type { Contact, FilterTab } from '../hooks/useCrm';
import type { CrmEtiqueta, CrmConversacionEtiqueta } from '../services/labelService';

interface ContactListProps {
  contacts: Contact[];
  selectedContactId: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: string;
  onFilterChange: (f: string) => void;
  filterTabs: FilterTab[];
  onSelectContact: (id: string) => void;
  onOpenLabelManager: () => void;
  etiquetas: CrmEtiqueta[];
  asignaciones: CrmConversacionEtiqueta[];
  isLoading?: boolean;
}

export const ContactList = ({
  contacts,
  selectedContactId,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  filterTabs,
  onSelectContact,
  onOpenLabelManager,
  etiquetas: _etiquetas,
  asignaciones,
  isLoading = false,
}: ContactListProps) => {

  const sidebarStyle: CSSProperties = {
    width: 360,
    minWidth: 300,
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    background: '#111b21',
    borderRight: '1px solid #1f2c34',
    overflow: 'hidden',
    flexShrink: 0,
  };

  const headerStyle: CSSProperties = {
    background: '#202c33',
    padding: '14px 16px 0',
    flexShrink: 0,
  };

  const titleRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  };

  const brandStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  };

  const brandIconStyle: CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00A884, #128C7E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
  };

  const titleStyle: CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: '#e9edef',
    letterSpacing: -0.3,
  };

  const actionsRowStyle: CSSProperties = {
    display: 'flex',
    gap: 4,
  };

  const iconBtnStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
    borderRadius: '50%',
    color: '#aebac1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s, color 0.15s',
  };

  const searchWrapStyle: CSSProperties = {
    position: 'relative',
    marginBottom: 8,
  };

  const searchIconWrapStyle: CSSProperties = {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  };

  const searchInputStyle: CSSProperties = {
    width: '100%',
    background: '#2a3942',
    border: 'none',
    outline: 'none',
    borderRadius: 8,
    padding: '8px 12px 8px 38px',
    fontSize: 13.5,
    color: '#d1d7db',
    caretColor: '#00A884',
    boxSizing: 'border-box',
  };

  const filterTabsStyle: CSSProperties = {
    display: 'flex',
    gap: 0,
    borderBottom: '1px solid #1f2c34',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  };

  const listStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  };

  const emptyStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8,
    color: '#8696A0',
  };

  return (
    <aside style={sidebarStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleRowStyle}>
          <div style={brandStyle}>
            <div style={brandIconStyle}>
              <MessageSquare size={18} color="#fff" strokeWidth={2.2} />
            </div>
            <span style={titleStyle}>Mensajes CRM</span>
          </div>
          <div style={actionsRowStyle}>
            <button
              style={iconBtnStyle}
              title="Mis etiquetas"
              onClick={onOpenLabelManager}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#374752'; (e.currentTarget as HTMLButtonElement).style.color = '#e9edef'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#aebac1'; }}
            >
              <Tag size={17} strokeWidth={2} />
            </button>
            <button
              style={iconBtnStyle}
              title="Nuevo chat"
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#374752'; (e.currentTarget as HTMLButtonElement).style.color = '#e9edef'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#aebac1'; }}
            >
              <Plus size={18} strokeWidth={2} />
            </button>
            <button
              style={iconBtnStyle}
              title="Filtros avanzados"
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#374752'; (e.currentTarget as HTMLButtonElement).style.color = '#e9edef'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#aebac1'; }}
            >
              <Filter size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={searchWrapStyle}>
          <div style={searchIconWrapStyle}>
            <Search size={16} color="#8696A0" strokeWidth={2} />
          </div>
          <input
            type="text"
            placeholder="Buscar o iniciar un nuevo chat"
            style={searchInputStyle}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filter tabs */}
        <div style={filterTabsStyle}>
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            const tabColor = tab.color ?? '#00A884';
            const tabStyle: CSSProperties = {
              flex: '0 0 auto',
              padding: '8px 14px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12.5,
              fontWeight: 600,
              color: isActive ? tabColor : '#8696A0',
              borderBottom: isActive ? `2px solid ${tabColor}` : '2px solid transparent',
              transition: 'color 0.15s, border-color 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap',
            };
            const badgeStyle: CSSProperties = {
              background: tabColor,
              color: '#fff',
              borderRadius: 9,
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 5px',
              minWidth: 16,
              textAlign: 'center',
            };
            return (
              <button key={tab.key} style={tabStyle} onClick={() => onFilterChange(tab.key)}>
                {tab.color && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: tab.color, display: 'inline-block' }} />
                )}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span style={badgeStyle}>{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contact list */}
      <div style={listStyle}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 14 }}>
            <div style={{
              width: 36, height: 36,
              border: '3px solid #374752',
              borderTop: '3px solid #00A884',
              borderRadius: '50%',
              animation: 'crmSpin 0.75s linear infinite',
            }} />
            <span style={{ fontSize: 13, color: '#8696A0' }}>Cargando chats…</span>
          </div>
        ) : contacts.length === 0 ? (
          <div style={emptyStyle}>
            <Search size={16} color="#8696A0" strokeWidth={2} />
            <p style={{ fontSize: 13, margin: 0 }}>Sin resultados</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              isSelected={contact.id === selectedContactId}
              onClick={() => onSelectContact(contact.id)}
              asignadas={asignaciones.filter(a => a.phone === contact.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
};