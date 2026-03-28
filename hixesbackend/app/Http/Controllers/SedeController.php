<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\DTOs\Sede\ActualizarSedeDTO;
use App\DTOs\Sede\CrearSedeDTO;
use App\Http\Requests\Sede\ActualizarSedeRequest;
use App\Http\Requests\Sede\CrearSedeRequest;
use App\Services\SedeService;
use App\Http\Responses\SedeResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\JsonResponse;

class SedeController extends Controller
{
    public function __construct(
        private readonly SedeService $sedeService
    ) {}

    public function registrarSede(CrearSedeRequest $request): JsonResponse
    {
        try {
            $dto = CrearSedeDTO::fromRequest($request);
            $sede = $this->sedeService->registrarSede($dto);
            
            return SedeResponse::sedeCreada($sede);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la sede',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function obtenerTodas(Request $request): JsonResponse
    {
        try {
            $empresaId = $request->query('empresa_id');
            $sedes = $this->sedeService->obtenerTodas($empresaId);
            return SedeResponse::sedes($sedes);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar sedes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function obtenerPublicas(Request $request): JsonResponse
    {
        try {
            $empresaId = $request->query('empresa_id');
            if (!$empresaId) {
                return response()->json(['success' => false, 'message' => 'empresa_id requerido'], 422);
            }
            $sedes = \App\Models\Sede::where('empresa_id', $empresaId)
                ->where('estado', true)
                ->select('id', 'nombre_sede')
                ->orderBy('nombre_sede')
                ->get();
            return response()->json(['success' => true, 'data' => $sedes]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar sedes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function obtenerSedePorId($id): JsonResponse
    {
        try {
            $sede = $this->sedeService->obtenerSedePorId($id);
            
            if (!$sede) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sede no encontrada'
                ], 404);
            }
            
            return SedeResponse::sede($sede);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la sede',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function actualizarSede($id, ActualizarSedeRequest $request): JsonResponse
    {
        try {
            $dto = ActualizarSedeDTO::fromRequest($request->validated());
            $sede = $this->sedeService->actualizarSede($id, $dto);
            
            if (!$sede) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sede no encontrada'
                ], 404);
            }
            
            return SedeResponse::sedeActualizada($sede);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la sede',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cambiarEstadoSede($id): JsonResponse
    {
        try {
            $result = $this->sedeService->cambiarEstadoSede($id);
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sede no encontrada'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Estado de la sede actualizado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar el estado de la sede'
            ], 500);
        }
    }

    public function eliminarSede($id): JsonResponse
    {
        try {
            $result = $this->sedeService->eliminarSede($id);
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sede no encontrada o no pudo ser eliminada'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Sede eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la sede',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
