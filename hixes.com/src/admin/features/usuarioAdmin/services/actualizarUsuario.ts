import { axiosAuth } from '../../../../api/axiosInstance';
import type { UsuarioFormValues } from '../schemas/usuarioSchemas';
import type { Usuario } from '../schemas/usuario.interface';

export const actualizarUsuario = async (id: number, data: Partial<UsuarioFormValues>): Promise<Usuario | null> => {
    try {
        const response = await axiosAuth.patch<{success: boolean, data: Usuario}>(`usuarios/${id}`, data);
        if (response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return null;
    }
};
