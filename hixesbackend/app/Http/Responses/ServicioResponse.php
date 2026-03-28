<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class ServicioResponse
{
    public static function servicioCreado($servicio): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'El nuevo servicio ha sido registrado exitosamente en Hixes',
            'data'    => self::format($servicio)
        ], 201);
    }

    public static function servicios($servicios): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $servicios->map(fn($s) => self::format($s))
        ], 200);
    }

    public static function servicio($servicio): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => self::format($servicio)
        ], 200);
    }

    public static function servicioActualizado($servicio): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Los datos del tratamiento han sido actualizados correctamente',
            'data'    => self::format($servicio)
        ], 200);
    }

    /**
     * Formatea el modelo Servicio para la respuesta JSON
     */
    private static function format($servicio): array
    {
        return [
            'id'           => $servicio->id,
            'tratamiento'  => $servicio->tratamiento,
            'descripcion'  => $servicio->descripcion ?? 'Sin descripción disponible',
            'precio_base'  => (float)$servicio->precio_base,
            'precio_formateado' => 'S/ ' . number_format($servicio->precio_base, 2),
            'estado'       => (bool)$servicio->estado,
            'creado_el'    => $servicio->created_at ? $servicio->created_at->format('d/m/Y') : null,
            'actualizado_el' => $servicio->updated_at ? $servicio->updated_at->format('d/m/Y H:i') : null,
        ];
    }
}