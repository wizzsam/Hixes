<?php

namespace App\Services;

use App\DTOs\Roles\ActualizarRolDTO;
use App\DTOs\Roles\CrearRolDTO;
use App\Repositories\RolRepository;
use App\Models\Roles;
use Illuminate\Database\Eloquent\Collection;

class RolService
{
    public function __construct(
        private readonly RolRepository $rolRepository
    ) {}

    public function crearRol(CrearRolDTO $dto): Roles
    {
        return $this->rolRepository->crear($dto->toArray());
    }

    public function listarRoles(): Collection
    {
        return $this->rolRepository->obtenerTodos();
    }

    public function obtenerRolPorId(int $id): ?Roles
    {
        return $this->rolRepository->buscarPorId($id);
    }

    public function actualizarRol(int $id, ActualizarRolDTO $dto): ?Roles
    {
        $rol = $this->rolRepository->buscarPorId($id);
        
        if (!$rol) {
            return null;
        }

        return $this->rolRepository->actualizar($id, $dto->toArray());
    }

    public function eliminarRol(int $id): bool
    {
        // Posible regla de negocio: ¿se puede eliminar si hay usuarios asociados?
        // Añadir lógica extra aquí si lo consideras necesario
        
        return $this->rolRepository->eliminar($id);
    }
}
