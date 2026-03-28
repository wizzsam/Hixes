<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bono_wallets', function (Blueprint $table) {
            // Añadimos la etiqueta descriptiva del rango (ej: "Cliente VIP", "Rango Oro")
            $table->string('beneficio')->nullable()->after('bono_porcentaje');
        });
    }

    public function down(): void
    {
        Schema::table('bono_wallets', function (Blueprint $table) {
            $table->dropColumn('beneficio');
        });
    }
};
