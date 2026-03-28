<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sede extends Model
{
    use HasFactory;

    protected $table = 'sedes';
    protected $fillable = ['empresa_id', 'nombre_sede', 'direccion_sede', 'estado'];

    protected function casts(): array
    {
        return [
            'estado' => 'boolean',
        ];
    }

    public function empresa() {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function usuarios(): HasMany
    {
        return $this->hasMany(Usuarios::class, 'sede_id', 'id');
    }
}