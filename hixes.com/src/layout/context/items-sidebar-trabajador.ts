import {
    LayoutDashboard,
    Users,
   
    type LucideIcon
} from 'lucide-react';

export interface MenuItem {
    titulo: string;
    icon: LucideIcon;
    link?: string; 
    subMenu?: SubMenuItem[];
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
    },
    {
        titulo: 'Clientes',
        icon: Users,
        link: '/trabajador/clientes'
    },
  
];
