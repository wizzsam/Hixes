import { axiosWithoutMultipart } from '../../../../api/axiosInstance';
import type { LoginPayload, LoginResponse } from '../schemas/login.interface';

export const loginAuth = async (data: LoginPayload): Promise<LoginResponse> => {
    try {
        const response = await axiosWithoutMultipart.post<LoginResponse>('auth/login', data);
        return response.data;
    } catch (error: any) {
        console.error('Error al iniciar sesión:', error);
        
        // Si el backend envía un JSON con error controlado (ej. credenciales inválidas)
        if (error.response && error.response.data) {
            return error.response.data as LoginResponse;
        }

        return {
            success: false,
            message: 'Error de red o servidor. Inténtalo de nuevo más tarde.'
        };
    }
};
