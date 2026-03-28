<?php

namespace App\Http\Controllers;

use App\DTOs\Servicio\CrearServicioDTO;
use App\DTOs\Servicio\ActualizarServicioDTO;
use App\Http\Requests\Servicio\CrearServicioRequest;
use App\Http\Requests\Servicio\ActualizarServicioRequest;
use App\Services\ServicioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ServicioController extends Controller
{
    public function __construct(
        private readonly ServicioService $servicioService
    ) {}

    /**
     * Registra un nuevo servicio (Tratamiento)
     */
    public function registrarServicio(CrearServicioRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            
            // Transformamos a DTO
            $dto = CrearServicioDTO::fromRequest($validated);
            $servicio = $this->servicioService->crearServicio($dto);
            
            return response()->json([
                'success' => true,
                'message' => 'Servicio registrado correctamente',
                'data'    => $servicio
            ], 201);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar el servicio',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lista todos los servicios
     */
    public function obtenerTodos(): JsonResponse
    {
        try {
            $servicios = $this->servicioService->obtenerTodos();
            return response()->json([
                'success' => true,
                'data'    => $servicios
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar los servicios',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtiene un servicio específico por ID
     */
    public function obtenerServicioPorId($id): JsonResponse
    {
        try {
            $servicio = $this->servicioService->obtenerPorId($id);
            
            if (!$servicio) {
                return response()->json([
                    'success' => false,
                    'message' => 'Servicio no encontrado'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data'    => $servicio
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el servicio',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualiza los datos de un servicio
     */
    public function actualizarServicio($id, ActualizarServicioRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $dto = ActualizarServicioDTO::fromRequest($validated);
            
            $servicio = $this->servicioService->actualizarServicio($id, $dto);
            
            if (!$servicio) {
                return response()->json([
                    'success' => false,
                    'message' => 'Servicio no encontrado'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Servicio actualizado correctamente',
                'data'    => $servicio
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el servicio',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambia el estado del servicio (Toggle Activo/Inactivo)
     */
    public function cambiarEstadoServicio($id): JsonResponse
    {
        try {
            $result = $this->servicioService->cambiarEstadoServicio($id);
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Servicio no encontrado'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Estado del servicio actualizado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar el estado del servicio',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina un servicio (Opcional, según tu lógica de negocio)
     */
    public function eliminarServicio($id): JsonResponse
    {
        try {
            $result = $this->servicioService->eliminarServicio($id);
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Servicio no encontrado o no se pudo eliminar'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Servicio eliminado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el servicio',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}