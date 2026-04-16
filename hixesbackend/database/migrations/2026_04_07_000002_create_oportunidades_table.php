<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('oportunidades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->unsignedBigInteger('vendedor_id')->nullable();
            $table->foreign('vendedor_id')->references('id_usuario')->on('usuarios')->onDelete('set null');
            $table->string('titulo');
            $table->decimal('valor_estimado', 10, 2)->default(0);
            $table->string('etapa')->default('Nuevo lead');
            $table->enum('estado', ['abierta', 'ganada', 'perdida'])->default('abierta');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oportunidades');
    }
};
