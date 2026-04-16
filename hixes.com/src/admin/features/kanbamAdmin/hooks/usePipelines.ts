import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { listarPipelineEtapas } from '../services/listarPipelines';
import { toggleActivoPipelineEtapa, eliminarPipelineEtapa } from '../services/estadoPipeline';
import { reordenarPipelineEtapas } from '../services/reordenarPipelines';
import type { PipelineEtapa } from '../schemas/pipeline.interface';

export const usePipelines = () => {
    const [etapas, setEtapas] = useState<PipelineEtapa[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchEtapas = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await listarPipelineEtapas();
            setEtapas(data);
        } catch {
            toast.error('Ocurrió un error al cargar las etapas del pipeline.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEtapas();
    }, [fetchEtapas]);

    const toggleActivo = async (id: number) => {
        const success = await toggleActivoPipelineEtapa(id);
        if (success) {
            toast.success('Estado actualizado correctamente.');
            setEtapas(prev =>
                prev.map(e => e.id === id ? { ...e, activo: !e.activo } : e)
            );
        } else {
            toast.error('No se pudo actualizar el estado.');
        }
    };

    const eliminar = async (id: number) => {
        const success = await eliminarPipelineEtapa(id);
        if (success) {
            toast.success('Etapa eliminada correctamente.');
            setEtapas(prev => prev.filter(e => e.id !== id));
        } else {
            toast.error('No se pudo eliminar la etapa.');
        }
    };

    const reordenar = async (nuevasEtapas: PipelineEtapa[]) => {
        setEtapas(nuevasEtapas);
        await reordenarPipelineEtapas(nuevasEtapas.map(e => e.id));
    };

    return {
        etapas,
        isLoading,
        fetchEtapas,
        toggleActivo,
        eliminar,
        reordenar,
    };
};
