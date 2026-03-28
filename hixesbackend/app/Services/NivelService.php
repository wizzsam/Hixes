<?php

namespace App\Services;

use App\Repositories\NivelRepository;
use App\DTOs\Nivel\CrearNivelDTO;
use App\DTOs\Nivel\ActualizarNivelDTO;

class NivelService
{
    public function __construct(protected NivelRepository $repository) {}

    /**
     * Registra un nuevo nivel y crea las relaciones en la tabla intermedia.
     */
    public function registrarNivel(CrearNivelDTO $dto)
    {
        // 1. Preparamos los datos base del nivel
        $datos = [
            'nombre'              => mb_convert_case(trim($dto->nombre), MB_CASE_UPPER, 'UTF-8'), // Niveles suelen ir en MAYÚSCULAS
            'cashback_porcentaje' => $dto->cashback_porcentaje,
            'vigencia_dias'       => $dto->vigencia_dias,
            'consumo_minimo'      => $dto->consumo_minimo,
            'color'               => $dto->color,
            'icono'               => $dto->icono,
        ];

        // 2. Creamos el registro en la tabla 'niveles'
        $nivel = $this->repository->crear($datos);

        if ($nivel && !empty($dto->empresa_ids)) {
            // 3. Sincronizamos con la tabla intermedia 'empresa_nivel'
            // Tu repositorio debe tener un método para manejar esta relación muchos a muchos
            $this->repository->vincularEmpresas($nivel->id, $dto->empresa_ids);
        }

        return $nivel;
    }

    public function obtenerTodos()
    {
        return $this->repository->listar();
    }

    public function obtenerNivelPorId(int $id)
    {
        return $this->repository->obtenerPorId($id);
    }

    /**
     * Actualiza los datos del nivel y refresca la tabla intermedia si se envían IDs.
     */
   public function actualizarNivel(int $id, ActualizarNivelDTO $dto)
    {
        $nivel = $this->repository->obtenerPorId($id);
        
        if (!$nivel) {
            return null;
        }

        $datos = $dto->toArray();
        if (isset($datos['nombre'])) {
            $datos['nombre'] = mb_convert_case(trim($datos['nombre']), MB_CASE_UPPER, 'UTF-8');
        }

        // 1. Actualizamos datos básicos (ignora el retorno booleano)
        $this->repository->actualizar($id, $datos);

        // 2. Usamos el $id original para vincular las empresas
        if ($dto->empresa_ids !== null) {
            $this->repository->vincularEmpresas($id, $dto->empresa_ids);
        }

        // 3. RETORNAMOS EL OBJETO FRESCO (esto evita el error de "id on bool")
        return $this->repository->obtenerPorId($id);
    }

    public function eliminarNivel(int $id): bool
    {
        // El repositorio debería encargarse de eliminar también las relaciones 
        // en 'empresa_nivel' (o usar ON DELETE CASCADE en la BD)
        return $this->repository->eliminar($id);
    }
    /**
     * Cambia el estado del nivel (Activo/Inactivo)
     */
    public function cambiarEstadoNivel(int $id): bool
    {
        // 1. Buscamos el nivel a través del repositorio
        $nivel = $this->repository->obtenerPorId($id);
        
        if (!$nivel) {
            return false;
        }
        
        // 2. Calculamos el nuevo estado (Toggle: si es 1 pasa a 0 y viceversa)
        $nuevoEstado = !$nivel->estado;
        
        // 3. Persistimos el cambio usando el método actualizar del repositorio
        return $this->repository->actualizar($id, ['estado' => $nuevoEstado]) ? true : false;
    }
}