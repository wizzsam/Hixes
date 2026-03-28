export interface EmpresaAsociada {
    id: number;
    razon_social: string;
}

export interface Nivel {
    id: number;
    nombre: string;
    cashback_porcentaje: number;
    vigencia_dias: number;
    consumo_minimo: number;
    color: string;
    icono: string;
    estado: number;
    empresas: EmpresaAsociada[]; // Lo que devuelve tu NivelResponse.php
}