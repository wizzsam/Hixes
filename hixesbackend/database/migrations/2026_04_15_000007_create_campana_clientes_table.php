<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campana_clientes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->onDelete('cascade');
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->foreignId('etapa_id')->nullable()->constrained('campana_etapas')->onDelete('set null');
            $table->timestamp('recordatorio_enviado_at')->nullable();
            $table->timestamps();
            $table->unique(['campana_id', 'cliente_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campana_clientes');
    }
};
