import {
    LayoutDashboard,
    Users,
    CalendarDays,
    Megaphone,
    type LucideIcon
} from 'lucide-react';

export interface MenuItem {
    titulo: string;
    icon: LucideIcon;
    link?: string; 
    subMenu?: SubMenuItem[];
    /** Si se define, el usuario debe tener AL MENOS UNO de estos roles para ver el ítem */
    roles?: string[];
}

export interface SubMenuItem {
    titulo: string;
    link: string;
    icon: LucideIcon;
}

export const menuItemsTrabajador: MenuItem[] = [
    {
        titulo: 'Dashboard',
        icon: LayoutDashboard,
        link: '/trabajador/dashboard'
        // Sin restricción de rol: visible para todos
    },
    {
        titulo: 'Cashback - Wallet',
        icon: Users,
        link: '/trabajador/clientes',
        roles: ['ADMIN_EMPRESA']
    },
    {
        titulo: 'CRM',
        icon: Users,
        link: '/trabajador/crm',
        roles: ['VENTAS']
    },
    {
        titulo: 'Kanbam',
        icon: Users,
        link: '/trabajador/kanbam',
        roles: ['VENTAS']
    },
    {
        titulo: 'Campañas',
        icon: Megaphone,
        link: '/trabajador/campanas',
        roles: ['VENTAS']
    },
    {
        titulo: 'Calendario',
        icon: CalendarDays,
        link: '/trabajador/calendario',
        roles: ['VENTAS']
    },
    {
        titulo: 'Clientes',
        icon: Users,
        link: '/trabajador/clientes-general',
        roles: ['ADMIN_EMPRESA']
    },
];
