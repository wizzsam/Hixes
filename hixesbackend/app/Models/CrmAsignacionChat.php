<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrmAsignacionChat extends Model
{
    protected $table = 'crm_asignaciones_chat';

    protected $fillable = [
        'contact_phone',
        'vendedor_id',
        'estado',
    ];

    public function vendedor()
    {
        return $this->belongsTo(Usuarios::class, 'vendedor_id', 'id_usuario');
    }
}
