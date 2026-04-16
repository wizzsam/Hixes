<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MensajeWhatsapp extends Model
{
    use HasFactory;

    // Nombre de la tabla (opcional si sigues la convención de Laravel)
    protected $table = 'mensaje_whatsapps';

    // Campos que permitimos llenar de forma masiva
    protected $fillable = [
        'from_phone',
        'to_phone',
        'message_body',
        'message_sid',
        'direction',
        'is_read',
        'media_url',
        'media_type',
        'vendedor_asignado_id',
    ];

    /**
     * Opcional: Si quieres que Laravel trate las fechas 
     * de una forma específica para tu CRM en React.
     */
    protected $casts = [
        'created_at' => 'datetime:Y-m-d H:i:s',
        'is_read'    => 'boolean',
    ];
}