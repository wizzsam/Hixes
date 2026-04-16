<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campana_etapas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campana_id')->constrained('campanas')->onDelete('cascade');
            $table->string('nombre');
            $table->integer('orden')->default(0);
            $table->string('color', 20)->default('#64748b');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campana_etapas');
    }
};
