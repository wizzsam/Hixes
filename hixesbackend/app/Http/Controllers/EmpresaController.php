<?php

namespace App\Http\Controllers;

use App\DTOs\Empresa\ActualizarEmpresaDTO;
use App\DTOs\Empresa\CrearEmpresaDTO;
use App\Http\Requests\Empresa\ActualizarEmpresaRequest;
use App\Http\Requests\Empresa\CrearEmpresaRequest;
use App\Services\EmpresaService;
use App\Http\Responses\EmpresaResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\JsonResponse;

class EmpresaController extends Controller
{
    public function __construct(
        private readonly EmpresaService $empresaService
    ) {}

    public function crearEmpresa(CrearEmpresaRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            
            if ($request->hasFile('logo')) {
                $file = $request->file('logo');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads/logos'), $filename);
                $validated['logo_path'] = '/uploads/logos/' . $filename;
            }

            // Transformamos el Request validado en un DTO
            $dto = CrearEmpresaDTO::fromRequest($validated);
            $empresa = $this->empresaService->crearEmpresa($dto);
            
            return EmpresaResponse::empresaCreada($empresa);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la empresa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function listarEmpresas(): JsonResponse
    {
        try {
            $empresas = $this->empresaService->listarEmpresas();
            return EmpresaResponse::empresas($empresas);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar empresas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function obtenerEmpresaPorId($id): JsonResponse
    {
        try {
            $empresa = $this->empresaService->obtenerEmpresaPorId($id);
            
            if (!$empresa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Empresa no encontrada'
                ], 404);
            }
            
            return EmpresaResponse::empresa($empresa);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la empresa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function actualizarEmpresa($id, ActualizarEmpresaRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            
            if ($request->hasFile('logo')) {
                $file = $request->file('logo');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads/logos'), $filename);
                $validated['logo_path'] = '/uploads/logos/' . $filename;
            }

            $dto = ActualizarEmpresaDTO::fromRequest($validated);
            $empresa = $this->empresaService->actualizarEmpresa($id, $dto);
            
            if (!$empresa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Empresa no encontrada'
                ], 404);
            }
            
            return EmpresaResponse::empresaActualizada($empresa);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la empresa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cambiarEstadoEmpresa($id): JsonResponse
    {
        try {
            $result = $this->empresaService->cambiarEstadoEmpresa($id);
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Empresa no encontrada'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Estado de la empresa actualizado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar el estado de la empresa'
            ], 500);
        }
    }
}