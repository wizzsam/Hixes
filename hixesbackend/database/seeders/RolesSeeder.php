<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Roles; // Tu modelo de Roles

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        Roles::create([
            'id' => 1,
            'nombre_rol' => 'SUPER_ADMIN',
            'descripcion' => 'Administrador total del sistema Hixes'
        ]);
        
        Roles::create([
            'id' => 2,
            'nombre_rol' => 'ADMIN_EMPRESA',
            'descripcion' => 'Administrador de una empresa específica'
        ]);
    }
}