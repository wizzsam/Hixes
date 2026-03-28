<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuarios;
use App\Models\Empresa;
use App\Models\Sede;
use Illuminate\Support\Facades\Hash;

class UsuariosSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin (sin empresa ni sede)
        Usuarios::create([
            'rol_id'          => 1, // SUPER_ADMIN
            'empresa_id'      => null,
            'sede_id'         => null,
            'nombre_completo' => 'Abel Aaron Fernandez Pelaez',
            'correo'          => 'admin@hixes.com',
            'password'        => Hash::make('password'),
            'estado'          => true
        ]);

        // 2. Crear empresa Hixes (columnas reales de la tabla)
        $empresa = Empresa::firstOrCreate(
            ['ruc' => '20123456789'],
            [
                'razon_social'    => 'Hixes SAC',
                'nombre_comercial' => 'Hixes',
                'estado'          => true,
            ]
        );

        // 3. Crear sede Nuevo Chimbote
        $sede = Sede::firstOrCreate(
            ['nombre_sede' => 'Nuevo Chimbote', 'empresa_id' => $empresa->id],
            [
                'direccion_sede' => 'Av. Aviación 123, Nuevo Chimbote',
                'estado'         => true,
            ]
        );

        // 4. Trabajador asignado a esa sede
        Usuarios::create([
            'rol_id'          => 2, // TRABAJADOR
            'empresa_id'      => $empresa->id,
            'sede_id'         => $sede->id,
            'nombre_completo' => 'Abel Trabajador',
            'correo'          => 'abeltrabajador@gmail.com',
            'password'        => Hash::make('abel123'),
            'estado'          => true
        ]);
    }
}