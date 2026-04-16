<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecordatorioCashback extends Model
{
    use HasFactory;

    protected $table = 'recordatorios_cashback';

    protected $fillable = [
        'empresa_id',
        'tipo_saldo',
        'canal',
        'mensaje_plantilla',
        'dias_antes',
        'activo',
    ];

    protected $casts = [
        'activo'     => 'boolean',
        'dias_antes' => 'integer',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }
}
