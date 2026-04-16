<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampanaEtapa extends Model
{
    protected $fillable = ['campana_id', 'nombre', 'orden', 'color'];

    public function campana()
    {
        return $this->belongsTo(Campana::class);
    }

    public function clientePivots()
    {
        return $this->hasMany(CampanaCliente::class, 'etapa_id');
    }
}
