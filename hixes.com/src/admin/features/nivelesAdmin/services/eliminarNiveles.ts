import { axiosWithoutMultipart } from '../../../../api/axiosInstance';

/**
 * Elimina un nivel permanentemente de la base de datos.
 * @param id ID del nivel a eliminar
 */
export const eliminarNivel = async (id: number): Promise<boolean> => {
    try {
        const response = await axiosWithoutMultipart.delete(`niveles/${id}`);
        // Asumiendo que tu controlador devuelve { success: true }
        return response.data.success;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'No se pudo eliminar el nivel');
    }
};