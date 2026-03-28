import { useState, useCallback, useEffect } from 'react';
import { obtenerUsuarios } from '../services/obtenerUsuarios';
import { cambiarEstadoUsuario } from '../services/estadoUsuario';
import type { Usuario } from '../schemas/usuario.interface';
import { toast } from 'sonner';

export const useUsuarios = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchUsuarios = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await obtenerUsuarios();
            setUsuarios(data);
        } catch (error) {
            toast.error('Ocurrió un error al cargar los usuarios.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);

    const toggleEstado = async (id: number) => {
        const success = await cambiarEstadoUsuario(id);
        if (success) {
            toast.success('Estado actualizado correctamente.');
            setUsuarios(prev => prev.map(usuario => 
                usuario.id_usuario === id ? { ...usuario, estado: usuario.estado === 1 ? 0 : 1} : usuario
            ));
        } else {
            toast.error('No se pudo actualizar el estado.');
        }
    };

    return {
        usuarios,
        isLoading,
        setUsuarios,
        fetchUsuarios,
        toggleEstado
    };
};
