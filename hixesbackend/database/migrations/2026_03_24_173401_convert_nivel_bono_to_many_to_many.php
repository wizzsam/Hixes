<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Crear tabla empresa_nivel
        Schema::create('empresa_nivel', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->foreignId('nivel_id')->constrained('niveles')->onDelete('cascade');
            $table->timestamps();
        });

        // 2. Crear tabla bono_wallet_empresa
        Schema::create('bono_wallet_empresa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->foreignId('bono_wallet_id')->constrained('bono_wallets')->onDelete('cascade');
            $table->timestamps();
        });

        // 3. Migrar datos existentes (Niveles) a pivot
        $niveles = DB::table('niveles')->get();
        foreach ($niveles as $nivel) {
            if ($nivel->empresa_id) {
                DB::table('empresa_nivel')->insert([
                    'empresa_id' => $nivel->empresa_id,
                    'nivel_id' => $nivel->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 4. Migrar datos existentes (BonoWallets) a pivot
        $bonos = DB::table('bono_wallets')->get();
        foreach ($bonos as $bono) {
            if ($bono->empresa_id) {
                DB::table('bono_wallet_empresa')->insert([
                    'empresa_id' => $bono->empresa_id,
                    'bono_wallet_id' => $bono->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 5. Eliminar columnas empresa_id de las tablas originales
        Schema::table('niveles', function (Blueprint $table) {
            $table->dropForeign('niveles_empresa_id_foreign');
            $table->dropColumn('empresa_id');
        });

        Schema::table('bono_wallets', function (Blueprint $table) {
            $table->dropForeign('bono_wallets_empresa_id_foreign');
            $table->dropColumn('empresa_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('niveles', function (Blueprint $table) {
            $table->foreignId('empresa_id')->nullable()->constrained('empresas')->onDelete('cascade');
        });

        Schema::table('bono_wallets', function (Blueprint $table) {
            $table->foreignId('empresa_id')->nullable()->constrained('empresas')->onDelete('cascade');
        });

        Schema::dropIfExists('bono_wallet_empresa');
        Schema::dropIfExists('empresa_nivel');
    }
};
