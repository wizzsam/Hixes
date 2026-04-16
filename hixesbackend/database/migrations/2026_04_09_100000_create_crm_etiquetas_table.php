<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_etiquetas', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('usuario_id');
            $table->foreign('usuario_id')
                ->references('id_usuario')
                ->on('usuarios')
                ->onDelete('cascade');

            $table->string('nombre', 80);
            $table->string('color', 7)->default('#25D366'); // hex
            $table->text('descripcion')->nullable();

            $table->timestamps();

            $table->unique(['usuario_id', 'nombre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_etiquetas');
    }
};
