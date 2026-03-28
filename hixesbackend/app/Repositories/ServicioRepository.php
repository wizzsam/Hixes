<?php

namespace App\Repositories;

use App\Models\Servicio;
use Illuminate\Database\Eloquent\Collection;

class ServicioRepository
{
    /**
     * Crea un nuevo registro de servicio
     */
    public function crear(array $data): Servicio
    {
        return Servicio::create($data);
    }

    /**
     * Obtiene todos los servicios ordenados por el más reciente
     */
    public function obtenerTodos(): Collection
    {
        return Servicio::orderBy('id', 'desc')->get();
    }

    /**
     * Busca un servicio específico por su ID
     */
    public function buscarPorId(int $id): ?Servicio
    {
        return Servicio::find($id);
    }

    /**
     * Actualiza los datos de un servicio existente
     */
    public function actualizar(int $id, array $data): ?Servicio
    {
        $servicio = $this->buscarPorId($id);
        
        if ($servicio) {
            $servicio->update($data);
            return $servicio;
        }

        return null;
    }

    /**
     * Elimina un servicio de la base de datos
     */
    public function eliminar(int $id): bool
    {
        $servicio = $this->buscarPorId($id);
        return $servicio ? (bool)$servicio->delete() : false;
    }

    /**
     * Método extra: Obtener solo servicios activos
     * Útil para cuando el cliente reserva una cita en el Front
     */
    public function obtenerActivos(): Collection
    {
        return Servicio::where('estado', true)
            ->orderBy('tratamiento', 'asc')
            ->get();
    }
}