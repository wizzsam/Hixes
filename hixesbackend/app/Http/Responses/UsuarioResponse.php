<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class UsuarioResponse
{
    public static function usuarioCreado($usuario): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'data'    => self::format($usuario)
        ], 201);
    }

    public static function usuarios($usuarios): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $usuarios->map(fn($u) => self::format($u))
        ], 200);
    }

    public static function usuario($usuario): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => self::format($usuario)
        ], 200);
    }

    public static function usuarioActualizado($usuario): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Los datos del usuario han sido actualizados',
            'data'    => self::format($usuario)
        ], 200);
    }

    private static function format($usuario): array
    {
        $roles = $usuario->relationLoaded('roles')
            ? $usuario->roles->map(fn($r) => ['id' => $r->id, 'nombre_rol' => $r->nombre_rol])->values()->toArray()
            : ($usuario->rol ? [['id' => $usuario->rol->id, 'nombre_rol' => $usuario->rol->nombre_rol]] : []);

        return [
            'id_usuario'      => $usuario->id_usuario,
            'rol_id'          => $usuario->rol_id,
            'nombre_rol'      => $roles[0]['nombre_rol'] ?? null,
            'roles'           => $roles,
            'nombre_completo' => $usuario->nombre_completo,
            'correo'          => $usuario->correo,
            'empresa_id'      => $usuario->empresa_id,
            'sede_id'         => $usuario->sede_id,
            'nombre_empresa'  => $usuario->empresa->razon_social ?? 'SISTEMA GLOBAL',
            'estado'          => (bool)$usuario->estado,
            'creado_el'       => $usuario->created_at ? $usuario->created_at->format('d/m/Y') : null,
            'sedes'           => $usuario->relationLoaded('sedes')
                ? $usuario->sedes->map(fn($s) => ['id' => $s->id, 'nombre_sede' => $s->nombre_sede])->values()->toArray()
                : [],
        ];
    }
}