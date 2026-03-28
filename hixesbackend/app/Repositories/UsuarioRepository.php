<?php

namespace App\Repositories;

use App\Models\Usuarios;
use Illuminate\Database\Eloquent\Collection;

class UsuarioRepository
{
    public function crear(array $data): Usuarios
    {
        $sedeIds = $data['sede_ids'] ?? [];
        unset($data['sede_ids']);
        $usuario = Usuarios::create($data);
        if (!empty($sedeIds)) {
            $usuario->sedes()->sync($sedeIds);
        }
        return $usuario->load(['empresa', 'rol', 'sedes']);
    }

    public function obtenerTodos(): Collection
    {
        return Usuarios::with(['empresa', 'rol', 'sedes'])->orderBy('id_usuario', 'desc')->get();
    }

    public function buscarPorId(int $id): ?Usuarios
    {
        return Usuarios::with(['empresa', 'rol', 'sedes'])->find($id);
    }

    public function actualizar(int $id, array $data): ?Usuarios
    {
        $usuario = Usuarios::with(['empresa', 'rol', 'sedes'])->find($id);

        if ($usuario) {
            $sedeIds = $data['sede_ids'] ?? null;
            unset($data['sede_ids']);
            $usuario->update($data);
            if ($sedeIds !== null) {
                $usuario->sedes()->sync($sedeIds);
            }
            return $usuario->fresh(['empresa', 'rol', 'sedes']);
        }

        return null;
    }

    public function eliminar(int $id): bool
    {
        $usuario = $this->buscarPorId($id);
        return $usuario ? $usuario->delete() : false;
    }
}