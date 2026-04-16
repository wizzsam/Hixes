<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PipelineEtapa extends Model
{
    protected $table = 'pipeline_etapas';

    protected $fillable = [
        'nombre',
        'orden',
        'color',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden'  => 'integer',
    ];

    public function scopeActivas($query)
    {
        return $query->where('activo', true)->orderBy('orden');
    }
}
