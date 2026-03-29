import { axiosAuth } from '../../../../api/axiosInstance';

export interface SedeSimple {
    id: number;
    nombre_sede: string;
    direccion_sede?: string;
}

export const obtenerSedesPorEmpresa = async (empresaId: number): Promise<SedeSimple[]> => {
    try {
        const response = await axiosAuth.get<{ success: boolean; data: SedeSimple[] }>('sedes', {
            params: { empresa_id: empresaId },
        });
        if (response.data.success) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error('Error al obtener sedes por empresa:', error);
        return [];
    }
};
