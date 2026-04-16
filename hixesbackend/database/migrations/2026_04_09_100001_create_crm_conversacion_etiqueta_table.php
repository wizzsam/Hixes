<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_conversacion_etiqueta', function (Blueprint $table) {
            $table->id();

            $table->string('phone', 30);

            $table->foreignId('etiqueta_id')
                ->constrained('crm_etiquetas')
                ->onDelete('cascade');

            $table->unsignedBigInteger('usuario_id');
            $table->foreign('usuario_id')
                ->references('id_usuario')
                ->on('usuarios')
                ->onDelete('cascade');

            $table->timestamps();

            $table->unique(['phone', 'etiqueta_id', 'usuario_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_conversacion_etiqueta');
    }
};
