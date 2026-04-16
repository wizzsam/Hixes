<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mensaje_whatsapps', function (Blueprint $table) {
            // Número destino en mensajes outbound (quién es el receptor)
            $table->string('to_phone')->nullable()->after('from_phone');
            // Para rastrear mensajes no leídos por conversación
            $table->boolean('is_read')->default(false)->after('direction');
        });
    }

    public function down(): void
    {
        Schema::table('mensaje_whatsapps', function (Blueprint $table) {
            $table->dropColumn(['to_phone', 'is_read']);
        });
    }
};
