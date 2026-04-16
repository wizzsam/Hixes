<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Campana extends Model
{
    protected $fillable = [
        'empresa_id',
        'nombre',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'mensaje_recordatorio',
        'frecuencia_recordatorio',
        'activo',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin'    => 'date',
        'activo'       => 'boolean',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function etapas()
    {
        return $this->hasMany(CampanaEtapa::class)->orderBy('orden');
    }

    public function clientePivots()
    {
        return $this->hasMany(CampanaCliente::class);
    }

    public function clientes()
    {
        return $this->belongsToMany(Cliente::class, 'campana_clientes')
            ->withPivot(['etapa_id', 'recordatorio_enviado_at'])
            ->withTimestamps();
    }

    /** Campaña vigente hoy y con activo=true */
    public function getVigenteAttribute(): bool
    {
        $today = Carbon::today();
        return $this->activo
            && $this->fecha_inicio <= $today
            && $this->fecha_fin    >= $today;
    }
}
