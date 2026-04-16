<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tarea extends Model
{
    use HasFactory;

    protected $table = 'tareas';

    protected $fillable = [
        'oportunidad_id',
        'cliente_id',
        'asignado_a',
        'titulo',
        'descripcion',
        'estado',
        'fecha_vencimiento',
        'minutos_aviso',
        'notificado',
    ];

    protected $casts = [
        'fecha_vencimiento' => 'datetime',
        'notificado'        => 'boolean',
        'minutos_aviso'     => 'integer',
    ];

    public function oportunidad()
    {
        return $this->belongsTo(Oportunidad::class, 'oportunidad_id');
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function asignado()
    {
        return $this->belongsTo(Usuarios::class, 'asignado_a', 'id_usuario');
    }
}
