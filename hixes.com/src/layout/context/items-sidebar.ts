import {
    Settings,
    Image,
    UserCheck,
    TrendingUp,
    BarChart3,
    Blocks,
    Bell,
    Megaphone,
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

export const menuItems: MenuItem[] = [
    
    {
        titulo: 'Gestión de Negocios',
        icon: Settings,
        subMenu: [
            {
                titulo: 'Empresas',
                link: '/administrator/empresas',
                icon: Image,
            },
            {
                titulo: 'Sedes',
                link: '/administrator/sedes',
                icon: UserCheck,
            },
        ],
    },
       {
        titulo: 'Gestión de Usuarios',
        icon: UserCheck,
        subMenu: [
            {
                titulo: 'Usuarios',
                link: '/administrator/usuarios',
                icon: UserCheck,
            },
             {
                titulo: 'Roles',
                link: '/administrator/roles',
                icon: UserCheck,
            },
        ],
    },
    {
        titulo: 'Niveles',
        link: '/administrator/niveles',
        icon: TrendingUp
    },
    {
        titulo: 'Bono Wallets',
        link: '/administrator/wallets',
        icon: BarChart3
    },
    {
        titulo: 'Servicios',
        link: '/administrator/servicios',
        icon: Blocks
    },
    {
        titulo: 'Pipelines',
        icon: Blocks,
        link: '/administrator/pipelines'
    },
    {
        titulo: 'Recordatorios',
        icon: Bell,
        link: '/administrator/recordatorios-cashback'
    },
    {
        titulo: 'Campañas',
        icon: Megaphone,
        link: '/administrator/campanas'
    }
];
