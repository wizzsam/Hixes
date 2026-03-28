import { useState, useCallback, useEffect } from 'react';
import { obtenerRoles } from '../services/obtenerRoles';
import { eliminarRol as eliminarRolService } from '../services/eliminarRol';
import type { Rol } from '../schemas/rol.interface';
import { toast } from 'sonner';

export const useRolesAdmin = () => {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchRoles = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await obtenerRoles();
            setRoles(data);
        } catch (error) {
            toast.error('Ocurrió un error al cargar los roles.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const eliminarRol = async (id: number) => {
        const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este rol? Esta acción podría afectar a los usuarios asignados.');
        if (!confirmDelete) return;

        const success = await eliminarRolService(id);
        if (success) {
            toast.success('Rol eliminado correctamente.');
            setRoles(prev => prev.filter(rol => rol.id !== id));
        } else {
            toast.error('No se pudo eliminar el rol.');
        }
    };

    return {
        roles,
        isLoading,
        setRoles,
        fetchRoles,
        eliminarRol
    };
};
