<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class NivelResponse
{
    public static function nivelCreado($nivel): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Nivel de fidelización registrado y vinculado correctamente',
            'data'    => self::format($nivel)
        ], 201);
    }

    public static function niveles($niveles): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $niveles->map(fn($n) => self::format($n))
        ], 200);
    }

    public static function nivel($nivel): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => self::format($nivel)
        ], 200);
    }

    public static function nivelActualizada($nivel): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'La configuración del nivel ha sido actualizada',
            'data'    => self::format($nivel)
        ], 200);
    }

    /**
     * Formatea el objeto Nivel para el Frontend.
     * Incluye los datos de la tabla niveles y la relación con empresas.
     */
    private static function format($nivel): array
    {
        return [
            'id'                  => $nivel->id,
            'nombre'              => $nivel->nombre,
            'cashback_porcentaje' => (float) $nivel->cashback_porcentaje,
            'vigencia_dias'       => (int) $nivel->vigencia_dias,
            'consumo_minimo'      => (float) $nivel->consumo_minimo,
            'color'               => $nivel->color,
            'icono'               => $nivel->icono,
            'estado'              => (int) $nivel->estado,
            // Mapeamos las empresas vinculadas a través de la tabla intermedia
            'empresas'            => $nivel->empresas->map(fn($e) => [
                'id'           => $e->id,
                'razon_social' => $e->razon_social
            ])->toArray(),
        ];
    }
}