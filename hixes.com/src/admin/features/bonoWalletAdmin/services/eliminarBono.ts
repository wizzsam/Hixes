import { axiosWithoutMultipart } from '../../../../api/axiosInstance';

/**
 * Elimina una escala de bono permanentemente.
 * @param id ID del bono a eliminar
 */
export const eliminarBono = async (id: number): Promise<boolean> => {
    try {
        // Usamos el ID para la ruta 'bonos/{id}' definida en tu api.php
        const response = await axiosWithoutMultipart.delete(`bonos/${id}`);
        
        // Retornamos true si el backend confirma el éxito
        return response.data.success;
    } catch (error: any) {
        // Si el backend envía un mensaje de error (ej: por integridad referencial), lo lanzamos
        throw new Error(error.response?.data?.message || 'No se pudo eliminar la escala de bono.');
    }
};