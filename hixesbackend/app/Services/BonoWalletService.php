<?php

namespace App\Services;

use App\Repositories\BonoWalletRepository;
use App\DTOs\BonoWallet\CrearBonoDTO;
use App\DTOs\BonoWallet\ActualizarBonoDTO;

class BonoWalletService
{
    public function __construct(protected BonoWalletRepository $repository) {}

    /**
     * Registra un nuevo bono de wallet y vincula las empresas asociadas.
     */
    public function registrarBono(CrearBonoDTO $dto)
    {
        // 1. Preparamos los datos base del bono
        $datos = [
            'monto_minimo'    => $dto->monto_minimo,
            'monto_maximo'    => $dto->monto_maximo,
            'bono_porcentaje' => $dto->bono_porcentaje
        ];

        // 2. Creamos el registro en la tabla 'bono_wallets'
        $bono = $this->repository->crear($datos);

        if ($bono && !empty($dto->empresa_ids)) {
            // 3. Sincronizamos con la tabla intermedia 'bono_wallet_empresa'
            $this->repository->vincularEmpresas($bono->id, $dto->empresa_ids);
        }

        // Retornamos el objeto completo con sus relaciones
        return $this->repository->obtenerPorId($bono->id);
    }

    public function obtenerTodos()
    {
        return $this->repository->listar();
    }

    public function obtenerBonoPorId(int $id)
    {
        return $this->repository->obtenerPorId($id);
    }

    /**
     * Actualiza los datos del bono y refresca la relación con empresas.
     */
    public function actualizarBono(int $id, ActualizarBonoDTO $dto)
    {
        $bono = $this->repository->obtenerPorId($id);
        
        if (!$bono) {
            return null;
        }

        // 1. Obtenemos datos del DTO (filtrados de nulos en el DTO)
        $datos = $dto->toArray();

        // 2. Actualizamos datos básicos
        $this->repository->actualizar($id, $datos);

        // 3. Sincronizamos empresas si se enviaron en el request
        if ($dto->empresa_ids !== null) {
            $this->repository->vincularEmpresas($id, $dto->empresa_ids);
        }

        // 4. Retornamos el objeto fresco para evitar errores de hidratación en el front
        return $this->repository->obtenerPorId($id);
    }

    /**
     * Elimina el bono y sus relaciones.
     */
    public function eliminarBono(int $id): bool
    {
        return $this->repository->eliminar($id);
    }

    /**
     * Cambia el estado del bono (Activo 1 / Inactivo 0)
     */
    public function cambiarEstadoBono(int $id): bool
    {
        $bono = $this->repository->obtenerPorId($id);
        
        if (!$bono) {
            return false;
        }
        
        $nuevoEstado = !$bono->estado;
        
        return $this->repository->actualizar($id, ['estado' => $nuevoEstado]);
    }
}