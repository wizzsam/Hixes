<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class RolResponse
{
    public static function rolCreado($rol): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Rol registrado exitosamente',
            'data'    => self::format($rol)
        ], 201);
    }

    public static function roles($roles): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $roles->map(fn($r) => self::format($r))
        ], 200);
    }

    public static function rol($rol): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => self::format($rol)
        ], 200);
    }

    public static function rolActualizado($rol): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Los datos del rol han sido actualizados',
            'data'    => self::format($rol)
        ], 200);
    }

    private static function format($rol): array
    {
        return [
            'id'          => $rol->id,
            'nombre_rol'  => $rol->nombre_rol,
            'descripcion' => $rol->descripcion,
        ];
    }
}
