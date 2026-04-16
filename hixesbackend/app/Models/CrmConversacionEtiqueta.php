<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmConversacionEtiqueta extends Model
{
    protected $table = 'crm_conversacion_etiqueta';

    protected $fillable = ['phone', 'etiqueta_id', 'usuario_id'];

    public function etiqueta(): BelongsTo
    {
        return $this->belongsTo(CrmEtiqueta::class, 'etiqueta_id');
    }
}
