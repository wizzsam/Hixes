<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaccion extends Model
{
    use HasFactory;

    protected $table = 'transacciones';

    protected $fillable = [
        'cliente_id',
        'sede_id',
        'tipo',
        'descripcion',
        'monto',
        'vence_at',
        'expirado',
        'consumido',
        'recordatorio_at',
    ];

    protected $casts = [
        'monto'           => 'decimal:2',
        'vence_at'        => 'datetime',
        'recordatorio_at' => 'datetime',
        'expirado'        => 'boolean',
        'consumido'       => 'boolean',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function sede()
    {
        return $this->belongsTo(Sede::class);
    }
}
