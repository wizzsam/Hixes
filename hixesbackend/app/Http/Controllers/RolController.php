<?php

namespace App\Http\Controllers;

use App\DTOs\Roles\ActualizarRolDTO;
use App\DTOs\Roles\CrearRolDTO;
use App\Http\Requests\Roles\ActualizarRolRequest;
use App\Http\Requests\Roles\CrearRolRequest;
use App\Services\RolService;
use App\Http\Responses\RolResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\JsonResponse;

class RolController extends Controller
{
    public function __construct(
        private readonly RolService $rolService
    ) {}

    public function crearRol(CrearRolRequest $request): JsonResponse
    {
        try {
            $dto = CrearRolDTO::fromRequest($request->validated());
            $rol = $this->rolService->crearRol($dto);
            
            return RolResponse::rolCreado($rol);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el rol',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function listarRoles(): JsonResponse
    {
        try {
            $roles = $this->rolService->listarRoles();
            return RolResponse::roles($roles);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function obtenerRolPorId($id): JsonResponse
    {
        try {
            $rol = $this->rolService->obtenerRolPorId($id);
            
            if (!$rol) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rol no encontrado'
                ], 404);
            }
            
            return RolResponse::rol($rol);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener rol',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function actualizarRol($id, ActualizarRolRequest $request): JsonResponse
    {
        try {
            $dto = ActualizarRolDTO::fromRequest($request->validated());
            $rol = $this->rolService->actualizarRol($id, $dto);
            
            if (!$rol) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rol no encontrado'
                ], 404);
            }
            
            return RolResponse::rolActualizado($rol);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el rol',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function eliminarRol($id): JsonResponse
    {
        try {
            $result = $this->rolService->eliminarRol($id);
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rol no encontrado o no pudo ser eliminado'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Rol eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el rol',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
