<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Nivel extends Model
{
    use HasFactory;

    protected $table = 'niveles';

    protected $fillable = [
        'nombre',
        'cashback_porcentaje',
        'vigencia_dias',
        'consumo_minimo',
        'color',
        'icono',
    ];

    public function empresas()
    {
        return $this->belongsToMany(Empresa::class, 'empresa_nivel');
    }
}
