import { useState, useCallback, useEffect } from 'react';
import { obtenerSedes } from '../services/obtenerSedes';
import { cambiarEstadoSede } from '../services/estadoSedes';
import { eliminarSede as eliminarSedeApi } from '../services/eliminarSede';
import type { Sede } from '../schemas/sedes.interface';
import { toast } from 'sonner';

export const useSedes = () => {
    const [sedes, setSedes] = useState<Sede[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchSedes = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await obtenerSedes();
            setSedes(data);
        } catch (error) {
            toast.error('Ocurrió un error al cargar las sedes.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSedes();
    }, [fetchSedes]);

    const toggleEstado = async (id: number) => {
        const success = await cambiarEstadoSede(id);
        if (success) {
            toast.success('Estado actualizado correctamente.');
            setSedes(prev => prev.map(sede => 
                sede.id === id ? { ...sede, estado: sede.estado === 1 ? 0 : 1} : sede
            ));
        } else {
            toast.error('No se pudo actualizar el estado.');
        }
    };

    const deleteSede = async (id: number) => {
        const success = await eliminarSedeApi(id);
        if (success) {
            toast.success('Sede eliminada correctamente.');
            setSedes(prev => prev.filter(sede => sede.id !== id));
        } else {
            toast.error('No se pudo eliminar la sede.');
        }
    };

    return {
        sedes,
        isLoading,
        setSedes,
        fetchSedes,
        toggleEstado,
        deleteSede
    };
};
