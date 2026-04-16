import { axiosAuth } from '../../../../api/axiosInstance';
import type { UsuarioFormValues } from '../schemas/usuarioSchemas';
import type { Usuario } from '../schemas/usuario.interface';

export const crearUsuario = async (data: UsuarioFormValues): Promise<Usuario | null> => {
    try {
        const response = await axiosAuth.post<{success: boolean, data: Usuario}>('usuarios', data);
        if (response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('Error al crear usuario:', error);
        return null;
    }
};
