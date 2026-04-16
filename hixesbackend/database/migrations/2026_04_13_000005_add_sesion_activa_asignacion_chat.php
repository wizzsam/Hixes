<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Estado de sesión del vendedor en tabla usuarios
        Schema::table('usuarios', function (Blueprint $table) {
            $table->boolean('sesion_activa')->default(false)->after('estado');
        });

        // 2. Asignación de vendedor a conversaciones de WhatsApp
        Schema::table('mensaje_whatsapps', function (Blueprint $table) {
            $table->unsignedBigInteger('vendedor_asignado_id')->nullable()->after('is_read');
            $table->foreign('vendedor_asignado_id')
                ->references('id_usuario')->on('usuarios')->onDelete('set null');
        });

        // 3. Tabla de asignaciones de conversación (una por número de teléfono)
        Schema::create('crm_asignaciones_chat', function (Blueprint $table) {
            $table->id();
            $table->string('contact_phone');        // número del contacto externo
            $table->unsignedBigInteger('vendedor_id');
            $table->foreign('vendedor_id')->references('id_usuario')->on('usuarios')->onDelete('cascade');
            $table->enum('estado', ['activo', 'liberado'])->default('activo');
            $table->timestamps();
            $table->unique('contact_phone');        // un contacto siempre asignado a un vendedor
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_asignaciones_chat');
        Schema::table('mensaje_whatsapps', function (Blueprint $table) {
            $table->dropForeign(['vendedor_asignado_id']);
            $table->dropColumn('vendedor_asignado_id');
        });
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn('sesion_activa');
        });
    }
};
