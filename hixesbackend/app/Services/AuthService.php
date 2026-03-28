<?php

namespace App\Services;

class AuthService
{
    public function iniciarSesion(string $correo, string $password): array
    {
        // Solo usuarios activos pueden iniciar sesión
        $credenciales = [
            'correo'   => $correo,
            'password' => $password,
            'estado'   => 1
        ];

        if (!$token = auth('api')->attempt($credenciales)) {
            return [
                'success' => false,
                'message' => 'Credenciales inválidas o cuenta inactiva'
            ];
        }

        $user = auth('api')->user()->load(['rol', 'empresa', 'sede']);

        return [
            'success' => true,
            'user' => [
                'id_usuario'      => $user->id_usuario,
                'nombre_completo' => $user->nombre_completo,
                'correo'          => $user->correo,
                'rol_id'          => $user->rol_id,
                'nombre_rol'      => $user->rol->nombre_rol ?? null,
                'empresa_id'      => $user->empresa_id,
                'nombre_empresa'  => $user->empresa->nombre_comercial ?? null,
                'sede_id'         => $user->sede_id,
                'nombre_sede'     => $user->sede->nombre_sede ?? null,
            ],
            'token' => $token
        ];
    }

    public function cerrarSesion(): array
    {
        auth('api')->logout();

        return [
            'success' => true,
            'message' => 'Sesión cerrada exitosamente'
        ];
    }
}