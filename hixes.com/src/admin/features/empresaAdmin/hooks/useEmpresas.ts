import { useState, useCallback, useEffect } from 'react';
import { listarEmpresas } from '../services/listarEmpresa';
import { cambiarEstadoEmpresa } from '../services/estadoEmpresa';
import type { Empresa } from '../schemas/empresa.interface';
import { toast } from 'sonner';

export const useEmpresas = () => {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchEmpresas = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await listarEmpresas();
            setEmpresas(data);
        } catch (error) {
            toast.error('Ocurrió un error al cargar las empresas.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmpresas();
    }, [fetchEmpresas]);

    const toggleEstado = async (id: number) => {
        const success = await cambiarEstadoEmpresa(id);
        if (success) {
            toast.success('Estado actualizado correctamente.');
            setEmpresas(prev => prev.map(emp => 
                emp.id === id ? { ...emp, estado: emp.estado === 1 ? 0 : 1} : emp
            ));
        } else {
            toast.error('No se pudo actualizar el estado.');
        }
    };

    return {
        empresas,
        isLoading,
        fetchEmpresas,
        toggleEstado
    };
};
