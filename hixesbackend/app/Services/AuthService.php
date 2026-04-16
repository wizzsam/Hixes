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

        /** @var \Tymon\JWTAuth\JWTGuard $guard */
        $guard = auth('api');

        if (!$token = $guard->attempt($credenciales)) {
            return [
                'success' => false,
                'message' => 'Credenciales inválidas o cuenta inactiva'
            ];
        }

        /** @var \App\Models\Usuarios $user */
        $user = $guard->user();
        $user->load(['rol', 'empresa', 'sede', 'roles']);

        // Marcar vendedor como disponible al iniciar sesión
        $user->sesion_activa = true;
        $user->save();

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
                'roles'           => $user->roles->map(fn($r) => ['id' => $r->id, 'nombre_rol' => $r->nombre_rol])->toArray(),
            ],
            'token' => $token
        ];
    }

    public function cerrarSesion(): array
    {
        /** @var \Tymon\JWTAuth\JWTGuard $guard */
        $guard = auth('api');
        /** @var \App\Models\Usuarios|null $user */
        $user = $guard->user();

        // Marcar vendedor como no disponible al cerrar sesión
        if ($user) {
            $user->sesion_activa = false;
            $user->save();
        }

        $guard->logout();

        return [
            'success' => true,
            'message' => 'Sesión cerrada exitosamente'
        ];
    }
}