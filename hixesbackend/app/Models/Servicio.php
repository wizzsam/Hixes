<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    use HasFactory;

    protected $table = 'servicios';

    protected $primaryKey = 'id';

    protected $fillable = [
        'tratamiento',
        'descripcion',
        'precio_base',
        'estado'
    ];

    /**
     * Ocultamos los timestamps en las respuestas JSON por defecto
     * para mantener la respuesta limpia.
     */
    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    /**
     * Casteo de atributos para asegurar tipos de datos correctos
     */
    protected function casts(): array
    {
        return [
            'precio_base' => 'decimal:2',
            'estado'      => 'boolean',
        ];
    }

    /**
     * Si en el futuro los servicios pertenecen a una empresa específica
     * o tienen categorías, aquí añadiríamos las relaciones.
     */
}