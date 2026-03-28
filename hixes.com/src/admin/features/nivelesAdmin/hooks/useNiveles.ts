import { useState, useEffect, useCallback } from 'react';
import { listarNiveles } from '../services/listarNiveles';
import type { Nivel } from '../schemas/niveles.interface';
import { toast } from 'sonner';

export const useNiveles = () => {
    const [niveles, setNiveles] = useState<Nivel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchNiveles = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listarNiveles();
            setNiveles(data);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNiveles();
    }, [fetchNiveles]);

    return { niveles, loading, refetch: fetchNiveles };
};