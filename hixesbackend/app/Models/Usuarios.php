<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Usuarios extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $table = 'usuarios';

    protected $primaryKey = 'id_usuario';

    protected $fillable = [
        'empresa_id',
        'sede_id',
        'rol_id',
        'nombre_completo',
        'correo',
        'password',
        'estado',
        'sesion_activa',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password'      => 'hashed',
            'estado'        => 'boolean',
            'sesion_activa' => 'boolean',
        ];
    }

    public function getAuthPassword()
    {
        return $this->password;
    }

    public function getAuthIdentifierName()
    {
        return 'id_usuario';
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'nombre_completo' => $this->nombre_completo,
            'correo'          => $this->correo,
            'rol_id'          => $this->rol_id,
            'empresa_id'      => $this->empresa_id,
            'sede_id'         => $this->sede_id,
        ];
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Roles::class, 'rol_id', 'id');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Roles::class, 'usuario_roles', 'usuario_id', 'rol_id');
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id', 'id');
    }

    public function sede(): BelongsTo
    {
        return $this->belongsTo(Sede::class, 'sede_id', 'id');
    }

    public function sedes(): BelongsToMany
    {
        return $this->belongsToMany(Sede::class, 'usuario_sede', 'usuario_id', 'sede_id');
    }

    public function asignacionesChat()
    {
        return $this->hasMany(CrmAsignacionChat::class, 'vendedor_id', 'id_usuario');
    }
}
