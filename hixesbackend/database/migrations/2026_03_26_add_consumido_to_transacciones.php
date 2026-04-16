<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transacciones', function (Blueprint $table) {
            // Usamos ->after('expirado') solo si esa columna ya existe
            // (puede faltar si la migración anterior quedó incompleta)
            if (Schema::hasColumn('transacciones', 'expirado')) {
                $table->boolean('consumido')->default(false)->after('expirado');
            } else {
                $table->boolean('consumido')->default(false);
            }
        });
    }

    public function down(): void
    {
        Schema::table('transacciones', function (Blueprint $table) {
            $table->dropColumn('consumido');
        });
    }
};
