<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Ampliar el enum para soportar cashback individual y expirados
        DB::statement("ALTER TABLE transacciones MODIFY COLUMN tipo ENUM('consumo','recarga_wallet','pago_saldo','cashback','cashback_expirado','wallet_expirado') NOT NULL");

        Schema::table('transacciones', function (Blueprint $table) {
            $table->timestamp('vence_at')->nullable()->after('monto');
            $table->boolean('expirado')->default(false)->after('vence_at');
        });
    }

    public function down(): void
    {
        Schema::table('transacciones', function (Blueprint $table) {
            $table->dropColumn(['vence_at', 'expirado']);
        });

        // Convertir valores que ya no existirán en el enum reducido
        // para evitar el error 1265 (Data truncated) de MySQL
        DB::statement("UPDATE transacciones SET tipo = 'consumo' WHERE tipo IN ('cashback','cashback_expirado','wallet_expirado')");

        DB::statement("ALTER TABLE transacciones MODIFY COLUMN tipo ENUM('consumo','recarga_wallet','pago_saldo') NOT NULL");
    }
};
