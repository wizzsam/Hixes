<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmEtiqueta extends Model
{
    protected $table = 'crm_etiquetas';

    protected $fillable = ['usuario_id', 'nombre', 'color', 'descripcion'];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuarios::class, 'usuario_id', 'id_usuario');
    }
}
