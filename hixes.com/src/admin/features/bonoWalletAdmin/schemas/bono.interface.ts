export interface EmpresaVinculada {
    id: number;
    razon_social: string;
}

export interface BonoWallet {
    id: number;
    monto_minimo: number;
    monto_maximo: number | null;
    bono_porcentaje: number;
    empresas: EmpresaVinculada[];
}

export interface BonoWalletFormInput {
    monto_minimo: number;
    monto_maximo?: number | null;
    bono_porcentaje: number;
    empresa_ids: number[];
}

export interface BonoWalletEditInput {
    id: number;
    monto_minimo: number;
    monto_maximo: number | null;
    bono_porcentaje: number;
    beneficio: string;
    empresas_ids: number[];
}