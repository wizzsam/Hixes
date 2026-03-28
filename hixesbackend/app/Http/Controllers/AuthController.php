<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->iniciarSesion(
                $request->validated()['correo'],
                $request->validated()['password']
            );

            return response()->json($result, $result['success'] ? 200 : 401);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function logout(): JsonResponse
    {
        try {
            $result = $this->authService->cerrarSesion();

            return response()->json($result, 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar sesión',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function me(): JsonResponse
    {
        try {
            $user = auth('api')->user()->load(['rol', 'empresa', 'sede']);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            return response()->json([
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
                    'estado'          => (bool)$user->estado
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retorna las sedes/sistemas asignados al usuario logueado.
     * Usado por el portal del trabajador para mostrar las tarjetas de acceso.
     */
    public function misSistemas(): JsonResponse
    {
        try {
            $user = auth('api')->user()->load(['rol', 'sede.empresa', 'empresa']);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $nombreRol = $user->rol->nombre_rol ?? null;
            $sistemas  = [];

            if ($user->sede_id && $user->sede) {
                // SI TIENE UNA SEDE ASIGNADA: solo ve su sede (sin importar que sea ADMIN_EMPRESA o TRABAJADOR)
                $sistemas[] = [
                    'sede_id'        => $user->sede->id,
                    'nombre_sede'    => $user->sede->nombre_sede,
                    'direccion_sede' => $user->sede->direccion_sede,
                    'empresa_id'     => $user->sede->empresa_id,
                    'nombre_empresa' => $user->sede->empresa->nombre_comercial ?? null,
                    'logo_empresa'   => $user->sede->empresa->logo_path ?? null,
                ];
            } elseif ($nombreRol === 'ADMIN_EMPRESA' && $user->empresa_id) {
                // ADMIN_EMPRESA SIN SEDE ASIGNADA (sede_id = null): ve todas las sedes activas de su empresa
                $sedes = \App\Models\Sede::with('empresa')
                    ->where('empresa_id', $user->empresa_id)
                    ->where('estado', true)
                    ->get();

                foreach ($sedes as $sede) {
                    $sistemas[] = [
                        'sede_id'        => $sede->id,
                        'nombre_sede'    => $sede->nombre_sede,
                        'direccion_sede' => $sede->direccion_sede,
                        'empresa_id'     => $sede->empresa_id,
                        'nombre_empresa' => $sede->empresa->nombre_comercial ?? null,
                        'logo_empresa'   => $sede->empresa->logo_path ?? null,
                    ];
                }
            }

            return response()->json([
                'success'  => true,
                'sistemas' => $sistemas,
                'usuario'  => [
                    'nombre_completo' => $user->nombre_completo,
                    'nombre_rol'      => $nombreRol,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener sistemas',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
