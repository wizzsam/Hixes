<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class SedeResponse
{
    public static function sedeCreada($sede): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Sede registrada exitosamente',
            'data'    => self::format($sede)
        ], 201);
    }

    public static function sedes($sedes): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $sedes->map(fn($s) => self::format($s))
        ], 200);
    }

    public static function sede($sede): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => self::format($sede)
        ], 200);
    }

    public static function sedeActualizada($sede): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Los datos de la sede han sido actualizados',
            'data'    => self::format($sede)
        ], 200);
    }

    private static function format($sede): array
    {
        return [
            'id'             => $sede->id,
            'empresa_id'     => $sede->empresa_id,
            'empresa_nombre' => $sede->empresa->razon_social ?? null,
            'nombre_sede'    => $sede->nombre_sede,
            'direccion_sede' => $sede->direccion_sede,
            'estado'         => $sede->estado,
        ];
    }
}
