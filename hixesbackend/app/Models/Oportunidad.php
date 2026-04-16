<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Oportunidad extends Model
{
    use HasFactory;

    protected $table = 'oportunidades';

    protected $fillable = [
        'cliente_id',
        'vendedor_id',
        'titulo',
        'descripcion',
        'fecha_proxima',
        'valor_estimado',
        'etapa',
        'estado',
    ];

    protected $casts = [
        'valor_estimado' => 'decimal:2',
        'fecha_proxima'  => 'datetime',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function vendedor()
    {
        return $this->belongsTo(Usuarios::class, 'vendedor_id', 'id_usuario');
    }

    public function servicios()
    {
        return $this->belongsToMany(Servicio::class, 'oportunidad_servicio')
                    ->withPivot('cantidad');
    }
}
