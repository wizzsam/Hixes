<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recordatorios_cashback', function (Blueprint $table) {
            $table->enum('tipo_saldo', ['cashback', 'wallet', 'ambos'])
                  ->default('cashback')
                  ->after('empresa_id');
        });

        Schema::table('clientes', function (Blueprint $table) {
            $table->timestamp('wallet_recordatorio_at')->nullable()->after('cashback_recordatorio_at');
        });
    }

    public function down(): void
    {
        Schema::table('recordatorios_cashback', function (Blueprint $table) {
            $table->dropColumn('tipo_saldo');
        });

        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn('wallet_recordatorio_at');
        });
    }
};
