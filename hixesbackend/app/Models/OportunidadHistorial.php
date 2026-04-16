<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OportunidadHistorial extends Model
{
    public $timestamps = false; // solo usamos created_at manual

    protected $table = 'oportunidad_historial';

    protected $fillable = [
        'oportunidad_id',
        'usuario_id',
        'etapa_anterior',
        'etapa_nueva',
        'estado_anterior',
        'estado_nuevo',
        'accion',
        'notas',
        'archivos',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'archivos'   => 'array',
    ];

    public function oportunidad()
    {
        return $this->belongsTo(Oportunidad::class, 'oportunidad_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuarios::class, 'usuario_id', 'id_usuario');
    }
}
