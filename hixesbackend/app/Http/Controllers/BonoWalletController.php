<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\DTOs\BonoWallet\ActualizarBonoDTO;
use App\DTOs\BonoWallet\CrearBonoDTO;
use App\Http\Requests\BonoWallet\ActualizarBonoRequest;
use App\Http\Requests\BonoWallet\CrearBonoRequest;
use App\Services\BonoWalletService;
use App\Http\Responses\BonoWalletResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\JsonResponse;

class BonoWalletController extends Controller
{
    public function __construct(
        private readonly BonoWalletService $bonoService
    ) {}

    public function registrarBono(CrearBonoRequest $request): JsonResponse
    {
        try {
            $dto = CrearBonoDTO::fromRequest($request->validated());
            $bono = $this->bonoService->registrarBono($dto);
            
            return BonoWalletResponse::bonoCreado($bono);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el bono',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function obtenerTodos(): JsonResponse
    {
        try {
            $bonos = $this->bonoService->obtenerTodos();
            return BonoWalletResponse::bonos($bonos);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar los bonos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function obtenerBonoPorId($id): JsonResponse
    {
        try {
            $bono = $this->bonoService->obtenerBonoPorId($id);
            
            if (!$bono) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bono no encontrado'
                ], 404);
            }
            
            return BonoWalletResponse::bono($bono);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el bono',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function actualizarBono($id, ActualizarBonoRequest $request): JsonResponse
    {
        try {
            $dto = ActualizarBonoDTO::fromRequest($request->validated());
            $bono = $this->bonoService->actualizarBono($id, $dto);
            
            if (!$bono) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bono no encontrado'
                ], 404);
            }
            
            return BonoWalletResponse::bonoActualizado($bono);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el bono',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cambiarEstadoBono($id): JsonResponse
    {
        try {
            $result = $this->bonoService->cambiarEstadoBono($id);
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bono no encontrado'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Estado del bono actualizado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar el estado del bono'
            ], 500);
        }
    }

    public function eliminarBono($id): JsonResponse
    {
        try {
            $result = $this->bonoService->eliminarBono($id);
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bono no encontrado o no pudo ser eliminado'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Bono eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el bono',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}