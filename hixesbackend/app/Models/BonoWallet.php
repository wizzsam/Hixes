<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BonoWallet extends Model
{
    use HasFactory;

    protected $table = 'bono_wallets';

    protected $fillable = [
        'monto_minimo',
        'monto_maximo',
        'bono_porcentaje'
    ];

    public function empresas()
    {
        return $this->belongsToMany(Empresa::class , 'bono_wallet_empresa', 'bono_wallet_id', 'empresa_id')
            ->withTimestamps();
    }
}