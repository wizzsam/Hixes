<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Empresa;

class BonoWalletSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $empresa = Empresa::first();
        if (!$empresa) {
            $this->command->warn('No hay empresas registradas para asignar bonos. Crea una empresa primero.');
            return;
        }

        // Limpiamos los bonos anteriores de la empresa para evitar solapamiento de rangos
        DB::table('bono_wallets')->where('empresa_id', $empresa->id)->delete();

        $bonos = [
            [
                'empresa_id' => $empresa->id,
                'monto_minimo' => 1.00,
                'monto_maximo' => 299.99,
                'bono_porcentaje' => 3.00,
            ],
            [
                'empresa_id' => $empresa->id,
                'monto_minimo' => 300.00,
                'monto_maximo' => 499.99,
                'bono_porcentaje' => 5.00,
            ],
            [
                'empresa_id' => $empresa->id,
                'monto_minimo' => 500.00,
                'monto_maximo' => 999.99,
                'bono_porcentaje' => 8.00,
            ],
            [
                'empresa_id' => $empresa->id,
                'monto_minimo' => 1000.00,
                'monto_maximo' => 1999.99,
                'bono_porcentaje' => 10.00,
            ],
            [
                'empresa_id' => $empresa->id,
                'monto_minimo' => 2000.00,
                'monto_maximo' => null,
                'bono_porcentaje' => 12.00,
            ],
        ];

        foreach ($bonos as $bono) {
            DB::table('bono_wallets')->insert($bono);
        }
    }
}
