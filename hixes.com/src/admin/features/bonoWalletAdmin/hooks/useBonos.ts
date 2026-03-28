import { useState, useEffect, useCallback } from 'react';
import type { BonoWallet } from '../schemas/bono.interface';
import { obtenerBonos } from '../services/listarBono';

export const useBonos = () => {
    const [bonos, setBonos] = useState<BonoWallet[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBonos = useCallback(async () => {
        setLoading(true);
        try {
            const data = await obtenerBonos();
            setBonos(data);
        } catch (error) {
            console.error("Error al cargar bonos", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBonos();
    }, [fetchBonos]);

    return { bonos, loading, refetch: fetchBonos };
};