<?php

namespace App\Repositories;

use App\Models\Nivel;
use Illuminate\Database\Eloquent\Collection;

class NivelRepository
{
    public function __construct(protected Nivel $model) {}

    /**
     * Crea el nivel básico en la tabla 'niveles'
     */
    public function crear(array $datos): Nivel
    {
        return $this->model->create($datos);
    }

    /**
     * Lista todos los niveles incluyendo sus empresas asociadas
     * (Eager Loading para que el Response funcione rápido)
     */
    public function listar(): Collection
    {
        return $this->model->with('empresas')
            ->orderBy('consumo_minimo', 'asc')
            ->get();
    }

    /**
     * Busca un nivel por su ID con sus relaciones
     */
    public function obtenerPorId(int $id): ?Nivel
    {
        return $this->model->with('empresas')->find($id);
    }

    /**
     * Actualiza los datos base del nivel
     */
   public function actualizar(int $id, array $datos): bool
{
    $nivel = $this->model->find($id);
    if (!$nivel) return false;
    
    // Usamos fill y save para asegurar que Eloquent marque los campos como "dirty"
    $nivel->fill($datos);
    return $nivel->save(); 
}
    /**
     * EL CORAZÓN DE LA RELACIÓN MUCHOS A MUCHOS
     * Sincroniza los IDs de empresas en la tabla 'empresa_nivel'
     */
    public function vincularEmpresas(int $nivelId, array $empresaIds): void
    {
        $nivel = $this->model->find($nivelId);
        if ($nivel) {
            // sync() elimina las relaciones viejas y pone las nuevas. 
            // Es perfecto para el Modal de Edición.
            $nivel->empresas()->sync($empresaIds);
        }
    }

    public function eliminar(int $id): bool
    {
        $nivel = $this->model->find($id);
        if (!$nivel) return false;
        
        // Al eliminar el nivel, Laravel limpiará automáticamente la intermedia 
        // si tienes configurado el 'onDelete cascade' en la migración.
        return $nivel->delete();
    }
}