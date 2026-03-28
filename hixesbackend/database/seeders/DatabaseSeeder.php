<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
// Eliminamos el uso de App\Models\User ya que usas Usuarios

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // El orden es vital: primero los Roles, luego los Usuarios
        $this->call([
            RolesSeeder::class,
            UsuariosSeeder::class,
        ]);
    }
}