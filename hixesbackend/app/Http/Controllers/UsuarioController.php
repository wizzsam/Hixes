<?php

namespace App\Http\Controllers;

use App\DTOs\Usuarios\ActualizarUsuarioDTO;
use App\DTOs\Usuarios\CrearUsuarioDTO;
use App\Http\Requests\Usuarios\ActualizarUsuarioRequest;
use App\Http\Requests\Usuarios\CrearUsuarioRequest;
use App\Services\UsuarioService;
use App\Http\Responses\UsuarioResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\JsonResponse;

class UsuarioController extends Controller
{
    public function __construct(
        private readonly UsuarioService $usuarioService
    ) {}

    public function crearUsuario(CrearUsuarioRequest $request): JsonResponse
    {
        try {
            $dto = CrearUsuarioDTO::fromRequest($request->validated());
            $usuario = $this->usuarioService->crearUsuario($dto);
            
            return UsuarioResponse::usuarioCreado($usuario);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function listarUsuarios(): JsonResponse
    {
        try {
            $usuarios = $this->usuarioService->listarUsuarios();
            return UsuarioResponse::usuarios($usuarios);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar usuarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function listarAdministradores(): JsonResponse
    {
        try {
            $admins = $this->usuarioService->listarAdministradores();
            return UsuarioResponse::usuarios($admins);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar administradores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function obtenerUsuarioPorId($id): JsonResponse
    {
        try {
            $usuario = $this->usuarioService->obtenerUsuarioPorId($id);
            
            if (!$usuario) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }
            
            return UsuarioResponse::usuario($usuario);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function actualizarUsuario($id, ActualizarUsuarioRequest $request): JsonResponse
    {
        try {
            $dto = ActualizarUsuarioDTO::fromRequest($request->validated());
            $usuario = $this->usuarioService->actualizarUsuario($id, $dto);
            
            if (!$usuario) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }
            
            return UsuarioResponse::usuarioActualizado($usuario);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cambiarEstadoUsuario($id): JsonResponse
    {
        try {
            $result = $this->usuarioService->cambiarEstadoUsuario($id);
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Estado del usuario modificado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar el estado del usuario'
            ], 500);
        }
    }
}