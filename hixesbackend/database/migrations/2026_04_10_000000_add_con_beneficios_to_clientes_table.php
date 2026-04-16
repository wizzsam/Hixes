<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->boolean('con_beneficios')->default(false)->after('estado');
        });

        // Los clientes ya existentes pertenecen al sistema de beneficios (cashback/wallet)
        DB::table('clientes')->update(['con_beneficios' => true]);
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn('con_beneficios');
        });
    }
};
