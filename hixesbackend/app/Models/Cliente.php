<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    use HasFactory;

    protected $table = 'clientes';

    protected $fillable = [
        'empresa_id',
        'sede_id',
        'nombre_completo',
        'dni',
        'telefono',
        'correo',
        'estado',
        'wallet',
        'wallet_vence',
        'cashback',
        'cashback_vence',
        'consumo_acumulado',
    ];

    protected $casts = [
        'wallet_vence' => 'datetime',
        'cashback_vence' => 'datetime',
        'wallet' => 'decimal:2',
        'cashback' => 'decimal:2',
        'consumo_acumulado' => 'decimal:2',
        'estado' => 'boolean',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function sede()
    {
        return $this->belongsTo(Sede::class);
    }

    public function transacciones()
    {
        return $this->hasMany(Transaccion::class);
    }
}
