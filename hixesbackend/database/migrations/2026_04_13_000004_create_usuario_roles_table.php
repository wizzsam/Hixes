<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuario_roles', function (Blueprint $table) {
            $table->unsignedBigInteger('usuario_id');
            $table->unsignedBigInteger('rol_id');
            $table->primary(['usuario_id', 'rol_id']);

            $table->foreign('usuario_id')->references('id_usuario')->on('usuarios')->onDelete('cascade');
            $table->foreign('rol_id')->references('id')->on('roles')->onDelete('cascade');
        });

        // Migrar datos existentes: copiar el rol_id actual de cada usuario a la tabla pivot
        DB::statement('INSERT INTO usuario_roles (usuario_id, rol_id) SELECT id_usuario, rol_id FROM usuarios WHERE rol_id IS NOT NULL');
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario_roles');
    }
};
