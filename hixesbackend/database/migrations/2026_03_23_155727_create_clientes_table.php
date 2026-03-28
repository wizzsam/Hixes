<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->string('nombre_completo');
            $table->string('dni')->nullable();
            $table->string('telefono')->nullable();
            $table->decimal('wallet', 10, 2)->default(0);
            $table->timestamp('wallet_vence')->nullable();
            $table->decimal('cashback', 10, 2)->default(0);
            $table->timestamp('cashback_vence')->nullable();
            $table->decimal('consumo_acumulado', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
