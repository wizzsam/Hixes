<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class EmpresaResponse
{
    public static function empresaCreada($empresa): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Empresa registrada exitosamente en el sistema Hixes',
            'data'    => self::format($empresa)
        ], 201);
    }

    public static function empresas($empresas): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $empresas->map(fn($e) => self::format($e))
        ], 200);
    }

    public static function empresa($empresa): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => self::format($empresa)
        ], 200);
    }

    public static function empresaActualizada($empresa): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Los datos de la empresa han sido actualizados',
            'data'    => self::format($empresa)
        ], 200);
    }

    private static function format($empresa): array
    {
        return [
            'id'               => $empresa->id,
            'ruc'              => $empresa->ruc,
            'razon_social'     => $empresa->razon_social,
            'nombre_comercial' => $empresa->nombre_comercial ?? 'No definido',
            'direccion'        => $empresa->direccion,
            'telefono'         => $empresa->telefono ?? 'Sin teléfono',
            'logo_path'        => $empresa->logo_path,
            'estado'           => (bool)$empresa->estado,
            'creado_el'        => $empresa->created_at ? $empresa->created_at->format('d/m/Y') : null,
        ];
    }
}