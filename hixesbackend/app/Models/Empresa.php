<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Empresa extends Model
{
    use HasFactory;

    protected $table = 'empresas';

    protected $primaryKey = 'id';

    protected $fillable = [
        'ruc',
        'razon_social',
        'nombre_comercial',
        'direccion',
        'telefono',
        'logo_path',
        'estado'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    protected function casts(): array
    {
        return [
            'estado' => 'boolean',
        ];
    }

    public function usuarios(): HasMany
    {
        return $this->hasMany(Usuarios::class, 'empresa_id', 'id');
    }

    public function sedes(): HasMany
    {
        return $this->hasMany(Sede::class, 'empresa_id', 'id');
    }

    public function niveles(): BelongsToMany
    {
        return $this->belongsToMany(Nivel::class, 'empresa_nivel');
    }

    public function bonoWallets(): BelongsToMany
    {
        return $this->belongsToMany(BonoWallet::class, 'bono_wallet_empresa');
    }
}