import { useState, useCallback } from 'react';
import type { RecordatorioCashback } from '../schemas/recordatorio.interface';
import { recordatoriosService } from '../services/recordatoriosService';

export function useRecordatorios() {
  const [recordatorios, setRecordatorios] = useState<RecordatorioCashback[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recordatoriosService.obtenerTodos();
      setRecordatorios(data);
    } catch {
      setRecordatorios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { recordatorios, loading, refetch };
}
