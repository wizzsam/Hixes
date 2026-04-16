<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('oportunidades', function (Blueprint $table) {
            $table->text('descripcion')->nullable()->after('titulo');
            $table->dateTime('fecha_proxima')->nullable()->after('descripcion');
        });

        Schema::create('oportunidad_servicio', function (Blueprint $table) {
            $table->id();
            $table->foreignId('oportunidad_id')->constrained('oportunidades')->onDelete('cascade');
            $table->foreignId('servicio_id')->constrained('servicios')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['oportunidad_id', 'servicio_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oportunidad_servicio');
        Schema::table('oportunidades', function (Blueprint $table) {
            $table->dropColumn(['descripcion', 'fecha_proxima']);
        });
    }
};
