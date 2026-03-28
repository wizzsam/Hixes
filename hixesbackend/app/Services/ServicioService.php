<?php

namespace App\Services;

use App\DTOs\Servicio\ActualizarServicioDTO;
use App\DTOs\Servicio\CrearServicioDTO;
use App\Repositories\ServicioRepository;
use App\Models\Servicio;
use Illuminate\Database\Eloquent\Collection;

class ServicioService
{
    public function __construct(
        private readonly ServicioRepository $servicioRepository
    ) {}

    /**
     * Lógica para registrar un nuevo servicio
     */
    public function crearServicio(CrearServicioDTO $dto): Servicio
    {
        return $this->servicioRepository->crear($dto->toArray());
    }

    /**
     * Obtiene la lista completa de servicios (Tratamientos)
     */
    public function obtenerTodos(): Collection
    {
        return $this->servicioRepository->obtenerTodos();
    }

    /**
     * Busca un servicio por su ID primario
     */
    public function obtenerPorId(int $id): ?Servicio
    {
        return $this->servicioRepository->buscarPorId($id);
    }

    /**
     * Actualiza los datos de un servicio validando su existencia previa
     */
    public function actualizarServicio(int $id, ActualizarServicioDTO $dto): ?Servicio
    {
        $servicio = $this->servicioRepository->buscarPorId($id);
        
        if (!$servicio) {
            return null;
        }

        return $this->servicioRepository->actualizar($id, $dto->toArray());
    }

    /**
     * Cambia el estado (Toggle: Activo/Inactivo) del servicio
     */
    public function cambiarEstadoServicio(int $id): bool
    {
        $servicio = $this->servicioRepository->buscarPorId($id);
        
        if (!$servicio) {
            return false;
        }

        $nuevoEstado = !$servicio->estado;
        
        return $this->servicioRepository->actualizar($id, ['estado' => $nuevoEstado]) ? true : false;
    }

    /**
     * Lógica para eliminar un servicio
     */
    public function eliminarServicio(int $id): bool
    {
        return $this->servicioRepository->eliminar($id);
    }
}