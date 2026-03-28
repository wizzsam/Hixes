<?php

namespace App\Repositories;

use App\Models\Roles;
use Illuminate\Database\Eloquent\Collection;

class RolRepository
{
    public function crear(array $data): Roles
    {
        return Roles::create($data);
    }

    public function obtenerTodos(): Collection
    {
        return Roles::orderBy('id', 'asc')->get();
    }

    public function buscarPorId(int $id): ?Roles
    {
        return Roles::find($id);
    }

    public function actualizar(int $id, array $data): ?Roles
    {
        $rol = $this->buscarPorId($id);
        
        if ($rol) {
            $rol->update($data);
            return $rol;
        }

        return null;
    }

    public function eliminar(int $id): bool
    {
        $rol = $this->buscarPorId($id);
        return $rol ? $rol->delete() : false;
    }
}
