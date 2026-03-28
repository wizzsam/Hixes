<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Support\Facades\Auth;

class JWTAuthMiddleware
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
            
            $user = \App\Models\Usuarios::where('id_usuario', $userId)->first();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 401);
            }

            if (!$user->estado) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario desactivado'
                ], 401);
            }

            Auth::guard('api')->setUser($user);
            
            $request->setUserResolver(function () use ($user) {
                return $user;
            });
            
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
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de token: ' . $e->getMessage()
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
