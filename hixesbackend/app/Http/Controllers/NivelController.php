<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\DTOs\Nivel\ActualizarNivelDTO;
use App\DTOs\Nivel\CrearNivelDTO;
use App\Http\Requests\Nivel\ActualizarNivelRequest;
use App\Http\Requests\Nivel\CrearNivelRequest;
use App\Services\NivelService;
use App\Http\Responses\NivelResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\JsonResponse;

class NivelController extends Controller
{
    public function __construct(
        private readonly NivelService $nivelService
    ) {}

    public function registrarNivel(CrearNivelRequest $request): JsonResponse
    {
        try {
            $dto = CrearNivelDTO::fromRequest($request);
            $nivel = $this->nivelService->registrarNivel($dto);
            
            return NivelResponse::nivelCreado($nivel);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el nivel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function obtenerTodos(): JsonResponse
    {
        try {
            // El Service ya debería encargarse de filtrar por empresa si es necesario
            $niveles = $this->nivelService->obtenerTodos();
            return NivelResponse::niveles($niveles);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar niveles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function obtenerNivelPorId($id): JsonResponse
    {
        try {
            $nivel = $this->nivelService->obtenerNivelPorId($id);
            
            if (!$nivel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nivel no encontrado'
                ], 404);
            }
            
            return NivelResponse::nivel($nivel);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el nivel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function actualizarNivel($id, ActualizarNivelRequest $request): JsonResponse
    {
        try {
            $dto = ActualizarNivelDTO::fromRequest($request->validated());
            $nivel = $this->nivelService->actualizarNivel($id, $dto);
            
            if (!$nivel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nivel no encontrado'
                ], 404);
            }
            
            return NivelResponse::nivelActualizada($nivel);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el nivel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cambiarEstadoNivel($id): JsonResponse
    {
        try {
            $result = $this->nivelService->cambiarEstadoNivel($id);
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nivel no encontrado'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Estado del nivel actualizado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar el estado del nivel'
            ], 500);
        }
    }

    public function eliminarNivel($id): JsonResponse
    {
        try {
            $result = $this->nivelService->eliminarNivel($id);
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nivel no encontrado o no pudo ser eliminado'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Nivel eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el nivel',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}