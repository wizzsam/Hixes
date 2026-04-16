import { axiosWithoutMultipart } from '../../../api/axiosInstance';

export interface ReporteVendedor {
    vendedor: string;
    total: number;
    cerradas: number;
    perdidas: number;
    valor_total: number;
}

export interface ReporteEmbudo {
    etapa: string;
    cantidad: number;
    porcentaje: number;
}

export interface ReporteOportunidades {
    total_oportunidades: number;
    ventas_cerradas: number;
    valor_ventas_cerradas: number;
    por_vendedor: ReporteVendedor[];
    embudo: ReporteEmbudo[];
}

export const getReporteOportunidades = async (): Promise<ReporteOportunidades> => {
    const response = await axiosWithoutMultipart.get<ReporteOportunidades>('reportes/oportunidades');
    return response.data;
};
