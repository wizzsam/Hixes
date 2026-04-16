<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pipeline_etapas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique();
            $table->integer('orden')->default(0);
            $table->string('color', 20)->default('#64748b');
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // Seed con las etapas actuales hardcodeadas en el sistema
        DB::table('pipeline_etapas')->insert([
            ['nombre' => 'Nuevo lead',          'orden' => 1, 'color' => '#3b82f6', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Contactado',           'orden' => 2, 'color' => '#8b5cf6', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Cotización enviada',   'orden' => 3, 'color' => '#f59e0b', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Negociación',          'orden' => 4, 'color' => '#ef4444', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Venta cerrada',        'orden' => 5, 'color' => '#10b981', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Oportunidad perdida',   'orden' => 6, 'color' => '#6b7280', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('pipeline_etapas');
    }
};
