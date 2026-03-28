<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Roles extends Model
{
    use HasFactory;

    protected $table = 'roles';

    protected $primaryKey = 'id';

    public $timestamps = false; // Asumo que no tienes created_at / updated_at en roles por defecto, si los tienes ponlo en true.

    protected $fillable = [
        'nombre_rol',
        'descripcion',
    ];

    public function usuarios(): HasMany
    {
        return $this->hasMany(Usuarios::class, 'rol_id', 'id');
    }
}
