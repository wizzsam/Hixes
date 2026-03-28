<?php

namespace App\Repositories;

use App\Models\Empresa;
use Illuminate\Database\Eloquent\Collection;

class EmpresaRepository
{
    public function crear(array $data): Empresa
    {
        return Empresa::create($data);
    }

    public function obtenerTodas(): Collection
    {
        return Empresa::orderBy('id', 'desc')->get();
    }

    public function buscarPorId(int $id): ?Empresa
    {
        return Empresa::find($id);
    }

    public function actualizar(int $id, array $data): ?Empresa
    {
        $empresa = $this->buscarPorId($id);
        
        if ($empresa) {
            $empresa->update($data);
            return $empresa;
        }

        return null;
    }

    public function eliminar(int $id): bool
    {
        $empresa = $this->buscarPorId($id);
        return $empresa ? $empresa->delete() : false;
    }
}