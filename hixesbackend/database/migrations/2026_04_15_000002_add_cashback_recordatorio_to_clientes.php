<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            // Timestamp de cuándo se envió el último recordatorio de cashback.
            // NULL = nunca se ha enviado.
            // Cuando cashback_vence se extienda, la condición en el comando
            // detectará que DATE_SUB(cashback_vence, dias_antes) > cashback_recordatorio_at
            // y volverá a enviar en la próxima ventana.
            $table->timestamp('cashback_recordatorio_at')->nullable()->after('cashback_vence');
        });
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn('cashback_recordatorio_at');
        });
    }
};
