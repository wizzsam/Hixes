<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tareas', function (Blueprint $table) {
            $table->id();

            // Llaves foráneas (al menos una debe estar presente)
            $table->foreignId('oportunidad_id')
                ->nullable()
                ->constrained('oportunidades')
                ->onDelete('cascade');

            $table->foreignId('cliente_id')
                ->nullable()
                ->constrained('clientes')
                ->onDelete('cascade');

            $table->unsignedBigInteger('asignado_a')->nullable();
            $table->foreign('asignado_a')
                ->references('id_usuario')
                ->on('usuarios')
                ->onDelete('set null');

            // Datos
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['pendiente', 'completada'])->default('pendiente');

            // Fechas y notificaciones
            $table->dateTime('fecha_vencimiento');
            $table->unsignedInteger('minutos_aviso')->default(60);
            $table->boolean('notificado')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tareas');
    }
};
