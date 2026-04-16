<?php

namespace App\Repositories;

use App\Models\Usuarios;
use Illuminate\Database\Eloquent\Collection;

class UsuarioRepository
{
    public function crear(array $data): Usuarios
    {
        $sedeIds = $data['sede_ids'] ?? [];
        $rolIds  = $data['rol_ids']  ?? [];
        unset($data['sede_ids'], $data['rol_ids']);

        $usuario = Usuarios::create($data);

        if (!empty($sedeIds)) {
            $usuario->sedes()->sync($sedeIds);
        }
        if (!empty($rolIds)) {
            $usuario->roles()->sync($rolIds);
        }

        return $usuario->load(['empresa', 'rol', 'roles', 'sedes']);
    }

    public function obtenerTodos(): Collection
    {
        return Usuarios::with(['empresa', 'rol', 'roles', 'sedes'])->orderBy('id_usuario', 'desc')->get();
    }

    public function buscarPorId(int $id): ?Usuarios
    {
        return Usuarios::with(['empresa', 'rol', 'roles', 'sedes'])->find($id);
    }

    public function actualizar(int $id, array $data): ?Usuarios
    {
        $usuario = Usuarios::with(['empresa', 'rol', 'roles', 'sedes'])->find($id);

        if ($usuario) {
            $sedeIds = $data['sede_ids'] ?? null;
            $rolIds  = $data['rol_ids']  ?? null;
            unset($data['sede_ids'], $data['rol_ids']);

            $usuario->update($data);

            if ($sedeIds !== null) {
                $usuario->sedes()->sync($sedeIds);
            }
            if ($rolIds !== null) {
                $usuario->roles()->sync($rolIds);
            }

            return $usuario->fresh(['empresa', 'rol', 'roles', 'sedes']);
        }

        return null;
    }

    public function eliminar(int $id): bool
    {
        $usuario = $this->buscarPorId($id);
        return $usuario ? $usuario->delete() : false;
    }
}