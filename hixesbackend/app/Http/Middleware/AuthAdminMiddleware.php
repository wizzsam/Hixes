<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\Usuarios;
use App\Utils\RolesEnum;

class AuthAdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token de acceso requerido'
                ], 401);
            }

            JWTAuth::setToken($token);
            
            $payload = JWTAuth::getPayload();
            $userId = $payload->get('sub');
            
            $usuario = Usuarios::with('rol')->where('id_usuario', $userId)->first();
            
            if (!$usuario) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 401);
            }

            if (!$usuario->estado) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario desactivado'
                ], 401);
            }

            // Validar que el rol devuelto sea igual al esperado (SUPER_ADMIN o lo que devuelva RolesEnum)
            if ($usuario->rol->nombre_rol !== RolesEnum::ADMINISTRADOR->getName()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado: Se requieren permisos de administrador'
                ], 403);
            }

            $request->merge(['authenticated_user' => $usuario]);
            
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token expirado'
            ], 401);
        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido'
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de autenticación: ' . $e->getMessage()
            ], 500);
        }

        return $next($request);
    }
}