import { useState, useCallback, useEffect } from 'react';
import { obtenerRoles, type Rol } from '../services/obtenerRoles';
import { toast } from 'sonner';

export const useRoles = () => {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState<boolean>(true);

    const fetchRoles = useCallback(async () => {
        setIsLoadingRoles(true);
        try {
            const data = await obtenerRoles();
            setRoles(data);
        } catch (error) {
            toast.error('Ocurrió un error al cargar los roles.');
        } finally {
            setIsLoadingRoles(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    return {
        roles,
        isLoadingRoles,
        fetchRoles
    };
};
