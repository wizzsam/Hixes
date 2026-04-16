import { useState, useCallback } from 'react';
import type { Campana } from '../schemas/campana.interface';
import { campanaService } from '../services/campanaService';

export function useCampanas() {
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async (empresaId?: number) => {
    setLoading(true);
    try {
      const data = await campanaService.obtenerTodas(empresaId ? { empresa_id: empresaId } : undefined);
      setCampanas(data);
    } catch {
      setCampanas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { campanas, loading, refetch };
}
