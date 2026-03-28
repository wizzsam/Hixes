import { axiosInstance } from '../../../../api/axiosInstance';

export const logoutAuth = async (): Promise<boolean> => {
    try {
        // Le decimos a Laravel que invalide el token actual en su lista negra
        await axiosInstance.post('auth/logout');
        return true;
    } catch (error) {
        console.error('Error al cerrar sesión en el servidor:', error);
        return false;
    }
};
