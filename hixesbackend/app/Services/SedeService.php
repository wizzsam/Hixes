<?php

namespace App\Services;

use App\Repositories\SedeRepository;
use App\DTOs\Sede\CrearSedeDTO;

class SedeService
{
    public function __construct(protected SedeRepository $repository) {}

    public function registrarSede(CrearSedeDTO $dto)
    {
        $datos = (array) $dto;
        $datos['nombre_sede'] = mb_convert_case(trim($datos['nombre_sede']), MB_CASE_TITLE, 'UTF-8');
        return $this->repository->crear($datos);
    }

    public function obtenerTodas($empresaId = null)
    {
        return $this->repository->listar($empresaId);
    }

    public function obtenerSedePorId(int $id)
    {
        return $this->repository->obtenerPorId($id);
    }

    public function actualizarSede(int $id, \App\DTOs\Sede\ActualizarSedeDTO $dto)
    {
        $sede = $this->repository->obtenerPorId($id);
        
        if (!$sede) {
            return null;
        }

        $datos = $dto->toArray();
        if (isset($datos['nombre_sede'])) {
            $datos['nombre_sede'] = mb_convert_case(trim($datos['nombre_sede']), MB_CASE_TITLE, 'UTF-8');
        }
        return $this->repository->actualizar($id, $datos);
    }

    public function eliminarSede(int $id): bool
    {
        return $this->repository->eliminar($id);
    }

    public function cambiarEstadoSede(int $id): bool
    {
        $sede = $this->repository->obtenerPorId($id);
        
        if (!$sede) {
            return false;
        }
        
        $nuevoEstado = !$sede->estado;
        
        return $this->repository->actualizar($id, ['estado' => $nuevoEstado]) ? true : false;
    }
}