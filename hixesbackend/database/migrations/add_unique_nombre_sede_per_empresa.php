<?php

use Illuminate\Database\Migrations\Migration;

// El índice único (empresa_id, nombre_sede) fue incluido directamente
// en create_sedes_table.php para evitar problemas de orden alfabético.
return new class extends Migration
{
    public function up(): void {}
    public function down(): void {}
};
