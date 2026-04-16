<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampanaCliente extends Model
{
    protected $table = 'campana_clientes';

    protected $fillable = [
        'campana_id',
        'cliente_id',
        'etapa_id',
        'recordatorio_enviado_at',
    ];

    protected $casts = [
        'recordatorio_enviado_at' => 'datetime',
    ];

    public function campana()
    {
        return $this->belongsTo(Campana::class);
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function etapa()
    {
        return $this->belongsTo(CampanaEtapa::class, 'etapa_id');
    }
}
