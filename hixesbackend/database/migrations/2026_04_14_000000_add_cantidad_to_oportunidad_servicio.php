<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('oportunidad_servicio', function (Blueprint $table) {
            $table->unsignedInteger('cantidad')->default(1)->after('servicio_id');
        });
    }

    public function down(): void
    {
        Schema::table('oportunidad_servicio', function (Blueprint $table) {
            $table->dropColumn('cantidad');
        });
    }
};
