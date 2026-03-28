<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// sede_id ya fue incluido directamente en create_usuarios_table.php
// Esta migración se mantiene vacía para no generar conflictos de orden.
return new class extends Migration
{
    public function up(): void {}
    public function down(): void {}
};
