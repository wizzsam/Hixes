<?php

namespace App\Repositories;

use App\Models\Sede;

class SedeRepository
{
    public function crear(array $data)
    {
        return Sede::create($data);
    }

    public function listar($empresaId = null)
    {
        $query = Sede::with('empresa:id,razon_social')->orderBy('id', 'desc');
        if ($empresaId) {
            $query->where('empresa_id', $empresaId);
        }
        return $query->get();
    }
    
    public function obtenerPorId($id)
    {
        return Sede::with('empresa')->find($id);
    }

    public function actualizar($id, array $data)
    {
        $sede = $this->obtenerPorId($id);
        if ($sede) {
            $sede->update($data);
            return $sede;
        }
        return null;
    }

    public function eliminar($id)
    {
        $sede = $this->obtenerPorId($id);
        return $sede ? $sede->delete() : false;
    }
}