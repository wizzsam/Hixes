<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('oportunidad_historial', function (Blueprint $table) {
            $table->json('archivos')->nullable()->after('notas');
        });
    }

    public function down(): void
    {
        Schema::table('oportunidad_historial', function (Blueprint $table) {
            $table->dropColumn('archivos');
        });
    }
};
