<?php

namespace App\Services;

use App\DTOs\Empresa\ActualizarEmpresaDTO;
use App\DTOs\Empresa\CrearEmpresaDTO;
use App\Repositories\EmpresaRepository;
use App\Models\Empresa;
use Illuminate\Database\Eloquent\Collection;

class EmpresaService
{
    public function __construct(
        private readonly EmpresaRepository $empresaRepository
    ) {}

    public function crearEmpresa(CrearEmpresaDTO $dto): Empresa
    {
        return $this->empresaRepository->crear($dto->toArray());
    }

    public function listarEmpresas(): Collection
    {
        return $this->empresaRepository->obtenerTodas();
    }

    public function obtenerEmpresaPorId(int $id): ?Empresa
    {
        return $this->empresaRepository->buscarPorId($id);
    }

    public function actualizarEmpresa(int $id, ActualizarEmpresaDTO $dto): ?Empresa
    {
        $empresa = $this->empresaRepository->buscarPorId($id);
        
        if (!$empresa) {
            return null;
        }
        return $this->empresaRepository->actualizar($id, $dto->toArray());
    }

    public function cambiarEstadoEmpresa(int $id): bool
    {
        $empresa = $this->empresaRepository->buscarPorId($id);
        
        if (!$empresa) {
            return false;
        }
        $nuevoEstado = !$empresa->estado;
        
        return $this->empresaRepository->actualizar($id, ['estado' => $nuevoEstado]) ? true : false;
    }
}