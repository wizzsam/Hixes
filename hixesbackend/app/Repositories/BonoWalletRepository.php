<?php

namespace App\Repositories;

use App\Models\BonoWallet;
use Illuminate\Database\Eloquent\Collection;

class BonoWalletRepository
{
    public function __construct(protected BonoWallet $model) {}

    /**
     * Crea el registro base en la tabla 'bono_wallets'
     */
    public function crear(array $datos): BonoWallet
    {
        return $this->model->create($datos);
    }

    /**
     * Lista todos los bonos incluyendo sus empresas asociadas
     * Ordenado por monto_minimo para mostrar la progresión lógica
     */
    public function listar(): Collection
    {
        return $this->model->with('empresas')
            ->orderBy('monto_minimo', 'asc')
            ->get();
    }

    /**
     * Busca un bono por su ID con sus relaciones cargadas
     */
    public function obtenerPorId(int $id): ?BonoWallet
    {
        return $this->model->with('empresas')->find($id);
    }

    /**
     * Actualiza los datos base del bono (montos y porcentaje)
     */
    public function actualizar(int $id, array $datos): bool
    {
        $bono = $this->model->find($id);
        if (!$bono) return false;
        
        // Usamos fill y save para asegurar que Eloquent detecte los cambios
        $bono->fill($datos);
        return $bono->save(); 
    }

    /**
     * Sincroniza los IDs de empresas en la tabla 'bono_wallet_empresa'
     */
    public function vincularEmpresas(int $bonoId, array $empresaIds): void
    {
        $bono = $this->model->find($bonoId);
        if ($bono) {
            // sync() es ideal para el modal de edición: quita lo viejo y pone lo nuevo
            $bono->empresas()->sync($empresaIds);
        }
    }

    /**
     * Elimina el bono. Recuerda que si usas 'onDelete cascade' en la migración,
     * se limpiará automáticamente la tabla intermedia.
     */
    public function eliminar(int $id): bool
    {
        $bono = $this->model->find($id);
        if (!$bono) return false;
        
        return $bono->delete();
    }
}