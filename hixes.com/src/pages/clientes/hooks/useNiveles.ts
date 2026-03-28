import { useState, useCallback, useEffect } from 'react';
import { nivelesService } from '../services/nivelesService';
import type { Nivel } from '../schemas/cliente.interface';
import { toast } from 'sonner';

export const useNiveles = () => {
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNiveles = async () => {
      try {
        const data = await nivelesService.obtenerNiveles();
        setNiveles(data.map(n => ({
          ...n,
          cashback_porcentaje: parseFloat(String(n.cashback_porcentaje ?? 0)),
          consumo_minimo: parseFloat(String(n.consumo_minimo ?? 0)),
          vigencia_dias: parseInt(String(n.vigencia_dias ?? 0), 10),
        })));
      } catch (error) {
        console.error('Error al cargar niveles:', error);
        toast.error('Error al cargar los niveles de fidelización');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNiveles();
  }, []);

  const getNivelActual = useCallback((consumoAcumulado: number): Nivel | null => {
    if (niveles.length === 0) return null;
    return niveles.slice().reverse().find(n => consumoAcumulado >= n.consumo_minimo) ?? niveles[0];
  }, [niveles]);

  const getSiguienteNivel = useCallback((nivelActual: Nivel | null): Nivel | null => {
    if (!nivelActual || niveles.length === 0) return null;
    const idx = niveles.findIndex(n => n.id === nivelActual.id);
    return idx >= 0 && idx < niveles.length - 1 ? niveles[idx + 1] : null;
  }, [niveles]);

  return { niveles, isLoading, getNivelActual, getSiguienteNivel };
};
