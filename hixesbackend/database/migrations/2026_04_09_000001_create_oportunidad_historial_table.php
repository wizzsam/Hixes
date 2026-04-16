<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('oportunidad_historial', function (Blueprint $table) {
            $table->id();

            $table->foreignId('oportunidad_id')
                ->constrained('oportunidades')
                ->onDelete('cascade');

            // Usuario que realizó el movimiento (nullable por si se hace desde un proceso interno)
            $table->unsignedBigInteger('usuario_id')->nullable();
            $table->foreign('usuario_id')
                ->references('id_usuario')
                ->on('usuarios')
                ->onDelete('set null');

            $table->string('etapa_anterior')->nullable();
            $table->string('etapa_nueva');
            $table->string('estado_anterior')->nullable();
            $table->string('estado_nuevo')->nullable();

            // Tipo de acción para poder filtrar: 'cambio_etapa' | 'cambio_estado' | 'creacion'
            $table->string('accion')->default('cambio_etapa');
            $table->text('notas')->nullable();

            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oportunidad_historial');
    }
};
